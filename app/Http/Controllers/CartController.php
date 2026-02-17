<?php

namespace App\Http\Controllers;

use App\Models\CartItem;
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
    public function index()
    {
        $this->validateCartStock();

        $allProducts = Auth::check() 
            ? $this->getCartFromDb() 
            : $this->getCartFromSession();

        // Split into two lists
        $available = $allProducts->filter(fn($item) => $item->variant->stock_qty > 0);
        $unavailable = $allProducts->filter(fn($item) => $item->variant->stock_qty <= 0);

        $subtotal = $available->filter(fn($item) => $item->checked)
            ->sum(fn($item) => $item->variant->calculated_price * $item->quantity);

        return Inertia::render('shop/cart', [
            'products' => CartItemResource::collection($available),
            'unavailableProducts' => CartItemResource::collection($unavailable),
            'subtotal' => (float) $subtotal,
        ]);
    }

    /**
     * Add or update an item.
     */
    public function store(Request $request)
    {
        $request->validate([
            'variant_id' => 'required|exists:product_variants,id',
            'quantity' => 'required|integer|min:1',
        ]);

        $variant = ProductVariant::findOrFail($request->variant_id);
        $requestedQty = $request->integer('quantity');

        if (Auth::check()) {
            $item = CartItem::firstOrNew([
                'user_id' => Auth::id(),
                'product_variant_id' => $variant->id
            ]);

            $currentQty = $item->exists ? $item->quantity : 0;
            // Use stock_qty from your migration
            $item->quantity = min($currentQty + $requestedQty, $variant->stock_qty);
            $item->checked = true;
            $item->save();
        } else {
            $cart = session()->get('cart', []);
            $id = $request->variant_id;

            $currentQty = isset($cart[$id]) ? $cart[$id]['quantity'] : 0;
            $newQty = min($currentQty + $requestedQty, $variant->stock_qty);

            $cart[$id] = [
                'id' => $id,
                'quantity' => $newQty,
                'checked' => true
            ];

            session()->put('cart', $cart);
        }

        return back();
    }

    /**
     * Update quantity or checked status.
     */
    public function update(Request $request, $variantId)
    {
        $data = $request->validate([
            'quantity' => 'sometimes|integer|min:1',
            'checked'  => 'sometimes|boolean'
        ]);

        $variant = ProductVariant::findOrFail($variantId);

        if (Auth::check()) {
            $item = CartItem::where('user_id', Auth::id())
                ->where('product_variant_id', $variantId)
                ->first();

            if ($item) {
                if (isset($data['quantity'])) {
                    $item->quantity = min($data['quantity'], $item->variant->stock_qty);
                }
                if (isset($data['checked'])) {
                    $item->checked = $data['checked'];
                }
                $item->save();
            }

        } else {
            $cart = session()->get('cart', []);
            if (isset($cart[$variantId])) {
                if (isset($data['quantity'])) {
                    $cart[$variantId]['quantity'] = min($data['quantity'], $variant->stock_qty);
                }
                if (isset($data['checked'])) {
                    $cart[$variantId]['checked'] = $data['checked'];
                }
                session()->put('cart', $cart);
            }
        }

        return back();
    }

    public function updateCheck(Request $request, $id)
    {
        $checked = $request->boolean('checked');

        if (Auth::check()) {
            CartItem::where('user_id', Auth::id())
                ->where('product_variant_id', $id)
                ->update(['checked' => $checked]);
        } else {
            $cart = session()->get('cart', []);
            if (isset($cart[$id])) {
                $cart[$id]['checked'] = $checked;
                session()->put('cart', $cart);
            }
        }
        return back();
    }

    public function updateCheckAll(Request $request)
    {
        $checked = $request->boolean('checked'); 

        if (Auth::check()) {
            Auth::user()->cartItems()->update(['checked' => $checked]);
        } else {
            $cart = collect(session()->get('cart', []))->map(function ($item) use ($checked) {
                $item['checked'] = $checked;
                return $item;
            })->toArray();
            session()->put('cart', $cart);
        }

        return back();
    }

    public function destroy($variantId)
    {
        if (Auth::check()) {
            CartItem::where('user_id', Auth::id())
                ->where('product_variant_id', $variantId)
                ->delete();
        } else {
            $cart = session()->get('cart', []);
            unset($cart[$variantId]);
            session()->put('cart', $cart);
        }

        return back();
    }

    public function removeSelected()
    {
        if (Auth::check()) {
            // Only delete items that are checked AND have stock > 0
            Auth::user()->cartItems()
                ->where('checked', true)
                ->whereHas('variant', function ($query) {
                    $query->where('stock_qty', '>', 0);
                })
                ->delete();
        } else {
            $cart = collect(session()->get('cart', []))
                ->filter(function ($item) {
                    $variant = ProductVariant::find($item['id']);
                    
                    // Keep the item if:
                    // 1. It's NOT checked OR 
                    // 2. It's checked but has 0 stock (meaning it's in the unavailable list)
                    $is_checked = $item['checked'] ?? true;
                    $has_stock = $variant && $variant->stock_qty > 0;

                    return !($is_checked && $has_stock);
                })
                ->toArray();
                
            session()->put('cart', $cart);
        }

        return back();
    }

    public function clearUnavailable()
    {
        if (Auth::check()) {
            // Delete cart items where the associated variant has 0 stock
            CartItem::where('user_id', Auth::id())
                ->whereHas('variant', function($query) {
                    $query->where('stock_qty', '<=', 0);
                })->delete();
        } else {
            $cart = session()->get('cart', []);
            foreach ($cart as $id => $details) {
                $variant = ProductVariant::find($id);
                if (!$variant || $variant->stock_qty <= 0) {
                    unset($cart[$id]);
                }
            }
            session()->put('cart', $cart);
        }

        return back();
    }

    /**
     * HELPERS
     */

    private function getCartFromDb()
    {
        return CartItem::where('user_id', Auth::id())
            ->with(['variant.product', 'variant.discounts'])
            ->get();
            // ->map(function ($cartItem) {
            //     $variant = $cartItem->variant;
            //     $variant->cart_quantity = $cartItem->quantity;
            //     $variant->is_checked = (bool) $cartItem->checked;
            //     return $variant;
            // });
    }

    private function getCartFromSession()
    {
        // 1. Get the session data (Keyed by variant ID)
        $sessionCart = collect(session()->get('cart', []));
        
        if ($sessionCart->isEmpty()) return collect();

        // 2. Fetch the Variants with their relations
        // We key the variants by ID so we can easily look them up in the next step
        $variants = ProductVariant::with(['product', 'discounts'])
            ->whereIn('id', $sessionCart->pluck('id'))
            ->get()
            ->keyBy('id');

        // 3. Map the SESSION data into a "Fake" CartItem structure
        return $sessionCart->map(function ($sessionItem) use ($variants) {
            $variant = $variants->get($sessionItem['id']);

            // If for some reason the variant was deleted from DB but exists in session
            if (!$variant) return null;

            /**
             * We return a structure that looks EXACTLY like your database CartItem
             * so that your API Resource (or React) doesn't break.
             */
            return (object) [
                'id' => $sessionItem['id'], // Use variant ID as item ID for guests
                'product_variant_id' => $sessionItem['id'],
                'quantity' => $sessionItem['quantity'],
                'checked' => $sessionItem['checked'] ?? true, // Match your TS 'isChecked'
                'variant' => $variant, 
            ];
        })->filter()->values(); // Remove nulls and reset array keys
    }

    public function validateCartStock()
    {
        if (Auth::check()) {
            // Use a join to be 100% sure we get the stock_qty directly
            $cartItems = CartItem::where('user_id', Auth::id())->get();

            foreach ($cartItems as $item) {
                $variant = ProductVariant::find($item->product_variant_id);
                
                if (!$variant) {
                    $item->delete();
                    continue;
                }

                // Fallback check: if stock_qty is missing, assume 0 ONLY if explicitly null
                $actualStock = $variant->stock_qty;

                if ($item->quantity > $actualStock) {
                    $item->update(['quantity' => max(0, (int)$actualStock)]);
                }
            }
        } else {
            $cart = session()->get('cart', []);
            $updated = false;

            foreach ($cart as $id => $details) {
                $variant = ProductVariant::find($id);
                
                if (!$variant) {
                    unset($cart[$id]);
                    $updated = true;
                    continue;
                }

                $actualStock = $variant->stock_qty;

                if ($details['quantity'] > $actualStock) {
                    $cart[$id]['quantity'] = max(0, (int)$actualStock);
                    $updated = true;
                }
            }

            if ($updated) {
                session()->put('cart', $cart);
            }
        }
    }

    public static function mergeSessionCartToDb($user)
    {
        $sessionCart = session()->get('cart', []);
        if (empty($sessionCart)) return;

        foreach ($sessionCart as $variantId => $item) {
            $variant = ProductVariant::find($variantId);
            if (!$variant) continue;

            $cartItem = CartItem::where('user_id', $user->id)
                ->where('product_variant_id', $variantId)
                ->first();

            if ($cartItem) {
                // Corrected to stock_qty
                $newQty = min($cartItem->quantity + $item['quantity'], $variant->stock_qty);
                $cartItem->update(['quantity' => $newQty]);
            } else {
                CartItem::create([
                    'user_id' => $user->id,
                    'product_variant_id' => $variantId,
                    'quantity' => min($item['quantity'], $variant->stock_qty),
                    'checked' => $item['checked'] ?? true,
                ]);
            }
        }
        session()->forget('cart');
    }
}