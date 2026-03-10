<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Discount extends Model
{
  use HasFactory, SoftDeletes;

  protected $fillable = ['code', 'description', 'type', 'value', 'start_date', 'end_date', 'is_active'];

  protected $casts = [
    'start_date' => 'datetime',
    'end_date' => 'datetime',
    'is_active' => 'boolean',
    'value' => 'float', // ✅ added
  ];

  // ---- Relationships ----

  public function variants(): BelongsToMany
  {
    // ✅ added return type
    // ✅ added return type
    return $this->belongsToMany(ProductVariant::class)->withTimestamps();
  }

  // ---- Helpers ----

  public function isCurrentlyActive(): bool
  {
    // ✅ added helper
    $now = now();
    return $this->is_active && !$this->trashed() && $this->start_date <= $now && $this->end_date >= $now;
  }

  // ---- Lifecycle Hooks ----

  protected static function booted(): void
  {
    // ✅ added
    static::deleting(function (Discount $discount) {
      // Detach all variant relationships from pivot on soft delete
      $discount->variants()->detach();
    });
  }
}
