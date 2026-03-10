<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;

class UserAddress extends Model
{
  use HasFactory, SoftDeletes;

  protected $fillable = [
    'user_id',
    'serviceable_area_id',
    'type',
    'street_address',
    'contact_person',
    'contact_number',
    'is_default',
  ];

  protected function casts(): array
  {
    return [
      'is_default' => 'boolean',
    ];
  }

  // ---- Relationships ----

  public function user(): BelongsTo
  {
    return $this->belongsTo(User::class);
  }

  public function serviceableArea(): BelongsTo
  {
    return $this->belongsTo(ServiceableArea::class);
  }

  // ---- Accessors ----

  public function getFullAddressAttribute(): string
  {
    $area = $this->serviceableArea;
    return $area ? "{$this->street_address}, {$area->barangay}, {$area->city}" : $this->street_address;
  }

  // ---- Scopes ----

  public function scopeDefault($query)
  {
    return $query->where('is_default', true);
  }

  // ---- Lifecycle Hooks ----

  protected static function booted(): void
  {
    static::deleted(function (UserAddress $address) {
      if ($address->is_default) {
        $next = static::where('user_id', $address->user_id)->whereNull('deleted_at')->first();

        if ($next) {
          $next->update(['is_default' => true]);
        }
      }
    });

    static::restored(function (UserAddress $address) {
      $hasDefault = static::where('user_id', $address->user_id)->where('is_default', true)->exists();

      if (!$hasDefault) {
        $address->update(['is_default' => true]);
      }
    });
  }
}
