<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Factories\HasFactory; // 1. Import the trait
use Illuminate\Support\Str;

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
        // 'compare_at_price',
        'stock_qty',
        'image_path',
        'is_active',
    ];

    protected $casts = [
        'attributes' => 'array', // This is CRUCIAL for JSON columns
        'price' => 'float',
        // 'compare_at_price' => 'float',
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
        $now = now();
        // 1. Get all active discounts that are currently valid
        // $activeDiscounts = $this->discounts
        //     ->where('is_active', true)
        //     ->where('start_date', '<=', now())
        //     ->where('end_date', '>=', now());
        $activeDiscounts = $this->discounts->filter(function ($discount) use ($now) {
            return $discount->is_active && 
                $discount->start_date <= $now && 
                $discount->end_date >= $now;
        });

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

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($variant) {
            if (empty($variant->sku)) {
                $variant->sku = static::generateUniqueSku($variant);
            }
        });
    }

    /**
     * Generate a clean, unique SKU
     * Format: PRODUCT-NAME-ATTRIBUTES-RANDOM
     */
    public static function generateUniqueSku($variant)
    {
        // 1. Get product name, slugify it, then uppercase it
        $productName = $variant->product->name ?? 'PROD';
        $productSlug = Str::upper(Str::slug($productName));

        // 2. Get the attribute values (e.g., "RED-LARGE")
        $attributeString = collect($variant->attributes)
            ->filter() // Remove empty values
            ->map(fn($val) => Str::upper(Str::slug($val)))
            ->implode('-');

        // 3. Build the base
        $base = $productSlug;
        if (!empty($attributeString)) {
            $base .= '-' . $attributeString;
        }

        // 4. Add a random unique suffix and check for uniqueness
        do {
            $sku = $base . '-' . Str::upper(Str::random(4));
        } while (static::where('sku', $sku)->exists());

        return $sku;
    }
        
}