<?php

namespace App\Models;

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Cache;

class Category extends Model
{
    protected $fillable = [
        'name',
        'slug',
        'parent_id'
    ];
    
    // Get the parent (Upward)
    public function parent(): BelongsTo
    {
        return $this->belongsTo(Category::class, 'parent_id');
    }

    // Get immediate children (Downward one level)
    public function children(): HasMany
    {
        return $this->hasMany(Category::class, 'parent_id');
    }

    /**
     * The Infinite Recursive Relationship
     * This loads children, and their children, and so on...
     */
    // public function childrenRecursive(): HasMany
    // {
    //     return $this->children()->with('childrenRecursive');
    // }
    public function childrenRecursive(): HasMany
    {
        return $this->children()->with('childrenRecursive')->orderBy('name', 'asc');
    }

    public function isLeaf(): bool
    {
        return $this->children()->count() === 0;
    }

    // Pro-tip: Add a scope to easily fetch only leaves for your "Create Product" dropdown
    public function scopeLeaves($query)
    {
        return $query->doesntHave('children');
    }

    // Clear cache automatically when categories change
    protected static function booted()
    {
        static::saved(fn () => Cache::forget('global_category_tree'));
        static::deleted(fn () => Cache::forget('global_category_tree'));
    }

    /**
     * Get all descendant IDs in a flat array.
     */
    public function getAllDescendantIds(): array
    {
        $ids = [];

        // Loop through immediate children
        foreach ($this->children as $child) {
            $ids[] = $child->id;
            // Recursively call this on each child
            $ids = array_merge($ids, $child->getAllDescendantIds());
        }

        return $ids;
    }
}
