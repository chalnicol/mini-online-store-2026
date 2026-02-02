<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Factories\HasFactory; // 1. Import the trait

class ProductVariant extends Model
{
    use HasFactory;

    protected $appends = ['calculated_price'];

    protected $fillable = [
       'product_id',
        'sku',
        'name',
        'attributes', // Add this
        'price',
        'compare_at_price',
        'stock_qty',
        'image_path',
        'is_active',
    ];

    protected $casts = [
        'attributes' => 'array', // This is CRUCIAL for JSON columns
        'price' => 'float',
        'compare_at_price' => 'float',
        'is_active' => 'boolean',
        'stock_qty' => 'integer',
    ];

    
    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    public function reviews(): HasMany
    {
        return $this->hasMany(Review::class);
    }

    public function discounts(): BelongsToMany
    {
        return $this->belongsToMany(Discount::class)
                    ->withTimestamps();
    }

    public function getCalculatedPriceAttribute()
    {
        // 1. Get all active discounts that are currently valid
        $activeDiscounts = $this->discounts
            ->where('is_active', true)
            ->where('start_date', '<=', now())
            ->where('end_date', '>=', now());

        // 2. If no discounts exist, return original price
        if ($activeDiscounts->isEmpty()) {
            return (float) $this->price;
        }

        // 3. Map each discount to its resulting price
        $potentialPrices = $activeDiscounts->map(function ($discount) {
            if ($discount->type === 'percentage') {
                return $this->price - ($this->price * ($discount->value / 100));
            }
            // Flat amount discount
            return max(0, $this->price - $discount->value);
        });

        // 4. Return the lowest (minimum) calculated price
        return (float) $potentialPrices->min();
    }
    
}