<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Auth;

class VoucherResource extends JsonResource
{
  public function toArray(Request $request): array
  {
    $user = Auth::user();
    $subtotal = (float) $request->input('subtotal', 0);

    $isClaimed = $user && $this->relationLoaded('users') ? $this->users->contains('id', $user->id) : false;

    return [
      'id' => $this->id,
      'code' => $this->code,
      'type' => $this->type,
      'value' => (float) $this->value,
      'minSpend' => (float) $this->min_spend,
      'expiresAt' => $this->expires_at ?? null,
      'isActive' => (bool) $this->is_active,
      'isPersonal' => (bool) $this->is_personal,
      'description' => $this->description,
      'usageLimit' => $this->usage_limit,
      'usedCount' => (int) $this->used_count,
      'isExpired' => $this->expires_at?->isPast() ?? false,
      'isClaimed' => $isClaimed,

      // ✅ Only meaningful in checkout context (subtotal > 0)
      // In profile pages subtotal = 0 so canApply = false — handled by mode in frontend
      'canApply' => $this->isUsable($subtotal, $user?->id),
      'amountNeeded' => max(0, (float) $this->min_spend - $subtotal),
    ];
  }
}
