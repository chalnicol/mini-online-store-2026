<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserAddressResource extends JsonResource
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
      'type' => $this->type,
      'streetAddress' => $this->street_address,
      'fullAddress' => $this->full_address, // computed accessor
      'contactPerson' => $this->contact_person,
      'contactNumber' => $this->contact_number,
      'isDefault' => (bool) $this->is_default,
      'userId' => $this->user_id,
      'serviceableAreaId' => $this->serviceable_area_id,
      'serviceableArea' => $this->relationLoaded('serviceableArea')
        ? [
          'id' => $this->serviceableArea?->id,
          'barangay' => $this->serviceableArea?->barangay,
          'city' => $this->serviceableArea?->city,
          'isActive' => (bool) $this->serviceableArea?->is_active,
          'fullLabel' => $this->serviceableArea?->full_label,
        ]
        : null,
    ];
  }
}
