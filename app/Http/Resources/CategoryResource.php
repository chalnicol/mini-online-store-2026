<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CategoryResource extends JsonResource
{
  /**
   * Transform the resource into an array.
   *
   * @return array<string, mixed>
   */
  public function toArray(Request $request): array
  {
    // $children = CategoryResource::collection($this->whenLoaded('children'));

    return [
      'id' => $this->id,
      'name' => $this->name,
      'slug' => $this->slug,
      'parentId' => $this->parent_id,
      'parent' => new CategoryResource($this->whenLoaded('parent')),
      // Recursively load children if they are eager-loaded
      'children' => $this->when(
        $this->relationLoaded('activeChildrenRecursive') ||
          $this->relationLoaded('childrenRecursive') ||
          $this->relationLoaded('children'),
        function () {
          if ($this->relationLoaded('activeChildrenRecursive')) {
            return CategoryResource::collection($this->activeChildrenRecursive);
          }
          if ($this->relationLoaded('childrenRecursive')) {
            return CategoryResource::collection($this->childrenRecursive);
          }
          return CategoryResource::collection($this->children);
        },
      ),
      'products' => $this->when(
        $this->relationLoaded('products'),
        fn() => ProductResource::collection($this->products),
        [], // Default to empty array if nothing is loaded
      ),
      'productsCount' => (int) $this->products_count,
      'isLeaf' => $this->isLeaf(), // Using the method from your model
      'isActive' => $this->active,
    ];
  }
}
