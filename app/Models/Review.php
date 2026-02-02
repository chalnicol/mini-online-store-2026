<?php

namespace App\Models;

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Factories\HasFactory; // 1. Import the trait

class Review extends Model
{
    use HasFactory;
    
    protected $fillable = ['product_id', 'product_variant_id', 'user_id', 'rating', 'comment'];

    /**
     * Get the user who wrote the review.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the product being reviewed.
     */
    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    public function variant (): BelongsTo
    {
        return $this->belongsTo(ProductVariant::class);
    }

    protected static function booted()
    {
        $updateRating = function ($review) {
            $product = $review->product;
            if ($product) {
                // Update the product's cached rating
                $avg = $product->reviews()->avg('rating');
                $product->update([
                    'average_rating' => $avg ?? 0.00
                ]);
            }
        };

        static::created($updateRating);
        static::deleted($updateRating);
        static::updated($updateRating);
    }
}