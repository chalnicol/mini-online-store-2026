<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class NotificationResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        // return parent::toArray($request);
        return [
            'id' => $this->id,
            // Flatten the JSON 'data' so React doesn't have to dig
            'title' => $this->data['title'] ?? 'New Notification',
            'message' => $this->data['message'] ?? '',
            'url' => $this->data['url'] ?? '#',
            'type' => $this->type,
            'isRead' => $this->read_at !== null,
            'date' => $this->created_at->diffForHumans(),
        ];

        
    }
}
