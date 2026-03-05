<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Supplier extends Model
{
  protected $fillable = ['name', 'contact_person', 'contact_number', 'email'];

  /**
   * Get all stock movements associated with this supplier.
   */
  public function movements(): HasMany
  {
    return $this->hasMany(InventoryMovement::class);
  }
}
