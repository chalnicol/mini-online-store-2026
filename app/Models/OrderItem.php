<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class OrderItem extends Model
{
  use HasFactory;

  protected $fillable = [
    'order_id',
    'product_variant_id',
    'product_name',
    'variant_name',
    'variant_attributes',
    'quantity',
    'price_at_purchase',
    'discount_at_purchase',
  ];

  protected $casts = [
    'variant_attributes' => 'array',
    'price_at_purchase' => 'float',
    'discount_at_purchase' => 'float',
    'quantity' => 'integer',
  ];

  // ---- Relationships ----

  public function order(): BelongsTo
  {
    return $this->belongsTo(Order::class);
  }

  public function variant(): BelongsTo
  {
    return $this->belongsTo(ProductVariant::class, 'product_variant_id');
  }

  // ---- Helpers ----

  public function lineTotal(): float
  {
    return ($this->price_at_purchase - $this->discount_at_purchase) * $this->quantity;
  }
}
