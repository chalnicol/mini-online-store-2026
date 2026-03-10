<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class OrderReturnResource extends JsonResource
{
  public function toArray(Request $request): array
  {
    return [
      'id' => $this->id,
      'returnNumber' => $this->return_number,
      'orderId' => $this->order_id,
      'orderNumber' => $this->order?->order_number, // from eager loaded order
      'status' => $this->status,
      'adminNote' => $this->admin_note,
      'createdAt' => $this->created_at->format('M d, Y'),
      'items' => ReturnItemResource::collection($this->whenLoaded('items')),
    ];
  }
}
