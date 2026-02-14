<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProductResource extends JsonResource
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
            'name' => $this->name,
            'slug' => $this->slug,
            'description' => $this->description,
            'price' => (float) $this->price,
            
            'category' => new CategoryResource($this->whenLoaded('category')),
            'categoryId' => $this->category_id,
            // Nesting the variants here
            'variants' => ProductVariantResource::collection($this->whenLoaded('variants')),

            // Reviews are usually only loaded on the 'Show' page
            'reviews' => ReviewResource::collection($this->whenLoaded('reviews')),
            
            'createdAt' => $this->created_at->format('Y-m-d'),
            'updatedAt' => $this->updated_at->format('Y-m-d'),
            'averageRating' => (float) ($this->average_rating ?? 0),
            'reviewsCount' => (int) ($this->reviews_count ?? 0),
            'variantsCount' => (int) ($this->variants_count ?? 0)
        ];
    }
}
