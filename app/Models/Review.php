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

    protected static function booted()
    {
        $updateRating = function ($review) {
            $product = $review->product;
            // coalesce to 0.00 if no reviews exist
            $product->average_rating = $product->reviews()->avg('rating') ?? 0.00;
            $product->save();
        };

        static::created($updateRating);
        static::deleted($updateRating);
        static::updated($updateRating);
    }
}