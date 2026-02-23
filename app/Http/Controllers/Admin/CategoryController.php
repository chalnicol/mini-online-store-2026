<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Http\Resources\CategoryResource;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;

use Inertia\Inertia;


class CategoryController extends Controller
{
    

    public function index()
    {
        $categories = Category::whereNull('parent_id')
        ->with('childrenRecursive')
        ->orderBy('name', 'asc')
        ->get();

        return Inertia::render('admin/categories/index', [
            'allCategories' => CategoryResource::collection($categories)->resolve()
        ]);
    }

    public function show($slug)
    {
        // Fetch a single category by slug with its immediate children
        $category = Category::where('slug', $slug)
            ->with('children')
            ->firstOrFail();

        return response()->json($category);
    }

    public function store(Request $request)
    {
        // 1. Generate the slug manually to validate it
        $slug = Str::slug($request->name);
        
        $validator = Validator::make($request->all(), [
            'name' => [
                'required',
                'string',
                'max:255',
                Rule::unique('categories', 'name'),
            ],
            'parentId' => 'nullable|exists:categories,id',
        ]);

        // Manually check slug uniqueness and attach error to 'name'
        $validator->after(function ($validator) use ($slug) {
            $exists = Category::where('slug', $slug)
                ->exists();

            if ($exists) {
                // This forces the error to appear under the "name" key in your TS/React frontend
                $validator->errors()->add('name', 'This name results in a duplicate URL slug. Please try a more specific name.');
            }
        });

        if ($validator->fails()) {
            return back()->withErrors($validator)->withInput();
        }

        $category = Category::create([
            'name' => ucwords($request->name),
            'slug' => $slug,
            'parent_id' => $request->parentId,
        ]);

        return back();
    }

    public function update(Request $request, Category $category)
    {
        // 1. Generate the slug from the incoming name
        $slug = Str::slug($request->name);
        
        // 2. Inject it into the request for validation
        $request->merge(['slug' => $slug]);

        $validated = $request->validate([
            'name' => [
                'required',
                'string',
                'max:255',
                Rule::unique('categories', 'name')->ignore($category->id),
            ],
            'slug' => [
                'required',
                'string',
                Rule::unique('categories', 'slug')->ignore($category->id),
            ],
        ]);

        $category->update([
            'name' => ucwords($validated['name']),
            'slug' => $validated['slug'],
        ]);

        return back();
    }

    public function move(Request $request, Category $category)
    {
        $validated = $request->validate([
            'parentId' => 'nullable|exists:categories,id',
        ]);

        $newParentId = $validated['parentId'];

        if ($newParentId !== null) {
            if ($newParentId == $category->id || in_array($newParentId, $category->getAllDescendantIds())) {
                return back()->withErrors(['parentId' => 'Invalid movement.']);
            }
        }

        $category->update(['parent_id' => $newParentId]);

        return back();
    }

    public function toggleStatus(Category $category)
    {
        $category->update([
            'is_active' => !$category->is_active
        ]);

        return back();
    }

    public function destroy(Category $category)
    {
        // Check if the category has any children
        if ($category->children()->exists()) {
            return back()->withErrors([
                'delete' => "Cannot delete '{$category->name}' because it has subcategories. Please move or delete the subcategories first."
            ]);
        }
        if ($category->products()->exists()) {
            // return response()->json(['error' => 'Category has products. Move them first!'], 422);
            return back()->withErrors([
                'delete' => "Cannot delete '{$category->name}' because it has products. Please move or delete the products first."
            ]);
        }

        $category->delete();

        // No need to clear cache here if your Model has the 'booted' method!
        return back();
    }
        

}