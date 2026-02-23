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
        return [
            'id' => $this->id,
            'name' => $this->name,
            'slug' => $this->slug,
            'parentId' => $this->parent_id,
            'parent' => new CategoryResource($this->whenLoaded('parent')),
            // Recursively load children if they are eager-loaded
            'children' => $this->when(
                $this->relationLoaded('activeChildrenRecursive'),
                fn() => CategoryResource::collection($this->activeChildrenRecursive),
                $this->when(
                    $this->relationLoaded('childrenRecursive'),
                    fn() => CategoryResource::collection($this->childrenRecursive),
                    [] // Default to empty array if nothing is loaded
                )
            ),
            'isLeaf' => $this->isLeaf(), // Using the method from your model
        ];
    }
}
