<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Cache;

class Category extends Model
{
  use SoftDeletes;

  protected $fillable = ['name', 'slug', 'parent_id', 'active']; // ✅ added active

  // ---- Relationships ----

  public function parent(): BelongsTo
  {
    return $this->belongsTo(Category::class, 'parent_id');
  }

  public function children(): HasMany
  {
    return $this->hasMany(Category::class, 'parent_id');
  }

  public function products(): HasMany
  {
    return $this->hasMany(Product::class, 'category_id');
  }

  public function childrenRecursive(): HasMany
  {
    return $this->children()
      ->withCount('children')
      ->orderBy('children_count', 'desc')
      ->orderBy('name', 'asc')
      ->with('childrenRecursive');
  }

  public function activeChildrenRecursive(): HasMany
  {
    return $this->children()
      ->where('active', true)
      ->withCount('children')
      ->orderBy('children_count', 'desc')
      ->orderBy('name', 'asc')
      ->with('activeChildrenRecursive');
  }

  // ---- Scopes ----

  public function scopeLeaves($query)
  {
    return $query->doesntHave('children');
  }

  // ---- Helpers ----

  public function isLeaf(): bool
  {
    return $this->children()->count() === 0;
  }

  public function getAllDescendantIds(): array
  {
    $ids = [];
    foreach ($this->children()->where('active', true)->get() as $child) {
      $ids[] = $child->id;
      $ids = array_merge($ids, $child->getAllDescendantIds());
    }
    return $ids;
  }

  // ---- Lifecycle Hooks ----

  protected static function booted(): void
  {
    // ✅ Soft delete cascade
    static::deleting(function (Category $category) {
      // Soft delete subcategories recursively
      $category->children()->each(fn($child) => $child->delete());

      // Soft delete all products under this category
      $category->products()->each(fn($product) => $product->delete());
    });

    // ✅ Restore cascade
    static::restoring(function (Category $category) {
      // Restore subcategories
      $category->children()->withTrashed()->each(fn($child) => $child->restore());

      // Restore products
      $category->products()->withTrashed()->each(fn($product) => $product->restore());
    });

    // ✅ Cache clearing (added restore too)
    static::saved(fn() => Cache::forget('active_category_tree'));
    static::deleted(fn() => Cache::forget('active_category_tree'));
    static::restored(fn() => Cache::forget('active_category_tree')); // ✅ added
  }
}
