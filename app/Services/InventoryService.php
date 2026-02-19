<?php

namespace App\Services;

use App\Models\ProductVariant;
use App\Models\StockMovement;
use Illuminate\Support\Facades\DB;

class InventoryService
{
    /**
     * The single point of truth for moving stock.
     */
    public function adjustStock(int $variantId, int $quantity, string $type, string $reason, $reference = null)
    {
        return DB::transaction(function () use ($variantId, $quantity, $type, $reason, $reference) {
            $variant = ProductVariant::lockForUpdate()->findOrFail($variantId);

            // 1. Create the Movement Log
            $movement = new StockMovement();
            $movement->product_variant_id = $variantId;
            $movement->quantity = $quantity; // e.g., -5 for sales, 10 for restock
            $movement->type = $type;
            $movement->reason = $reason;
            $movement->user_id = auth()->id();

            // Handle the polymorphic reference (Order or PurchaseLog)
            if ($reference) {
                $movement->reference_id = $reference->id;
                $movement->reference_type = get_class($reference);
            }

            $movement->save();

            // 2. Update the cached stock quantity on the variant
            $variant->increment('stock_qty', $quantity);

            return $movement;
        });
    }
}