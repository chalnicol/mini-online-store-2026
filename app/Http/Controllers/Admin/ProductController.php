<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

use App\Models\Product;
use App\Http\Resources\ProductResource;

use Inertia\Inertia;

class ProductController extends Controller
{
    public function index(Request $request)
    {
        
        $products = Product::query()
            ->with(['variants.discounts', 'category', 'reviews'])
            // Use 'where' inside a closure if you plan to search multiple columns later
            ->when($request->search, function ($query, $search) {
                // Grouping the OR conditions inside a nested closure
                $query->where(function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%");
                });
            })
            ->latest()
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('admin/products/index', [
            'products' => ProductResource::collection($products),
            'filters' => (object) $request->only(['search'])
        ]);

        

    }
}
