<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ReturnItem extends Model
{
  use HasFactory, SoftDeletes;

  protected $fillable = [
    'order_return_id',
    'order_item_id',
    'product_variant_id',
    'product_name',
    'variant_name',
    'quantity',
    'reason',
    'condition',
    'resolution',
    'is_restocked',
  ];

  protected $casts = [
    'quantity' => 'integer',
    'is_restocked' => 'boolean',
  ];

  // ---- Relationships ----

  public function orderReturn(): BelongsTo
  {
    return $this->belongsTo(OrderReturn::class, 'order_return_id');
  }

  public function orderItem(): BelongsTo
  {
    return $this->belongsTo(OrderItem::class);
  }

  public function variant(): BelongsTo
  {
    return $this->belongsTo(ProductVariant::class, 'product_variant_id');
  }

  // ---- Lifecycle Hooks ----

  protected static function booted(): void
  {
    // ✅ Auto-create inventory movement when condition is set
    static::updated(function (ReturnItem $item) {
      // Only trigger when condition changes from pending_inspection
      // and hasn't been restocked yet
      if ($item->wasChanged('condition') && $item->condition !== 'pending_inspection' && !$item->is_restocked) {
        $movementStatus = match ($item->condition) {
          'sellable' => 'available', // ✅ goes back to stock
          'damaged' => 'damaged', // ✅ tracked but not sellable
          default => null,
        };

        if ($movementStatus && $item->product_variant_id) {
          // Create inventory movement
          InventoryMovement::create([
            'product_variant_id' => $item->product_variant_id,
            'quantity' =>
              $item->condition === 'sellable'
                ? $item->quantity // positive — restocks
                : -$item->quantity, // negative — removes from available
            'type' => 'customer_return',
            'status' => $movementStatus,
            'reason' => "Return #{$item->orderReturn->return_number}",
            'reference_type' => OrderReturn::class,
            'reference_id' => $item->order_return_id,
          ]);

          // ✅ Mark as restocked so it doesn't trigger again
          $item->updateQuietly(['is_restocked' => true]);

          // ✅ Update variant stock if sellable
          if ($item->condition === 'sellable' && $item->variant) {
            $item->variant->increment('stock_qty', $item->quantity);
          }

          // ✅ Check if whole return is now completed
          $item->orderReturn->checkIfCompleted();
        }
      }
    });
  }
}
