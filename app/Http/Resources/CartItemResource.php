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
            'id' => $this->id, // Unique ID for the cart row
            'quantity' => $this->cart_quantity,
            // Reuse your existing variant resource for consistency!
            'variant' => new ProductVariantResource($this),
            'isChecked' => (bool) ($this->is_checked ?? true), // camelCase
        ];
    }
}
