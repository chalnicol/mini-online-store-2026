<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Product;
use App\Models\Category;
use App\Models\ProductVariant;
use App\Http\Resources\ProductResource;


class StoreController extends Controller
{
    //
    public function index(Request $request)
    {
        // Start the query with eager loading
        $query = Product::with(['category', 'variants.discounts']);

        if ($request->filled('category')) {
            // Eager load 'children' to make the recursion efficient
            $category = Category::with('children')->where('slug', $request->category)->firstOrFail();
            
            // 1. Get all nested IDs
            // 2. Add the current category's ID to the list
            $categoryIds = collect($category->getAllDescendantIds())->push($category->id);
            
            // Filter products by this combined list of IDs
            $query->whereIn('category_id', $categoryIds);
        }

        // 2. Multi-Field Search (Product Name or Variant SKU)
        if ($request->filled('search')) {
            $search = $request->search;
            
            $query->where(function($q) use ($search) {
                // Search Product Name
                $q->where('name', 'like', "%$search%")
                
                // Search Category Name
                ->orWhereHas('category', function($catQuery) use ($search) {
                    $catQuery->where('name', 'like', "%$search%");
                })
                
                // Search Variant Name or SKU
                ->orWhereHas('variants', function($variantQuery) use ($search) {
                    $variantQuery->where('name', 'like', "%$search%")
                                ->orWhere('sku', 'like', "%$search%");
                });
            });
        }

        // 3. Sorting (A-Z, Price, Rating)
        $sort = $request->get('sort', 'date-desc');

        $this->applySorting($query, $sort);

        // 4. Final Pagination
        $perPage = $request->get('per_page', 20);
        // return ProductResource::collection($query->paginate($perPage));
        // return Inertia::render('shop/home', [
        //     'data' => ProductResource::collection($query->paginate($perPage)),  
        // ]);
        return Inertia::render('shop/home', [
            'data' => ProductResource::collection(
                $query->paginate($perPage)->withQueryString() // Crucial for Load More!
            ),
            'filters' => $request->only(['search', 'category', 'sort']),
        ]);
    }

    public function show($slug)
    {
        $product = Product::with(['category', 'variants.discounts', 'reviews.user'])
            ->where('slug', $slug)
            ->firstOrFail();

        return new ProductResource($product);
    }


    /**
     * Extracted sorting logic to keep index() clean
     */
    private function applySorting($query, $sort)
    {
        switch ($sort) {
            case 'price-asc':
                $query->addSelect(['min_p' => ProductVariant::select('price')
                    ->whereColumn('product_id', 'products.id')->orderBy('price', 'asc')->limit(1)
                ])->orderBy('min_p', 'asc');
                break;
            case 'price-desc':
                $query->addSelect(['max_p' => ProductVariant::select('price')
                    ->whereColumn('product_id', 'products.id')->orderBy('price', 'desc')->limit(1)
                ])->orderBy('max_p', 'desc');
                break;
            case 
                'name-asc': $query->orderBy('name', 'asc'); 
                break;
            case 
                'name-desc': $query->orderBy('name', 'desc'); 
                break;
            case 'rating-desc': 
                $query->orderBy('average_rating', 'desc');
                break;
            case 'rating-asc': 
                $query->orderBy('average_rating', 'asc');
                break;
            case 'date-desc':
                // Shows the most recently added products first
                $query->orderBy('created_at', 'desc');
                break;
            case 'date-asc':
                // Often used for "Clearance" or "Archive" views
                $query->orderBy('created_at', 'asc');
                break;

            case 'recently-updated':
                // Great for showing items that were just restocked or prices changed
                $query->orderBy('updated_at', 'desc');
                break;
            default: $query->latest(); break;
        }
    }
}
