<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class OrderResource extends JsonResource
{
  public function toArray(Request $request): array
  {
    return [
      'id' => $this->id,
      'orderNumber' => $this->order_number,
      'userId' => $this->user_id,
      'addressId' => $this->address_id,

      'shippingContactPerson' => $this->shipping_contact_person,
      'shippingContactNumber' => $this->shipping_contact_number,
      'shippingFullAddress' => $this->shipping_full_address,

      'voucherCode' => $this->voucher_code,
      'voucherDiscount' => (float) $this->voucher_discount,

      'itemsSubtotal' => (float) $this->items_subtotal,
      'shippingFee' => (float) $this->shipping_fee,
      'finalTotal' => (float) $this->final_total,

      'status' => $this->status,
      'paymentStatus' => $this->payment_status,
      'paymentMethod' => $this->payment_method,

      'deliveryType' => $this->delivery_type,
      'deliverySchedule' => $this->delivery_schedule,

      'notes' => $this->notes,

      'isCancellable' => $this->isCancellable(),
      'isReturnable' => $this->isReturnable(),

      'createdAt' => $this->created_at->format('M d, Y'),
      'relativeTime' => $this->created_at->diffForHumans(),
      'updatedAt' => $this->updated_at->format('M d, Y'),

      'items' => OrderItemResource::collection($this->whenLoaded('items')),
      // 'returns' => OrderReturnResource::collection($this->whenLoaded('returns')),
      'address' => new UserAddressResource($this->whenLoaded('address')),

      'user' => $this->relationLoaded('user')
        ? [
          'id' => $this->user->id,
          'fullName' => $this->user->fname . ' ' . $this->user->lname,
        ]
        : null,
    ];
  }
}
