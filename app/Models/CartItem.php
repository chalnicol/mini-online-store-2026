<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory; // Added this import
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo; // Added for type-hinting

class CartItem extends Model
{
    use HasFactory;
    
    protected $fillable = [
        'user_id',
        'product_variant_id',
        'quantity',
        'checked'
    ];

    protected $casts = [
        'checked' => 'boolean',
        'quantity' => 'integer',
    ];

    /**
     * Get the user that owns the cart item.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the product variant associated with the cart item.
     * This allows $cartItem->variant
     */
    public function variant(): BelongsTo
    {
        // Using ProductVariant class name (make sure this matches your model name)
        return $this->belongsTo(ProductVariant::class, 'product_variant_id');
    }
}