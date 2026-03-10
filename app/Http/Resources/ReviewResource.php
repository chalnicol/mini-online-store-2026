<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ReviewResource extends JsonResource
{
  public function toArray(Request $request): array
  {
    return [
      'id' => $this->id,
      'rating' => (int) $this->rating,
      'comment' => $this->comment,
      'createdAt' => $this->created_at->format('M d, Y'),
      'relativeTime' => $this->updated_at ? $this->updated_at->diffForHumans() : $this->created_at->diffForHumans(),
      'isPublished' => (bool) $this->is_published,
      'isUpdated' => $this->updated_at->ne($this->created_at), // ✅ safer than !=

      'user' => $this->relationLoaded('user')
        ? [
          'id' => $this->user->id ?? null,
          'name' => $this->user ? (trim("{$this->user->fname} {$this->user->lname}") ?: 'Anonymous') : 'Anonymous', // ✅ handles null user (anonymized)
          'avatar' => $this->user->profile_photo_url ?? null,
        ]
        : null,

      'product' => $this->relationLoaded('product')
        ? [
          'id' => $this->product->id ?? null,
          'name' => $this->product->name ?? null,
          'slug' => $this->product->slug ?? null,
        ]
        : null,

      'variant' => $this->relationLoaded('variant')
        ? [
          'id' => $this->variant->id ?? null,
          'name' => $this->variant->name ?? null,
          'sku' => $this->variant->sku ?? null,
          'imagePath' => $this->variant->image_path ?? null, //
        ]
        : null,

      // ✅ Added — needed for user reviews page edit/delete actions
      'productId' => $this->product_id,
      'productVariantId' => $this->product_variant_id,
    ];
  }
}
