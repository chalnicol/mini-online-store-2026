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
            'name' => $this->name, // "L / Blue"
            'sku' => $this->sku,
            
            // Replace hardcoded size/color with the JSON attributes array
            'attributes' => $this->attributes, // Sends { "Size": "L", "Color": "Blue" }
            
            'imagePath' => $this->image_path,
            
            // Prices cast to float for JS math safety
            'price' => (float) $this->price,
            'calculatedPrice' => (float) $this->calculated_price, 
            // 'compareAtPrice' => $this->compare_at_price ? (float) $this->compare_at_price : null,
            
            'stockQty' => (int) $this->stock_qty,
            'isActive' => (bool) $this->is_active,

            // Relations
            'discounts' => DiscountResource::collection($this->whenLoaded('discounts')),
            'reviews' => ReviewResource::collection($this->whenLoaded('reviews')),
            
            'productId' => $this->product_id,
            // 'product' => new ProductResource($this->whenLoaded('product')),
            'product' => [
                'name' => $this->product->name ?? null,
                'slug' => $this->product->slug ?? null,
                'id' => $this->product->id ?? null,
            ]
        ];
    }
}
