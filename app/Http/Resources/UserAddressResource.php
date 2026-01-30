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
    public function toArray($request): array
    {
        return [
            'id' => $this->id,
            'type' => $this->type,
            'contactPerson' => $this->contact_person,
            'contactNumber' => $this->contact_number,
            'fullAddress' => $this->full_address,
            'isDefault' => (bool) $this->is_default,
        ];
    }
}
