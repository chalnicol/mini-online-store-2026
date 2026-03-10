<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Supplier extends Model
{
  use HasFactory, SoftDeletes; // ✅ added both

  protected $fillable = ['name', 'contact_person', 'contact_number', 'email'];

  // ---- Relationships ----

  public function movements(): HasMany
  {
    return $this->hasMany(InventoryMovement::class);
  }

  // ---- Lifecycle Hooks ----

  protected static function booted(): void
  {
    // ✅ When supplier is soft deleted, set supplier_id to null on movements
    // This is a safety net — your migration already has onDelete('set null')
    // but this handles it at the model level too for consistency
    static::deleting(function (Supplier $supplier) {
      $supplier->movements()->update(['supplier_id' => null]);
    });
  }
}
