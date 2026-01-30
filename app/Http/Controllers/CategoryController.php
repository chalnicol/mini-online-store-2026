<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Http\Resources\CategoryResource;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;


class CategoryController extends Controller
{
    public function index()
    {
        return Cache::rememberForever('global_category_tree', function () {
            $categories = Category::whereNull('parent_id')
                ->with('childrenRecursive')
                ->orderBy('name', 'asc')
                ->get();
            return CategoryResource::collection($categories)->resolve();
        });
    }

    public function show($slug)
    {
        // Fetch a single category by slug with its immediate children
        $category = Category::where('slug', $slug)
            ->with('children')
            ->firstOrFail();

        return response()->json($category);
    }
    

}