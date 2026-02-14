<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
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
            'fname' => $this->fname,
            'lname' => $this->lname,
            // We only show the email if the user is viewing their own profile 
            // or if the person viewing is an Admin
            'email' => $this->when(
                $request->user()?->hasRole('admin') || $request->user()?->id === $this->id, 
                $this->email
            ),
            // We can conditionally show roles if the requester is an Admin
            'roles' => $this->when($request->user()?->hasRole('admin'), function() {
                return $this->getRoleNames();
            }),
            // This collection only appears if you Eager Load it in the Controller
            'addresses' => UserAddressResource::collection($this->whenLoaded('addresses')),
            'contacts' => UserContactResource::collection($this->whenLoaded('contacts')),
            'memberSsince' => $this->created_at->format('M Y'),
            'isVerified' => $this->hasVerifiedEmail(),
            'isBlocked' => (bool) $this->is_blocked,
            //..
            'unreadNotificationsCount' => (int) ($this->unread_notifications_count ?? 0),
            // 'cartCount' => (int) ($this->cart_item_count ?? 0),
           
        
        ];
    }
}
