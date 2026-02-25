<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Product;
use App\Models\Category;
use App\Models\ProductVariant;
use App\Http\Resources\ProductResource;
use Illuminate\Support\Facades\DB;

class StoreController extends Controller
{
    //
    public function index(Request $request)
    {
        $now = now()->toDateTimeString();

        // 1. Base Query: Only get published products 
        // and filter the variants to only include active ones
        $query = Product::where('is_published', true)
            ->with(['category', 'variants' => function($q) {
                $q->where('is_active', true)->with('discounts');
            }])
            // Add these two lines
            ->whereHas('variants', function($q) {
                $q->where('is_active', true);
            });

        // Category Filter
        if ($request->filled('category')) {
            // Only find categories that are ACTIVE. 
            // If deactivated or missing, firstOrFail() throws the 404 you want.
            $category = Category::with('children')
                ->where('slug', $request->category)
                ->where('active', true) // <--- Strict check for active status
                ->firstOrFail();

            // Get the IDs for the category and all its active descendants
            // Note: ensure getAllDescendantIds() only returns active children as well
            $categoryIds = collect($category->getAllDescendantIds())->push($category->id);
            
            $query->whereIn('category_id', $categoryIds);
        }

        // Search Logic
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('name', 'like', "%$search%")
                ->orWhereHas('category', function($catQuery) use ($search) {
                    $catQuery->where('name', 'like', "%$search%");
                })
                ->orWhereHas('variants', function($variantQuery) use ($search) {
                    $variantQuery->where('is_active', true) // Only search active variants
                                ->where(function($sub) use ($search) {
                                    $sub->where('name', 'like', "%$search%")
                                        ->orWhere('sku', 'like', "%$search%");
                                });
                });
            });
        }

        $bestPrices = DB::table('product_variants')
            ->select('product_variants.product_id')
            ->leftJoin('discount_product_variant', 'product_variants.id', '=', 'discount_product_variant.product_variant_id')
            ->leftJoin('discounts', function($join) use ($now) {
                $join->on('discount_product_variant.discount_id', '=', 'discounts.id')
                    ->where('discounts.is_active', true)
                    ->where('discounts.start_date', '<=', $now)
                    ->where('discounts.end_date', '>=', $now);
            })
            ->where('product_variants.is_active', true)
            ->selectRaw("
                MIN(CASE 
                    WHEN discounts.id IS NOT NULL THEN 
                        CASE 
                            WHEN discounts.type = 'percentage' 
                                THEN (product_variants.price - (product_variants.price * (discounts.value / 100.0)))
                            WHEN discounts.type = 'fixed' 
                                THEN (product_variants.price - discounts.value)
                            ELSE product_variants.price
                        END
                    ELSE product_variants.price
                END) as final_price
            ", [])
            ->groupBy('product_variants.product_id');

        $query->select([
            'products.*', 
            'price_lookup.final_price' // Ensure the calculated price is also selected
        ])
        ->withCount('reviews') // Laravel adds 'reviews_count' automatically
        ->leftJoinSub($bestPrices, 'price_lookup', function ($join) {
            $join->on('products.id', '=', 'price_lookup.product_id');
        });

        // Sorting and Pagination
        $sort = $request->get('sort', 'date-desc');
        $this->applySorting($query, $sort);

        $perPage = $request->get('per_page', 20);

        return Inertia::render('shop/home', [
            'data' => ProductResource::collection(
                $query->paginate($perPage)->withQueryString()
            ),
            'filters' => (object) $request->only(['search', 'category', 'sort']),
        ]);
    }

    public function show($slug)
    {
        // $product = Product::with(['category', 'variants.discounts', 'reviews.user', 'reviews.variant'])
        //     ->where('slug', $slug)
        //     ->firstOrFail();
        $product = Product::with([
            'category',
            
            // 1. Only get active variants
            'variants' => fn($q) => $q->where('is_active', true),
            'variants.discounts',

            //
            'publishedReviews.user',
            'publishedReviews.variant' // This will now only load active variants for these reviews
        ])
        ->where('slug', $slug)
        ->where('is_published', true) // Best practice for a 'show' page
        ->firstOrFail();

        // return new ProductResource($product);
        return Inertia::render('shop/product-details', [
            'product' => new ProductResource($product),
        ]);
    }

    /**
     * Extracted sorting logic to keep index() clean
     */
    private function applySorting($query, $sort)
    {
        switch ($sort) {
            case 'price-asc':
                // $query->addSelect(['min_p' => ProductVariant::select('price')
                //     ->whereColumn('product_id', 'products.id')->orderBy('price', 'asc')->limit(1)
                // ])->orderBy('min_p', 'asc');
                $query->orderBy('price_lookup.final_price', 'asc');
                break;
            case 'price-desc':
                // $query->addSelect(['max_p' => ProductVariant::select('price')
                //     ->whereColumn('product_id', 'products.id')->orderBy('price', 'desc')->limit(1)
                // ])->orderBy('max_p', 'desc');
                $query->orderBy('price_lookup.final_price', 'desc');
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
