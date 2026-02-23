<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

use App\Http\Resources\ProductVariantResource;

use App\Models\ProductVariant;
use App\Models\Product;

use Inertia\Inertia;

class ProductVariantController extends Controller
{
    public function index(Request $request)
    {
      //..  
    }

    public function create (Product $product) 
    {
        return Inertia::render('admin/variants/create', [
            'product' => [
                'id' => $product->id,
                'name' => $product->name,
            ],
        ]);
    }

    public function show(ProductVariant $variant) 
    {   

        return Inertia::render('admin/variants/show', [
           
            'variant' => new ProductVariantResource($variant->load(['discounts', 'reviews.user'])),
        ]);
    }

    public function edit ( ProductVariant $variant) 
    {
       return Inertia::render('admin/variants/edit', [
           
            'variant' => new ProductVariantResource($variant->load(['reviews.user'])),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'product_id' => 'required|exists:products,id',
            'name'       => 'required|string|max:255',
            'attributes' => 'required|array',
            'image'      => 'nullable|image|max:2048',
            'is_active'  => 'boolean',
        ]);

        $product = Product::with('variants')->findOrFail($validated['product_id']);

        // 1. Clean Attributes
        $cleanAttributes = array_filter($validated['attributes'], function ($v, $k) {
            return !empty(trim($k)) && !empty(trim($v));
        }, ARRAY_FILTER_USE_BOTH);

        if (empty($cleanAttributes)) {
            return back()->withErrors(['attributes' => 'At least one attribute is required.'])->withInput();
        }

        // 2. Uniqueness Check
        if ($product->variants()->where('name', $validated['name'])->exists()) {
            return back()->withErrors(['name' => 'A variant with this name already exists.'])->withInput();
        }

        // 3. Consistency Check (Only if other variants exist)
        $firstVariant = $product->variants->first();
        if ($firstVariant) {
            $requiredKeys = array_keys($firstVariant->attributes);
            $incomingKeys = array_keys($cleanAttributes);
            sort($requiredKeys);
            sort($incomingKeys);

            if ($requiredKeys !== $incomingKeys) {
                return back()->withErrors(['attributes' => 'Keys must match: ' . implode(', ', $requiredKeys)])->withInput();
            }
        }

        // 4. Create the Variant (No more forcing is_active to true)
        $variant = new ProductVariant();
        $variant->product_id = $product->id;
        $variant->name        = $validated['name'];
        $variant->attributes  = $cleanAttributes;
        $variant->is_active   = $validated['is_active'] ?? false; // Default to false if not provided
        $variant->price       = 0;
        $variant->stock_qty   = 0;

        if ($request->hasFile('image')) {
            $variant->image_path = $this->uploadAndGetName($request->file('image'), $product, $variant->name);
        }

        $variant->save();

        // 5. Automatic Product Sync: 
        // If the product was published but now has NO active variants, unpublish it.
        $activeCount = $product->variants()->where('is_active', true)->count();
        
        if ($activeCount === 0 && $product->is_published) {
            $product->update(['is_published' => false]);
            $statusMsg = 'Variant created. Product unpublished because it has no active variants.';
        } else {
            $statusMsg = 'Variant created successfully.';
        }

        return to_route('admin.products.show', $product->id)->with('success', $statusMsg);
    }

    /**
     * Update the existing variant
     */
    public function update(Request $request, ProductVariant $variant)
    {
        $validated = $request->validate([
            'name'       => 'required|string|max:255',
            'attributes' => 'required|array',
            'image'      => 'nullable|image|max:2048',
            'is_active'  => 'boolean',
        ]);

        $product = $variant->product;

        // 1. Uniqueness check (Ignore Self)
        $exists = ProductVariant::where('product_id', $variant->product_id)
            ->where('name', $validated['name'])
            ->where('id', '!=', $variant->id)
            ->exists();

        if ($exists) {
            return back()->withErrors(['name' => 'Name already in use.'])->withInput();
        }

        // 2. Handle Image
        if ($request->hasFile('image')) {
            if ($variant->image_path) Storage::disk('public')->delete($variant->image_path);
            $variant->image_path = $this->uploadAndGetName($request->file('image'), $product, $validated['name']);
        }

        $variant->name       = $validated['name'];
        $variant->attributes = $validated['attributes'];
        $variant->is_active  = $validated['is_active'];
        $variant->save();

        // 3. Logic: If NO variants are active, unpublish the product
        $activeCount = $product->variants()->where('is_active', true)->count();
        if ($activeCount === 0 && $product->is_published) {
            $product->update(['is_published' => false]);
            $statusMsg = 'Variant updated. Product unpublished because no active variants remain.';
        } else {
            $statusMsg = 'Variant updated successfully.';
        }

        return to_route('admin.products.show', $product->id)->with('success', $statusMsg);
    }

    
    /**
     * Destroy Variant
     */
    public function destroy(ProductVariant $variant)
    {
        $product = $variant->product;

        if ($variant->image_path) {
            Storage::disk('public')->delete($variant->image_path);
        }

        $variant->delete();

        // 4. Logic: If this was the last variant, or no active variants remain, unpublish
        $remainingActive = $product->variants()->where('is_active', true)->count();
        
        if ($remainingActive === 0 && $product->is_published) {
            $product->update(['is_published' => false]);
            $msg = 'Variant deleted. Product unpublished because no active variants remain.';
        } else {
            $msg = 'Variant deleted successfully.';
        }

        return to_route('admin.products.show', $product->id)->with('success', $msg);
    }

    public function toggleActiveStatus(ProductVariant $variant)
    {
        $product = $variant->product;

        // 1. Perform the toggle
        $variant->is_active = !$variant->is_active;
        $variant->save();

        // 2. Refresh count of active variants
        $activeCount = $product->variants()->where('is_active', true)->count();

        // 3. Logic: If no active variants remain, ensure product is unpublished
        if ($activeCount === 0 && $product->is_published) {
            $product->update(['is_published' => false]);
            
            return back()->with('success', 'Variant deactivated. Product has been unpublished as no active variants remain.');
        }

        // 4. (Optional) Logic: If we just activated a variant and the product was unpublished...
        // You could choose to leave it unpublished (safer) or auto-publish it. 
        // Most admins prefer manual publishing, so we'll just send a standard success.

        return back()->with('success', 'Variant status updated.');
    }

    /**
     * Helper to handle naming and storing
     * Format: products/{product-slug}/{variant-slug}-{timestamp}.jpg
     */
    /**
     * Organize and name images
     */
    private function uploadAndGetName($file, $product, $variantName)
    {
        $pSlug = Str::slug($product->name);
        $vSlug = Str::slug($variantName);
        $time  = now()->timestamp;
        $ext   = $file->getClientOriginalExtension();

        return $file->storeAs("products/{$pSlug}", "{$vSlug}-{$time}.{$ext}", 'public');
    }

    

}
