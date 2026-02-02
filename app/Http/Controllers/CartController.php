<?php

namespace App\Http\Controllers;

use App\Models\CartItem;
use App\Models\Product;
use App\Models\ProductVariant;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

use App\Http\Resources\CartItemResource;


class CartController extends Controller
{
    /**
     * Display the cart page.
     */
    public function index(Request $request)
    {
        $products = collect();

        if (Auth::check()) {
            // This returns a collection of ProductVariant models with cart_quantity injected
            $products = $this->getCartFromDb();
        } elseif ($request->has('guestCart')) {
            // This also returns a collection of ProductVariant models with cart_quantity injected
            $products = $this->getCartFromLocalStorageData($request->input('guestCart'));
        }

        // Calculate subtotal ONLY for checked items
        $subtotal = $products->filter(function ($variant) {
                // Check the 'checked' status we injected in getCartFromDb/LocalStorage
                return $variant->is_checked === true;
            })->sum(function ($variant) {
                return $variant->calculated_price * $variant->cart_quantity;
            });

        return Inertia::render('shop/cart', [
            // Use the resource to get camelCase and the nested 'variant' structure
            'products' => CartItemResource::collection($products),
            'subtotal' => (float) $subtotal,
        ]);
    }

    /**
     * Helper to fetch products for Guest data
     * $data looks like: [['id' => 1, 'qty' => 2], ['id' => 5, 'qty' => 1]]
     */
    private function getCartFromLocalStorageData(array $data)
    {
        $items = collect($data);
        $variantIds = $items->pluck('id');

        return ProductVariant::whereIn('id', $variantIds)
            ->with(['product', 'discounts'])
            ->get()
            ->map(function ($variant) use ($items) {
                // Find the qty from the request data and attach it to the variant
                $localItem = $items->firstWhere('id', $variant->id);
                $variant->cart_quantity = $localItem['qty'] ?? 1;
                $variant->is_checked = $localItem['checked'] ?? true;
                return $variant;
            });
    }

    /**
     * Helper to fetch products for Logged In user
     */
    private function getCartFromDb()
    {
        return CartItem::where('user_id', Auth::id())
            ->with(['variant.product', 'variant.discounts'])
            ->get()
            ->map(function ($cartItem) {
                $variant = $cartItem->variant;
                $variant->cart_quantity = $cartItem->quantity;
                $variant->is_checked = (bool) $cartItem->checked;
                return $variant;
            });
    }

    /**
     * Add or update an item in the DB cart (Authenticated only).
     */
    public function store(Request $request)
    {
        $request->validate([
            'variant_id' => 'required|exists:product_variants,id',
            'quantity' => 'required|integer|min:1',
        ]);

        // 1. Find the existing item
        $cartItem = CartItem::where('user_id', Auth::id())
            ->where('product_variant_id', $request->variant_id)
            ->first();

        if ($cartItem) {
            // 2. If it exists, increment
            $cartItem->increment('quantity', $request->quantity, ['checked' => true]);
        } else {
            // 3. If it's new, create it with the base quantity
            CartItem::create([
                'user_id' => Auth::id(),
                'product_variant_id' => $request->variant_id,
                'quantity' => $request->quantity,
                'checked' => true,
            ]);
        }

        return back();
    }

    /**
     * Merge LocalStorage items into the Database.
     */
    public function merge(Request $request)
    {
        $items = $request->input('items', []);

        foreach ($items as $item) {
            // Ensure the variant exists
            $variant = ProductVariant::find($item['id']);
            if (!$variant) continue;

            // Find existing record for this user/variant combo
            $cartItem = CartItem::where('user_id', Auth::id())
                ->where('product_variant_id', $item['id'])
                ->first();

            if ($cartItem) {
                // If it exists, add the quantities together
                $cartItem->increment('quantity', $item['quantity'], [
                    'checked' => $item['checked'] ?? true
                ]);
            } else {
                // If it's new, just create it
                CartItem::create([
                    'user_id' => Auth::id(),
                    'product_variant_id' => $item['id'],
                    'quantity' => $item['quantity'],
                    'checked' => $item['checked'] ?? true,
                ]);
            }
        }

        return back();
    }

    /**
     * Update quantity or checked status in DB.
     */
    public function update(Request $request, $variantId)
    {
        $request->validate([
            'quantity' => 'integer|min:1',
            'checked' => 'boolean'
        ]);

        CartItem::where('user_id', Auth::id())
            ->where('product_variant_id', $variantId)
            ->update($request->only(['quantity', 'checked']));

        return back();
    }

    /**
     * Remove item from DB.
     */
    public function destroy($variantId)
    {
        CartItem::where('user_id', Auth::id())
            ->where('product_variant_id', $variantId)
            ->delete();

        return back();
    }
}