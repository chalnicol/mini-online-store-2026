<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class OrderItemResource extends JsonResource
{
  public function toArray(Request $request): array
  {
    return [
      'id' => $this->id,
      'orderId' => $this->order_id,
      'productVariantId' => $this->product_variant_id,
      'productName' => $this->product_name,
      'variantName' => $this->variant_name,
      'variantAttributes' => $this->variant_attributes,
      'quantity' => (int) $this->quantity,
      'priceAtPurchase' => (float) $this->price_at_purchase,
      'discountAtPurchase' => (float) $this->discount_at_purchase,
      'lineTotal' => (float) $this->lineTotal(),
      'variant' => new ProductVariantResource($this->whenLoaded('variant')),
    ];
  }
}
