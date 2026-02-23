<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Factories\HasFactory; // 1. Import the trait
// use Illuminate\Database\Eloquent\SoftDeletes;

class Product extends Model
{
    use HasFactory; 
    
    protected $fillable = [
        'category_id', 
        'name', 
        'slug', 
        'description', 
        'average_rating',
        'is_published'
    ];

    protected $appends = ['variants_count', 'reviews_count'];

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    public function variants(): HasMany
    {
        return $this->hasMany(ProductVariant::class);
    }

    public function activeVariants()
    {
        return $this->hasMany(Variant::class)->where('is_active', true);
    }

    public function reviews(): HasMany
    {
        return $this->hasMany(Review::class);
    }

    //get variants count
    public function getVariantsCountAttribute(): int
    {
        return (int) $this->variants()->count();
    }
    //get reviews count
    public function getReviewsCountAttribute(): int
    {
        return (int) $this->reviews()->count();
    }



}