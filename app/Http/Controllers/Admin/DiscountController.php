<?php

namespace App\Http\Controllers\Admin;

use App\Models\Discount;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use App\Http\Resources\DiscountResource;
use App\Http\Resources\ProductVariantResource;

use App\Models\ProductVariant;
use Inertia\Inertia;
use Illuminate\Validation\Rule;

class DiscountController extends Controller
{
    public function index(Request $request)
    {
        $discounts = Discount::query()
            ->withCount('variants')
            ->when($request->search, function ($query, $search) {
                $query->where(function ($q) use ($search) {
                    $q->where('code', 'like', "%{$search}%")
                      ->orWhere('description', 'like', "%{$search}%");
                });
            })
            ->orderBy('updated_at', 'desc')
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('admin/discounts/index', [
            'discounts' => DiscountResource::collection($discounts),
            'filters' => (object) $request->only(['search'])
        ]);
    }

    public function create()
    {
        return Inertia::render('admin/discounts/create');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'code'        => 'required|string|max:50|unique:discounts,code',
            'type'        => 'required|in:fixed,percentage',
            'value'       => 'required|numeric|min:0',
            'description' => 'nullable|string|max:255',
            'is_active'   => 'boolean',
            'start_date'  => 'required|date',
            'end_date'    => 'nullable|date|after:start_date', // Validation: End > Start
            'variant_ids' => 'nullable|array',
            'variant_ids.*' => 'exists:product_variants,id',
        ]);

        $discount = Discount::create($validated);

        // Attach variants if provided
        if ($request->has('variant_ids')) {
            $discount->variants()->sync($request->variant_ids);
        }

        return to_route('admin.discounts.show', $discount->id)
            ->with('success', 'Discount created successfully.');
    }

    public function show(Discount $discount)
    {
        return Inertia::render('admin/discounts/show', [
            'discount' => new DiscountResource($discount->load(['variants.product'])),
        ]);
    }

    public function edit(Discount $discount)
    {
        return Inertia::render('admin/discounts/edit', [
            'discount' => new DiscountResource($discount->load(['variants.product'])),
        ]);
    }

    public function update(Request $request, Discount $discount)
    {
        $validated = $request->validate([
            // Unique code check, ignoring the current ID
            'code'        => ['required', 'string', 'max:50', Rule::unique('discounts')->ignore($discount->id)],
            'type'        => 'required|in:fixed,percentage',
            'value'       => 'required|numeric|min:0',
            'description' => 'nullable|string|max:255',
            'is_active'   => 'boolean',
            'start_date'  => 'required|date',
            'end_date'    => 'nullable|date|after:start_date',
            'variant_ids' => 'nullable|array',
            'variant_ids.*' => 'exists:product_variants,id',
        ]);

        $discount->update($validated);

        // Sync variants (removes old ones, adds new ones)
        if ($request->has('variant_ids')) {
            $discount->variants()->sync($request->variant_ids);
        }

        return to_route('admin.discounts.show', $discount->id)
            ->with('success', 'Discount updated successfully');
            
    }

    public function destroy(Discount $discount)
    {
        // Guard: Cannot delete if variants are attached
        if ($discount->variants()->exists()) {
            return back()->withErrors([
                'delete' => 'Cannot delete discount because it is currently applied to one or more product variants.'
            ]);
        }

        $discount->delete();

        return to_route('admin.discounts.show', $discount->id)
            ->with('success', 'Discount deleted successfully.');
    }

    public function toggleStatus(Discount $discount)
    {
        $discount->is_active = !$discount->is_active;
        $discount->save();

        return back()->with('success', 'Discount status updated.');
    }

    public function searchVariants(Request $request)
    {
        $variants = ProductVariant::query()
            ->with(['product'])
            ->where('is_active', true)
            // Only run this if there is a search term
            ->when($request->search, function ($query, $search) {
                $query->where(function ($q) use ($search) {
                    // 1. Search the Variant's SKU (if you have one)
                    $q->where('sku', 'like', "%{$search}%")
                    // 2. Search the parent Product's name
                    ->orWhereHas('product', function ($productQuery) use ($search) {
                        $productQuery->where('name', 'like', "%{$search}%");
                    });
                });
            })
            ->limit(10) // Good for performance in a picker modal
            ->get();     // Execute the query
          

        return response()->json(
            ProductVariantResource::collection($variants)
        );
    }

}
