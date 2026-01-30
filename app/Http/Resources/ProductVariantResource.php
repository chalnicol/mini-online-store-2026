<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProductVariantResource extends JsonResource
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
            'sku' => $this->sku,
            'size' => $this->size,
            'color' => $this->color,
            'image' => $this->image_path,
            
            'price' => number_format($this->price, 2),
            'compare_at_price' => $this->compare_at_price,
            'stock_qty' => $this->stock_qty,
            'discounts' => DiscountResource::collection($this->whenLoaded('discounts')),
            'reviews' => ReviewResource::collection($this->whenLoaded('reviews')),
        ];
    }
}
