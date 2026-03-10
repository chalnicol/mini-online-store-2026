<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;

class ProductVariant extends Model
{
  use HasFactory, SoftDeletes;

  protected $appends = ['calculated_price'];

  protected $fillable = ['product_id', 'sku', 'name', 'attributes', 'price', 'stock_qty', 'image_path', 'is_active'];

  protected $casts = [
    'attributes' => 'array',
    'price' => 'float',
    'is_active' => 'boolean',
    'stock_qty' => 'integer',
  ];

  // ---- Relationships ----

  public function product(): BelongsTo
  {
    return $this->belongsTo(Product::class);
  }

  public function reviews(): HasMany
  {
    return $this->hasMany(Review::class);
  }

  public function publishedReviews(): HasMany
  {
    return $this->hasMany(Review::class)->published();
  }

  public function discounts(): BelongsToMany
  {
    return $this->belongsToMany(Discount::class)->withTimestamps();
  }

  public function movements(): HasMany
  {
    return $this->hasMany(InventoryMovement::class);
  }

  public function priceHistory(): HasMany
  {
    return $this->hasMany(PriceHistory::class);
  }

  public function cartItems(): HasMany
  {
    return $this->hasMany(CartItem::class);
  }

  // ---- Helpers ----

  public function hasPendingPriceAdjustment(): bool
  {
    return !is_null($this->suggested_price) && $this->suggested_price != $this->price;
  }

  // ---- Accessors ----

  public function getCalculatedPriceAttribute(): float
  {
    $now = now();

    $activeDiscounts = $this->discounts->filter(function ($discount) use ($now) {
      return $discount->is_active && $discount->start_date <= $now && $discount->end_date >= $now;
    });

    if ($activeDiscounts->isEmpty()) {
      return (float) $this->price;
    }

    $potentialPrices = $activeDiscounts->map(function ($discount) {
      if ($discount->type === 'percentage') {
        return $this->price - $this->price * ($discount->value / 100);
      }
      return max(0, $this->price - $discount->value);
    });

    return (float) $potentialPrices->min();
  }

  // ---- Lifecycle Hooks ----

  protected static function booted(): void
  {
    // ✅ Auto-generate SKU on creating
    static::creating(function (ProductVariant $variant) {
      $product = $variant->product ?? $variant->load('product')->product;

      $pSlug = Str::limit(Str::slug($product->name), 15, '');

      $aSlug = collect($variant->attributes)->values()->map(fn($v) => Str::slug($v))->implode('-');

      $aSlug = Str::limit($aSlug, 15, '');
      $base = Str::upper("{$pSlug}-{$aSlug}");

      do {
        $sku = $base . '-' . Str::upper(Str::random(4));
      } while (static::where('sku', $sku)->exists());

      $variant->sku = $sku;
    });

    // ✅ Cascade soft delete to related data
    static::deleting(function (ProductVariant $variant) {
      // Hard delete ephemeral data
      $variant->cartItems()->delete();

      // Soft delete reviews (preserve for history)
      $variant->reviews()->each(fn($review) => $review->delete());

      // ⚠️ Don't delete movements and priceHistory — financial records!
    });

    // ✅ Restore reviews when variant is restored
    static::restoring(function (ProductVariant $variant) {
      $variant->reviews()->withTrashed()->each(fn($review) => $review->restore());
    });
  }
}
