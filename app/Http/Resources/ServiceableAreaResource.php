<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ServiceableAreaResource extends JsonResource
{
  public function toArray(Request $request): array
  {
    return [
      'id' => $this->id,
      'barangay' => $this->barangay,
      'city' => $this->city,
      'province' => $this->province,
      'isActive' => (bool) $this->is_active,
      'fullLabel' => $this->full_label,
    ];
  }
}
