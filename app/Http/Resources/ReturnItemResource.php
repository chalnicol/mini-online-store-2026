<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ReturnItemResource extends JsonResource
{
  public function toArray(Request $request): array
  {
    return [
      'id' => $this->id,
      'productName' => $this->product_name,
      'variantName' => $this->variant_name,
      'quantity' => (int) $this->quantity,
      'reason' => $this->reason,
      'condition' => $this->condition,
      'resolution' => $this->resolution,
      'isRestocked' => (bool) $this->is_restocked,
      'variant' => $this->relationLoaded('variant')
        ? [
          'id' => $this->variant?->id,
          'imagePath' => $this->variant?->image_path,
        ]
        : null,
    ];
  }
}
