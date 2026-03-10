<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Str;

class Order extends Model
{
  use HasFactory, SoftDeletes;

  protected $fillable = [
    'order_number',
    'user_id',
    'address_id',
    'shipping_contact_person',
    'shipping_contact_number',
    'shipping_full_address',
    'voucher_code',
    'voucher_discount',
    'items_subtotal',
    'shipping_fee',
    'final_total',
    'status',
    'payment_status',
    'payment_method',
    'delivery_type',
    'delivery_schedule',
    'notes',
  ];

  protected $casts = [
    'delivery_schedule' => 'array',
    'items_subtotal' => 'float',
    'shipping_fee' => 'float',
    'voucher_discount' => 'float',
    'final_total' => 'float',
  ];

  // ---- Relationships ----

  public function user(): BelongsTo
  {
    return $this->belongsTo(User::class);
  }

  public function address(): BelongsTo
  {
    return $this->belongsTo(UserAddress::class, 'address_id');
  }

  public function items(): HasMany
  {
    return $this->hasMany(OrderItem::class);
  }

  public function returns(): HasMany
  {
    return $this->hasMany(OrderReturn::class);
  }

  // ---- Helpers ----

  public function isPending(): bool
  {
    return $this->status === 'pending';
  }

  public function isCancellable(): bool
  {
    return in_array($this->status, ['pending', 'processing']);
  }

  public function isReturnable(): bool
  {
    return $this->status === 'delivered';
  }

  // ---- Lifecycle Hooks ----

  protected static function booted(): void
  {
    // ✅ Auto-generate order number
    static::creating(function (Order $order) {
      do {
        $number = 'ORD-' . strtoupper(Str::random(8));
      } while (static::where('order_number', $number)->exists());

      $order->order_number = $number;
    });

    // ✅ Soft delete cascade to returns
    static::deleting(function (Order $order) {
      $order->returns()->each(fn($return) => $return->delete());
    });

    // ✅ Restore cascade
    static::restoring(function (Order $order) {
      $order->returns()->withTrashed()->each(fn($return) => $return->restore());
    });
  }
}
