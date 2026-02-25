<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ReviewResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        // return parent::toArray($request);
     
        return [
            'id' => $this->id,
            'rating' => (int) $this->rating,
            'comment' => $this->comment,
            'createdAt' => $this->created_at->format('M d, Y'),
            'relativeTime' => $this->updated_at 
                ? $this->updated_at->diffForHumans() 
                : $this->created_at->diffForHumans(),

            // Use optional() or null coalescing to prevent crashes if relationships aren't loaded
            'user' => $this->relationLoaded('user') ? [
                'name' => trim(($this->user->fname ?? '') . ' ' . ($this->user->lname ?? '')) ?: 'Anonymous',
                'avatar' => $this->user->profile_photo_url ?? null,
            ] : null,

            'product' => $this->relationLoaded('product') ? [
                'name' => $this->product->name ?? null,
                'slug' => $this->product->slug ?? null,
            ] : null,

            'variant' => $this->relationLoaded('variant') ? [
                // Check if variant actually exists in the DB for this review
                'name' => $this->variant->name ?? null, 
                'sku' => $this->variant->sku ?? null,
            ] : null,

            'isPublished' => $this->is_published,
            'isUpdated' => $this->updated_at != $this->created_at,
        ];
    }
}

