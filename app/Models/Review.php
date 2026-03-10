<?php

namespace App\Models; // ✅ removed duplicate

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;

class Review extends Model
{
  use HasFactory, SoftDeletes;

  protected $fillable = ['product_id', 'product_variant_id', 'user_id', 'rating', 'comment', 'is_published'];

  protected $casts = [
    'rating' => 'integer',
    'is_published' => 'boolean',
  ];

  // ---- Relationships ----

  public function user(): BelongsTo
  {
    return $this->belongsTo(User::class);
  }

  public function product(): BelongsTo
  {
    return $this->belongsTo(Product::class);
  }

  public function variant(): BelongsTo
  {
    return $this->belongsTo(ProductVariant::class, 'product_variant_id');
  }

  // ---- Scopes ----

  public function scopePublished($query)
  {
    return $query->where('is_published', true);
  }

  // ---- Lifecycle Hooks ----

  protected static function booted(): void
  {
    $updateRating = function (Review $review) {
      $product = $review->product;
      if ($product) {
        $avg = $product->publishedReviews()->avg('rating');
        $product->update([
          'average_rating' => $avg ?? 0.0,
        ]);
      }
    };

    static::created($updateRating);
    static::updated($updateRating); // ✅ covers publish/unpublish toggle
    static::deleted($updateRating); // ✅ covers soft delete
    static::restored($updateRating); // ✅ covers restore — recalculate when review comes back
  }
}
