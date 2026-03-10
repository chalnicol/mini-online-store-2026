<?php

namespace App\Observers;

use App\Models\InventoryMovement;

class InventoryMovementObserver
{
  /**
   * Handle the InventoryMovement "created" event.
   */
  public function created(InventoryMovement $inventoryMovement): void
  {
    // Fix: Match the variable name from the parameter above
    $variant = $inventoryMovement->variant;

    // Make sure the relationship exists before proceeding
    if (!$variant) {
      return;
    }

    if ($inventoryMovement->status === 'available') {
      // Inbound
      if (in_array($inventoryMovement->type, ['purchase', 'customer_return', 'initial'])) {
        $variant->increment('stock_qty', $inventoryMovement->quantity);
      }

      // Outbound
      elseif (in_array($inventoryMovement->type, ['sale', 'purchase_return'])) {
        // Note: quantity is usually stored as positive, so we decrement
        $variant->decrement('stock_qty', $inventoryMovement->quantity);
      }

      // Adjustment (+ or -)
      elseif ($inventoryMovement->type === 'adjustment') {
        $variant->increment('stock_qty', $inventoryMovement->quantity);
      }
    }
  }

  /**
   * Handle the InventoryMovement "updated" event.
   */
  public function updated(InventoryMovement $inventoryMovement): void
  {
    //
  }

  /**
   * Handle the InventoryMovement "deleted" event.
   */
  public function deleted(InventoryMovement $inventoryMovement): void
  {
    //
  }

  /**
   * Handle the InventoryMovement "restored" event.
   */
  public function restored(InventoryMovement $inventoryMovement): void
  {
    //
  }

  /**
   * Handle the InventoryMovement "force deleted" event.
   */
  public function forceDeleted(InventoryMovement $inventoryMovement): void
  {
    //
  }
}
