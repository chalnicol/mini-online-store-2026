<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CartItemResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->product_variant_id, // Unique ID for the cart row
            'quantity' => $this->quantity,
            // Reuse your existing variant resource for consistency!
            'variant' => new ProductVariantResource($this->variant),
            'isChecked' => (bool) ($this->checked ?? true), // camelCase
        ];
    }
}
