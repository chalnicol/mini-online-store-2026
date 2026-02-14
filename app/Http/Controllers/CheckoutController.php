<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use App\Http\Resources\CartItemResource;
use App\Http\Resources\UserAddressResource;

use App\Models\ProductVariant;

class CheckoutController extends Controller
{
    public function index(Request $request)
    {
        $user = Auth::user();
        $source = $request->query('source');

        if ($source === 'buy_now') {
            // --- BUY NOW FLOW ---
            $variantId = $request->query('variant_id');
            $qty = $request->query('qty', 1);

            $variant = ProductVariant::with(['product'])
                ->findOrFail($variantId);

            // Map it to look like a CartItem so your React component doesn't break
            $checkoutItems = [
                [
                    'id' => null, // It doesn't exist in cart table
                    'quantity' => (int) $qty,
                    'variant' => $variant,
                ]
            ];
            $itemsSubtotal = $variant->calculated_price * $qty;

        } else {
            // --- REGULAR CART FLOW ---
            $checkoutItems = $user->cartItems()
                ->where('checked', true)
                ->whereHas('variant', function ($query) {
                    $query->where('stock_qty', '>', 0);
                })
                ->with(['variant.product'])
                ->get();

            if ($checkoutItems->isEmpty()) {
                return redirect()->route('cart.index');
            }

            $itemsSubtotal = $checkoutItems->sum(fn($item) => $item->variant->calculated_price * $item->quantity);
        }

        // Address logic stays the same...
        $addresses = $user->addresses()->latest()->get();
        $defaultAddress = $addresses->where('is_default', true)->first() ?? $addresses->first();

        return Inertia::render('user/checkout', [
            'cartItems' => $checkoutItems, // React receives the same structure
            'itemsSubtotal' => (float) $itemsSubtotal,
            'initialShippingFee' => (float) ($itemsSubtotal >= 300 ? 0 : 40),
            'addresses' => UserAddressResource::collection($addresses),
            // 'defaultAddress' => $defaultAddress ? new UserAddressResource($defaultAddress) : null,
            'checkoutSource' => $source ?? 'cart', // Important for the final POST
        ]);
    }
}
