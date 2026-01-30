<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Factories\HasFactory; // 1. Import the trait

class ProductVariant extends Model
{
    use HasFactory;

    protected $fillable = [
        'product_id', 
        'sku', 
        'name', 
        'size', 
        'color', 
        'price', 
        'image_path', 
        'stock_qty'
    ];

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    public function discounts(): BelongsToMany
    {
        return $this->belongsToMany(Discount::class)
                    ->withTimestamps();
    }

    /**
     * Accessor to get the price after applying active discounts.
     */
    public function getCalculatedPriceAttribute()
    {
        $activeDiscount = $this->discounts()
            ->where('is_active', true)
            ->where('start_date', '<=', now())
            ->where('end_date', '>=', now())
            ->first();

        if (!$activeDiscount) return $this->price;

        if ($activeDiscount->type === 'percentage') {
            return $this->price - ($this->price * ($activeDiscount->value / 100));
        }

        return max(0, $this->price - $activeDiscount->value);
    }
}