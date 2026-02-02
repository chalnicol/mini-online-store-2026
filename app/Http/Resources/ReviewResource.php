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
            'relativeTime' => $this->created_at->diffForHumans(),

            // 1. Include User info only if it's loaded (useful for Product pages)
            'user' => [
                'name' => $this->user->fname . ' ' . $this->user->lname ?? 'Anonymous',
                'avatar' => $this->user->profile_photo_url ?? null, // if you have one
            ],
            // 2. Include Product info only if it's loaded (Crucial for "My Reviews" page)
            'product' => [
                'name' => $this->product->name ?? null,
                'slug' => $this->product->slug ?? null,
                'image' => $this->product->primary_image_url ?? null, // if you have one
            ],
            // 3. The specific variant purchased
            'variant' => [
                'name' => $this->product_variant->name ?? null,
                'sku' => $this->product_variant->sku ?? null,
            ],
        ];
    }
}

