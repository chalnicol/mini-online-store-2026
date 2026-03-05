<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphTo;

class InventoryMovement extends Model
{
  protected $fillable = [
    'product_variant_id',
    'user_id',
    'supplier_id',
    'quantity',
    'unit_cost',
    'type', // 'purchase', 'sale', 'customer_return', etc.
    'status', // 'available', 'quarantine', 'damaged'
    'reason',
    'reference_id',
    'reference_type',
  ];

  /**
   * The variant this movement belongs to.
   */
  public function variant(): BelongsTo
  {
    return $this->belongsTo(ProductVariant::class, 'product_variant_id');
  }

  /**
   * The supplier this movement came from (if it was a purchase).
   */
  public function supplier(): BelongsTo
  {
    return $this->belongsTo(Supplier::class);
  }

  /**
   * The user (Admin or System) who recorded this movement.
   */
  public function user(): BelongsTo
  {
    return $this->belongsTo(User::class);
  }

  /**
   * Polymorphic relationship to link to Orders or PurchaseLogs.
   * Allows: $movement->reference (returns an Order or Purchase model)
   */
  public function reference(): MorphTo
  {
    return $this->morphTo();
  }
}
