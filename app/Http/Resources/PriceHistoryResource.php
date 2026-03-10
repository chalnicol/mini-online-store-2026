<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PriceHistoryResource extends JsonResource
{
  /**
   * Transform the resource into an array.
   *
   * @return array<string, mixed>
   */
  public function toArray(Request $request): array
  {
    return [
      'id' => $this->id,
      'variantId' => $this->product_variant_id,
      'variant' => new ProductVariantResource($this->whenLoaded('variant')),
      'oldPrice' => $this->old_price,
      'newPrice' => $this->new_price,
      'marginAtTime' => $this->margin_at_time,
      'reason' => $this->reason,
      'createdAt' => $this->created_at,
      'updatedAt' => $this->updated_at,
    ];
  }
}
