<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Voucher extends Model
{
    //
    protected $fillable = [
        'code', 'type', 'value', 'min_spend', 
        'usage_limit', 'used_count', 'expires_at', 'user_id'
    ];

    protected $casts = [
        'expires_at' => 'datetime',
        'usage_limit' => 'integer',
        'used_count' => 'integer',
    ];

    /**
     * Get the user that owns the voucher (optional).
     */
    public function users(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'user_voucher')
                    ->withPivot('used_at')
                    ->withTimestamps();
    }

    public function isUsable(?float $subtotal = 0, ?int $authUserId = null): bool
    {
        // 1. Check Expiry
        if ($this->expires_at && $this->expires_at->isPast()) return false;

        // 2. Check Global Usage Limit
        if ($this->usage_limit && $this->used_count >= $this->usage_limit) return false;

        // 3. Check Minimum Spend
        if ($subtotal < $this->min_spend) return false;

        // 4. NEW: Check Ownership
        // If the voucher is assigned to a user, the current user must be the owner.
        if ($this->user_id !== null && $this->user_id !== $authUserId) {
            return false;
        }

        return true;
    }

    /**
     * Calculate the discount amount based on the voucher type.
     */
    public function calculateDiscount($subtotal)
    {
        switch ($this->type) {
            case 'percentage':
                // e.g., 10% of 1000 = 100
                return ($subtotal * ($this->value / 100));

            case 'fixed':
                // e.g., 100 pesos off
                // Ensure discount doesn't exceed the subtotal
                return min($this->value, $subtotal);

            case 'shipping':
                // e.g., 40 pesos off shipping
                // Usually, this is a fixed amount specifically for shipping
                return $this->value;

            default:
                return 0;
        }
    }
}
