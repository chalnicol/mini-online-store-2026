<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ServiceableArea extends Model
{
  protected $fillable = ['barangay', 'city', 'province', 'is_active'];

  protected $casts = ['is_active' => 'boolean'];

  public function addresses(): HasMany
  {
    return $this->hasMany(UserAddress::class);
  }

  public function getFullLabelAttribute(): string
  {
    return "{$this->barangay}, {$this->city}";
  }
}
