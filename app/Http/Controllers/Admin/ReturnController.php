<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ReturnOrder;
use App\Models\InventoryMovement;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ReturnController extends Controller
{
  /**
   * STAGE 1: The Request (Validation)
   * Admin creates the request record after talking to the customer.
   */
  public function storeRequest(Request $request)
  {
    return DB::transaction(function () use ($request) {
      $return = ReturnOrder::create([
        'order_id' => $request->order_id,
        'user_id' => auth()->id(),
        'return_number' => 'RET-' . time(),
        'status' => 'approved', // Validated and waiting for mail
      ]);

      foreach ($request->items as $item) {
        $return->items()->create([
          'product_variant_id' => $item['variant_id'],
          'quantity' => $item['quantity'],
        ]);
      }
      return redirect()->back()->with('success', 'Return authorized.');
    });
  }

  /**
   * STAGE 2: The Arrival (Receipt)
   * The box is at the door. We mark it as "Quarantine" in the Ledger.
   */
  public function receivePackage(ReturnOrder $return)
  {
    return DB::transaction(function () use ($return) {
      foreach ($return->items as $item) {
        // LEDGER ENTRY: Move into the building, but stay in Quarantine
        InventoryMovement::create([
          'product_variant_id' => $item->product_variant_id,
          'user_id' => auth()->id(),
          'quantity' => $item->quantity,
          'type' => 'customer_return',
          'status' => 'quarantine', // <--- THE GATEKEEPER
          'referenceId' => $return->id,
        ]);
      }
      $return->update(['status' => 'received']);
      return redirect()->back()->with('info', 'Package received. Pending inspection.');
    });
  }

  /**
   * STAGE 3: The Inspection (The Final Truth)
   * Admin checks the items. Only 'sellable' updates the main stock.
   */
  public function inspectItem(ReturnOrder $return, $itemId, Request $request)
  {
    // $request->condition is either 'sellable' or 'damaged'
    return DB::transaction(function () use ($return, $itemId, $request) {
      $item = $return->items()->findOrFail($itemId);

      // 1. Remove from Quarantine in Ledger
      InventoryMovement::create([
        'product_variant_id' => $item->product_variant_id,
        'quantity' => -$item->quantity, // Out of quarantine
        'type' => 'adjustment',
        'status' => 'quarantine',
        'referenceId' => $return->id,
      ]);

      // 2. Add to New Status in Ledger
      InventoryMovement::create([
        'product_variant_id' => $item->product_variant_id,
        'quantity' => $item->quantity,
        'type' => 'adjustment',
        'status' => $request->condition, // 'available' or 'damaged'
        'referenceId' => $return->id,
      ]);

      // 3. ONLY update the Variant Qty if it is sellable
      if ($request->condition === 'available') {
        $item->productVariant->increment('quantity', $item->quantity);
      }

      $item->update(['condition' => $request->condition]);
      return redirect()->back()->with('success', 'Inspection complete.');
    });
  }
}
