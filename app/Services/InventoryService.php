<?php

namespace App\Services;

use App\Models\ProductVariant;
use App\Models\InventoryMovement;
use App\Models\PriceHistory;
use Illuminate\Support\Facades\DB;

class InventoryService
{
  /**
   * Handle a new purchase/restock from a supplier.
   */
  public function recordPurchase(
    ProductVariant $variant,
    int $quantity,
    float $unitCost,
    bool $forcePriceUpdate = false,
    int $supplierId = null,
    string $reason = 'Supplier Restock',
  ) {
    return DB::transaction(function () use ($variant, $quantity, $unitCost, $forcePriceUpdate, $supplierId, $reason) {
      // 1. Calculate New Avg Cost
      $currentTotalValue = $variant->stock_qty * $variant->avg_unit_cost;
      $newBatchValue = $quantity * $unitCost;
      $newTotalQty = $variant->stock_qty + $quantity;
      $newAvgCost = $newTotalQty > 0 ? ($currentTotalValue + $newBatchValue) / $newTotalQty : $unitCost;

      // 2. Calculate Suggested Price (30% Margin)
      $newSuggestedPrice = $newAvgCost / 0.7;

      // 3. Create Ledger Entry
      InventoryMovement::create([
        'product_variant_id' => $variant->id,
        'supplier_id' => $supplierId,
        'quantity' => $quantity,
        'unit_cost' => $unitCost,
        'type' => 'purchase',
        'status' => 'available',
        'reason' => $reason,
        'user_id' => auth()->id(),
      ]);

      // 4. Update the Variant
      $updateData = [
        'stock_qty' => $newTotalQty,
        'avg_unit_cost' => $newAvgCost,
      ];

      if ($forcePriceUpdate) {
        // Immediate update: No prompt needed later
        $updateData['price'] = $newSuggestedPrice;
        $updateData['suggested_price'] = null;

        // Log the price change immediately
        PriceHistory::create([
          'product_variant_id' => $variant->id,
          'old_price' => $variant->price,
          'new_price' => $newSuggestedPrice,
          'margin_at_time' => 30.0,
          'reason' => 'Auto-updated during purchase',
        ]);
      } else {
        // Keep current price, but store the suggestion for the "Inbox"
        $updateData['suggested_price'] = $newSuggestedPrice;
      }

      $variant->update($updateData);
    });
  }

  /**
   * Approve a suggested price change.
   */
  public function approvePriceChange(ProductVariant $variant, float $newPrice, string $reason = 'Admin Approved')
  {
    return DB::transaction(function () use ($variant, $newPrice, $reason) {
      // Log to Price History
      PriceHistory::create([
        'product_variant_id' => $variant->id,
        'old_price' => $variant->price,
        'new_price' => $newPrice,
        'margin_at_time' => $variant->avg_unit_cost > 0 ? (($newPrice - $variant->avg_unit_cost) / $newPrice) * 100 : 0,
        'reason' => $reason,
      ]);

      // Update actual price and clear suggestion
      $variant->update([
        'price' => $newPrice,
        'suggested_price' => null, // Reset since it's now approved
      ]);
    });
  }

  /**
   * Step 1: Record a return into Quarantine (Pending Inspection)
   */
  public function recordReturnToQuarantine(
    ProductVariant $variant,
    int $quantity,
    string $type = 'customer_return',
    $reference = null,
  ) {
    // We do NOT update $variant->stock_qty here because items are NOT sellable yet.
    return InventoryMovement::create([
      'product_variant_id' => $variant->id,
      'quantity' => $quantity,
      'type' => $type,
      'status' => 'quarantine',
      'reason' => 'Pending Inspection',
      'reference_id' => $reference?->id,
      'reference_type' => $reference ? get_class($reference) : null,
      'user_id' => auth()->id(),
    ]);
  }

  /**
   * Step 2: The Inspection (Move from Quarantine to Stock or Trash)
   */
  public function inspectQuarantinedItem(InventoryMovement $movement, string $decision)
  {
    return DB::transaction(function () use ($movement, $decision) {
      if ($decision === 'restock') {
        // Change status to available
        $movement->update(['status' => 'available', 'reason' => 'Passed Inspection']);

        // Now, and only now, we add it to the sellable stock count
        $movement->variant->increment('stock_qty', $movement->quantity);
      } else {
        // Decision is 'damaged' or 'lost'
        $movement->update(['status' => $decision, 'reason' => 'Failed Inspection: ' . $decision]);
        // stock_qty remains the same because it was never added.
      }

      return $movement;
    });
  }
}
