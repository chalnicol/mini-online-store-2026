<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class InventoryMovementResource extends JsonResource
{
  /**
   * Transform the resource into an array.
   */
  public function toArray(Request $request): array
  {
    return [
      'id' => $this->id,
      'quantity' => $this->quantity,
      'unitCost' => $this->unit_cost,
      'type' => $this->type,
      'status' => $this->status,
      'reason' => $this->reason,
      'productVariantId' => $this->product_variant_id,
      'userId' => $this->user_id,
      'supplierId' => $this->supplier_id,
      'referenceId' => $this->reference_id,
      'referenceType' => $this->reference_type,
      'variant' => new ProductVariantResource($this->whenLoaded('variant')),
      'user' => new UserResource($this->whenLoaded('user')),
      'supplier' => new SupplierResource($this->whenLoaded('supplier')),

      'createdAt' => $this->created_at,
      'updatedAt' => $this->updated_at,
    ];
  }
}
