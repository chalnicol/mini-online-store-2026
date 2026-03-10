<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes; // ✅ added
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Voucher extends Model
{
  use SoftDeletes; // ✅ added

  protected $fillable = [
    'code',
    'type',
    'value',
    'min_spend',
    'usage_limit',
    'used_count',
    'expires_at',
    'is_personal',
    'is_active',
    'description',
  ];

  protected $casts = [
    'expires_at' => 'datetime',
    'usage_limit' => 'integer',
    'used_count' => 'integer',
    'is_personal' => 'boolean',
    'is_active' => 'boolean', // ✅ added missing cast
    'value' => 'float', // ✅ added
    'min_spend' => 'float', // ✅ added
  ];

  // ---- Relationships ----

  public function users(): BelongsToMany
  {
    return $this->belongsToMany(User::class, 'user_voucher')->withPivot('used_at')->withTimestamps();
  }

  // ---- Helpers ----

  public function isUsable(?float $subtotal = 0, ?int $authUserId = null): bool
  {
    // 1. Check if soft deleted
    if ($this->trashed()) {
      return false;
    }

    // 2. Check active flag
    if (!$this->is_active) {
      return false;
    }

    // 3. Check expiry
    if ($this->expires_at && $this->expires_at->isPast()) {
      return false;
    }

    // 4. Check global usage limit
    if ($this->usage_limit && $this->used_count >= $this->usage_limit) {
      return false;
    }

    // 5. Check minimum spend
    if ($subtotal < $this->min_spend) {
      return false;
    }

    // 6. Per-user usage check
    if ($authUserId) {
      $pivot = $this->users()->where('users.id', $authUserId)->first()?->pivot;

      if ($this->is_personal) {
        // Personal voucher — must be assigned AND not yet used
        if (!$pivot || $pivot->used_at !== null) {
          return false;
        }
      } else {
        // Public voucher — if user has used it before, block
        if ($pivot && $pivot->used_at !== null) {
          return false;
        }
      }
    } elseif ($this->is_personal) {
      // Personal voucher requires a logged in user
      return false;
    }

    return true;
  }

  public function calculateDiscount(float $subtotal): float
  {
    return match ($this->type) {
      'percentage' => $subtotal * ($this->value / 100),
      'fixed' => min($this->value, $subtotal),
      'shipping' => $this->value,
      default => 0.0,
    };
  }

  // ---- Lifecycle Hooks ----

  protected static function booted(): void
  {
    // When voucher is soft deleted, detach all users from pivot
    // but only those who haven't used it yet (used_at is null)
    static::deleting(function (Voucher $voucher) {
      $voucher->users()->wherePivotNull('used_at')->detach(); // ✅ clean up unclaimed assignments
    });
  }
}
