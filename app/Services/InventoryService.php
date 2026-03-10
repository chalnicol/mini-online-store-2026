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
   * Note: Stock update is handled by InventoryMovementObserver.
   */

  public function recordPurchase(
    ProductVariant $variant,
    int $addedQty,
    float $newUnitCost,
    bool $forcePriceUpdate = false,
  ) {
    return DB::transaction(function () use ($variant, $addedQty, $newUnitCost, $forcePriceUpdate) {
      // 1. Get fresh data
      $variant->refresh();

      $oldQty = (int) $variant->stock_qty;
      $oldPrice = (float) $variant->price;
      $newBatchRetail = $newUnitCost * 1.3;
      $totalNewQty = $oldQty + $addedQty;

      // 2. The Blended Math (Handles 0 stock perfectly)
      $calculatedPrice =
        $oldQty > 0 ? ($oldQty * $oldPrice + $addedQty * $newBatchRetail) / $totalNewQty : $newBatchRetail;

      $finalPrice = round($calculatedPrice, 2);

      // 3. Prepare the update array
      $updateData = [
        'stock_qty' => $totalNewQty,
        'avg_unit_cost' => $newUnitCost,
      ];

      // 4. Handle Price Updates and History
      if ($forcePriceUpdate) {
        // Only create history if the price is actually moving
        if ($oldPrice != $finalPrice) {
          PriceHistory::create([
            'product_variant_id' => $variant->id,
            'old_price' => $oldPrice,
            'new_price' => $finalPrice,
            'reason' => $oldQty == 0 ? 'Initial Stock' : 'Restock: Blended Average',
            'margin_at_time' => 30,
            'user_id' => auth()->id(),
          ]);
        }
        $updateData['price'] = $finalPrice;
        $updateData['suggested_price'] = null;
      } else {
        // Just suggest the price, don't update the live price
        $updateData['suggested_price'] = $finalPrice;
      }

      // 5. Update the Variant
      $variant->update($updateData);

      // 6. Record the Movement (Manual stock management now)
      InventoryMovement::create([
        'product_variant_id' => $variant->id,
        'quantity' => $addedQty,
        'unit_cost' => $newUnitCost,
        'type' => 'purchase',
        'user_id' => auth()->id(),
      ]);
    });
  }

  /**
   * Record a manual adjustment.
   * $quantity should be signed (positive for increment, negative for decrement).
   */
  public function recordAdjustment(ProductVariant $variant, int $quantity, string $status, string $reason)
  {
    return DB::transaction(function () use ($variant, $quantity, $status, $reason) {
      // The Observer handles the math for the variant if status is 'available'
      $variant->refresh();

      $oldQty = (int) $variant->stock_qty;
      $variant->update(['stock_qty' => $oldQty + $quantity]);

      InventoryMovement::create([
        'product_variant_id' => $variant->id,
        'user_id' => auth()->id(),
        'quantity' => $quantity,
        'type' => 'adjustment',
        'status' => $status,
        'reason' => $reason,
      ]);
    });
  }

  /**
   * Step 1: Record a return into Quarantine (Pending Inspection).
   */
  public function recordReturnToQuarantine(ProductVariant $variant, int $quantity, $reference = null)
  {
    // Observer ignores this because status is 'quarantine'
    return InventoryMovement::create([
      'product_variant_id' => $variant->id,
      'quantity' => $quantity,
      'type' => 'customer_return',
      'status' => 'quarantine',
      'reason' => 'Pending Inspection',
      'reference_id' => $reference?->id,
      'reference_type' => $reference ? get_class($reference) : null,
      'user_id' => auth()->id(),
    ]);
  }

  /**
   * Step 2: The Inspection (Move from Quarantine to Sellable or Damaged).
   */
  public function inspectQuarantinedItem(InventoryMovement $movement, string $decision)
  {
    return DB::transaction(function () use ($movement, $decision) {
      // 1. Exit Quarantine (Ledger record of removal)
      InventoryMovement::create([
        'product_variant_id' => $movement->product_variant_id,
        'quantity' => -$movement->quantity,
        'type' => 'adjustment',
        'status' => 'quarantine',
        'reason' => 'Moving out of quarantine for inspection result: ' . $decision,
        'user_id' => auth()->id(),
      ]);

      // 2. Enter Target Bucket (Ledger record of destination)
      // If $decision is 'available', the Observer will trigger variant stock increment here.
      InventoryMovement::create([
        'product_variant_id' => $movement->product_variant_id,
        'quantity' => $movement->quantity,
        'type' => 'adjustment',
        'status' => $decision,
        'reason' => 'Completed inspection: ' . $decision,
        'user_id' => auth()->id(),
      ]);

      // Update original record status for tracking
      $movement->update(['status' => $decision]);
    });
  }

  /**
   * Approve a suggested price change from the Price Adjustments inbox.
   */
  public function approvePriceChange(ProductVariant $variant, float $newPrice, string $reason = 'Admin Approved')
  {
    return DB::transaction(function () use ($variant, $newPrice, $reason) {
      PriceHistory::create([
        'product_variant_id' => $variant->id,
        'old_price' => $variant->price,
        'new_price' => $newPrice,
        'margin_at_time' => $variant->avg_unit_cost > 0 ? (($newPrice - $variant->avg_unit_cost) / $newPrice) * 100 : 0,
        'reason' => $reason,
      ]);

      $variant->update([
        'price' => $newPrice,
        'suggested_price' => null,
      ]);
    });
  }
}
