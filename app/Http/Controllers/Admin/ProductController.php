<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

use App\Models\Product;
use App\Http\Resources\ProductResource;

use Inertia\Inertia;

class ProductController extends Controller
{
    public function index(Request $request)
    {
        
        $products = Product::query()
            ->with(['variants',])
            // Use 'where' inside a closure if you plan to search multiple columns later
            ->when($request->search, function ($query, $search) {
                // Grouping the OR conditions inside a nested closure
                $query->where(function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%");
                });
            })
            // ->latest()
            ->orderBy('updated_at', 'desc')
            ->orderBy('id', 'desc')
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('admin/products/index', [
            'products' => ProductResource::collection($products),
            'filters' => (object) $request->only(['search'])
        ]);

    }
    public function create ()
    {
        return Inertia::render('admin/products/create');
    }

    public function store (Request $request) 
    {
        //..
        $validated = $request->validate([
            'category_id' => 'required|integer|exists:categories,id', // Plural 'categories' is standard
            'description' => 'nullable|string',
            'name'        => 'required|string|min:5|max:50|unique:products,name',
            'is_published' => 'nullable|boolean',
        ]);

        Product::create([
            'name'        => $validated['name'],
            'description' => $validated['description'],
            'category_id' => $validated['category_id'],
            'slug'        => Str::slug($validated['name']),
            'is_published' => $validated['is_published'],
        ]);

        return to_route('admin.products')->with('success', 'Product created successfully!');
        
    }

    public function show (Product $product) 
    {
        
        return Inertia::render('admin/products/show', [
            'product' => new ProductResource($product->load(['variants', 'publishedReviews.user', 'category',])),
        ]);
    }

    public function edit(Product $product)
    {
        return Inertia::render('admin/products/edit', [
            'product' => new ProductResource($product->load(['variants', 'category'])),
        ]);

    }

    public function update(Request $request, Product $product) 
    {
        $validated = $request->validate([
            'name'         => 'required|string|min:5|max:50|unique:products,name,' . $product->id,
            'category_id'  => 'required|integer|exists:categories,id',
            'description'  => 'nullable|string',
            'is_published' => 'nullable|boolean',
        ]);

        // Check if they are trying to publish WITHOUT active variants
        if (($validated['is_published'] ?? false) == true) {
            $hasActiveVariants = $product->variants()->where('is_active', true)->exists();
            
            if (!$hasActiveVariants) {
                return back()->withErrors([
                    'is_published' => 'Cannot publish: This product has no active variants.'
                ])->withInput();
            }
        }

        $product->update([
            'name'         => $validated['name'],
            'description'  => $validated['description'],
            'category_id'  => $validated['category_id'],
            'slug'         => Str::slug($validated['name']),
            'is_published' => $validated['is_published'] ?? false,
        ]);

        return to_route('admin.products')->with('success', 'Product updated successfully!');
    }

    public function destroy (Product $product)
    {
        $product->delete();
        
        return to_route('admin.products')->with('success', 'The product has been deleted succesfully!');

    }

    public function togglePublishedStatus(Product $product)
    {
        // If currently UNPUBLISHED, we are trying to PUBLISH it
        if (!$product->is_published) {
            $hasActiveVariants = $product->variants()->where('is_active', true)->exists();

            if (!$hasActiveVariants) {
                return back()->withErrors([
                    'product' => 'There must be at least one active variant to publish this product.'
                ]);
            }
        }

        // Toggle the status
        $product->is_published = !$product->is_published;
        $product->save();

        return back()->with('success', 'Product status updated successfully.');
    }

    public function createVariant(Product $product)
    {
        return Inertia::render('admin/products/create-variant', [
            'product' => new ProductResource($product),
        ]);
    }

}
