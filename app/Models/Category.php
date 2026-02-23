<?php

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

    public function products(): HasMany
    {
        return $this->hasMany(Product::class, 'category_id');
    }


    /**
     * The Infinite Recursive Relationship
     * This loads children, and their children, and so on...
     */
    // public function childrenRecursive(): HasMany
    // {
    //     return $this->children()->with('childrenRecursive');
    // }
    // public function childrenRecursive(): HasMany
    // {
    //     return $this->children()->with('childrenRecursive')->orderBy('name', 'asc');
    // }

    /**
     * For the Frontend: Only active children
     */
    // public function activeChildrenRecursive(): HasMany
    // {
    //     return $this->children()
    //         ->where('active', true)
    //         ->with('activeChildrenRecursive') 
    //         ->orderBy('name', 'asc');
    // }

    public function childrenRecursive(): HasMany
    {
        return $this->children()
            // 1. Count all children (including inactive ones)
            ->withCount('children') 
            // 2. Sort by the count (highest first)
            ->orderBy('children_count', 'desc')
            // 3. Fallback to alphabetical
            ->orderBy('name', 'asc')
            // 4. Recurse
            ->with('childrenRecursive');
    }

    public function activeChildrenRecursive(): HasMany
    {
        return $this->children()
            ->where('active', true)
            // 1. Calculate how many children each child has
            ->withCount('children') 
            // 2. Sort by that count (highest first)
            ->orderBy('children_count', 'desc')
            // 3. Fallback to alphabetical if counts are equal
            ->orderBy('name', 'asc')
            // 4. Keep the recursion going
            ->with('activeChildrenRecursive');
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
        $clear = function () {
            Cache::forget('active_category_tree');
            // If you choose to cache the admin index, clear that too:
            // Cache::forget('admin_category_tree'); 
        };

        static::saved(fn () => Cache::forget('active_category_tree'));
        static::deleted(fn () => Cache::forget('active_category_tree'));
    }

    /**
     * Get all descendant IDs in a flat array.
     */
    public function getAllDescendantIds()
    {
        $ids = [];
        foreach ($this->children()->where('active', true)->get() as $child) {
            $ids[] = $child->id;
            $ids = array_merge($ids, $child->getAllDescendantIds());
        }
        return $ids;
    }
}
