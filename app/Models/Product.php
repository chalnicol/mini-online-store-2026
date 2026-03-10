<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;

class Product extends Model
{
  use HasFactory, SoftDeletes;

  protected $fillable = ['category_id', 'name', 'slug', 'description', 'average_rating', 'is_published'];

  protected $appends = ['variants_count', 'reviews_count'];

  // ---- Relationships ----

  public function category(): BelongsTo
  {
    return $this->belongsTo(Category::class);
  }

  public function variants(): HasMany
  {
    return $this->hasMany(ProductVariant::class);
  }

  public function activeVariants(): HasMany
  {
    return $this->hasMany(ProductVariant::class) // ✅ fixed Variant::class → ProductVariant::class
      ->where('is_active', true);
  }

  public function reviews(): HasMany
  {
    return $this->hasMany(Review::class);
  }

  public function publishedReviews(): HasMany
  {
    return $this->hasMany(Review::class)
      ->published()
      ->whereHas('variant', function ($q) {
        $q->where('is_active', true);
      });
  }

  // ---- Accessors ----

  public function getVariantsCountAttribute(): int
  {
    return (int) $this->variants()->count();
  }

  public function getReviewsCountAttribute(): int
  {
    return (int) $this->publishedReviews()->count();
  }

  // ---- Lifecycle Hooks ----

  protected static function booted(): void
  {
    // ✅ Soft delete all variants when product is deleted
    static::deleting(function (Product $product) {
      $product->variants()->each(fn($variant) => $variant->delete());
    });

    // ✅ Restore all variants when product is restored
    static::restoring(function (Product $product) {
      $product->variants()->withTrashed()->each(fn($variant) => $variant->restore());
    });
  }
}
