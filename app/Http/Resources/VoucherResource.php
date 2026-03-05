<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Auth;
use Carbon\Carbon;

class VoucherResource extends JsonResource
{
	/**
	 * Transform the resource into an array.
	 */
	public function toArray(Request $request): array
	{
		// 1. Check if user is logged in
		$user = Auth::user();

		$subtotal = $request->input('subtotal', 0); // Pass subtotal via request or helper

		return [
			'id' => $this->id,
			'code' => $this->code,
			'type' => $this->type,
			'value' => (float) $this->value,
			'minSpend' => (float) $this->min_spend,
			// 'expiresAt' => $this->expires_at ? Carbon::parse($this->expires_at)->format('Y-m-d H:i') : null,
			'expiresAt' => $this->expires_at ?? null,
			'isActive' => (bool) $this->is_active,
			'isPersonal' => (bool) $this->is_personal, // Returns true/false boolean

			'description' => $this->description,
			'usageLimit' => $this->usage_limit,
			'usedCount' => (int) $this->used_count,

			// Relationship Fix: Voucher belongsTo User (single), not collection
			'users' => UserResource::collection($this->whenLoaded('users')),

			// Final Apply Logic
			'canApply' => $this->isUsable($subtotal, $user?->id),
			'amountNeeded' => max(0, $this->min_spend - $subtotal),
			'isClaimed' => $user ? $this->users->contains($user->id) : false,
			'isExpired' => $this->expires_at?->isPast() ?? false,
		];
	}
}
