<?php

namespace App\Models;

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Factories\HasFactory; // 1. Import the trait

class Review extends Model
{
    use HasFactory;
    
    protected $fillable = [
        'product_id', 
        'product_variant_id', 
        'user_id', 
        'rating', 
        'comment',
        'is_published'
    ];

    protected $casts = [
        'rating' => 'integer',
        'is_published' => 'boolean',
    ];

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
        return $this->belongsTo(ProductVariant::class, 'product_variant_id', 'id');
    }

    public function scopePublished($query)
    {
        return $query->where('is_published', true); // or whatever your column is
    }

    protected static function booted()
    {
        $updateRating = function ($review) {
            $product = $review->product;
            if ($product) {
                // 1. Calculate average only for published reviews
                $avg = $product->publishedReviews()->avg('rating');

                // Update the cached columns on the product
                $product->update([
                    'average_rating' => $avg ?? 0.00,
                ]);
            }  
        };

        static::created($updateRating);
        static::deleted($updateRating);
        static::updated($updateRating);
    }
}