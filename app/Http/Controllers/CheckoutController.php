<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use App\Http\Resources\CartItemResource;
use App\Http\Resources\UserAddressResource;
use App\Http\Resources\VoucherResource;

use App\Models\ProductVariant;
use App\Models\CartItem;
use App\Models\Voucher;


class CheckoutController extends Controller
{
    
    // public function index(Request $request)
    // {
    //     $user = Auth::user();

    //     // 1. Initialize Defaults if session is empty
    //     if (!session()->has('checkout_settings')) {
    //         session()->put('checkout_settings', [
    //             'delivery_type' => 'standard',
    //             'schedule' => null,
    //             'voucher_id' => null
    //         ]);
    //     }

    //     $checkout = session()->get('checkout_settings');

    //     // 1. Get Base Data
    //     $checkoutData = $this->getCheckoutData($request, $user);
    //     $itemsSubtotal = $checkoutData['subtotal'];

    //     // 2. Determine Shipping Fee
    //     $deliveryType = $checkout['delivery_type'] ?? 'standard';
    //     $voucherId = $checkout['voucher_id'] ?? null;
    //     $shippingFee = $this->calculateShippingFee($deliveryType, $itemsSubtotal);

    //     // 3. Handle Applied Voucher
    //     $discount = 0;
    //     $appliedVoucher = null;

    //     if ($voucherId) {
    //         $appliedVoucher = Voucher::find($voucherId);

    //         // --- VALIDATION LOGIC ---
    //         $isValid = true;
    //         $removalReason = null;

    //         // A. Check if voucher exists and meets min spend
    //         if (!$appliedVoucher || $itemsSubtotal < $appliedVoucher->min_spend) {
    //             $isValid = false;
    //             $removalReason = "Minimum spend not met.";
    //         }

    //         // B. Check if shipping voucher is used with non-standard delivery
    //         elseif ($appliedVoucher->type === 'shipping' && $deliveryType !== 'standard') {
    //             $isValid = false;
    //             $removalReason = "Shipping vouchers only apply to Standard Delivery.";
    //         }

    //         // C. Check if shipping voucher is even needed (Automatic Free Shipping check)
    //         // If shipping is already 0, the voucher is invalid/unnecessary.
    //         elseif ($appliedVoucher->type === 'shipping' && $shippingFee <= 0) {
    //             $isValid = false;
    //             $removalReason = "Automatic free shipping already applied.";
    //         }

    //         if ($isValid) {
    //             // Calculate discount
    //             $discount = ($appliedVoucher->type === 'shipping') 
    //                 ? $shippingFee 
    //                 : $appliedVoucher->calculateDiscount($itemsSubtotal);
    //         } else {
    //             // REMOVE VOUCHER FROM SESSION
    //             $checkout = session()->get('checkout_settings', []);
    //             unset($checkout['voucher_id']);
    //             session()->put('checkout_settings', $checkout);
                
    //             $appliedVoucher = null;
    //             $discount = 0;

    //             // Flash the reason so the user isn't left guessing
    //             if ($removalReason) {
    //                 session()->flash('warning', $removalReason);
    //             }
    //         }
    //     }

    //     // 4. Calculate Final Total
    //     $finalTotal = ($itemsSubtotal + $shippingFee) - $discount;

    //     return Inertia::render('user/checkout', [
    //         'cartItems' => CartItemResource::collection($checkoutData['items']),
    //         'totalItemsCount' => (int) $checkoutData['count'],
    //         'itemsSubtotal' => (float) $itemsSubtotal,
            
    //         'deliveryType' => $deliveryType,
    //         'shippingFee' => (float) $shippingFee,
    //         'discount' => (float) $discount,
    //         'finalTotal' => (float) max(0, $finalTotal),
            
    //         'appliedVoucher' => $appliedVoucher ? new VoucherResource($appliedVoucher) : null,
    //         'addresses' => UserAddressResource::collection($user->addresses()->latest()->get()),
    //         'availableVouchers' => Inertia::lazy(fn() => 
    //             $this->getEligibleVouchers($user, $itemsSubtotal)
    //         ),
    //     ]);
    // }

    public function index(Request $request)
    {
        $user = Auth::user();

        // Default session if missing
        if (!session()->has('checkout_settings')) {
            session()->put('checkout_settings', [
                'delivery_type' => 'standard',
                'schedule' => null,
                'voucher_id' => null
            ]);
        }

        $checkout = session()->get('checkout_settings');
        $checkoutData = $this->getCheckoutData($request, $user);
        $itemsSubtotal = $checkoutData['subtotal'];

        // 1. Determine Shipping Fee
        $deliveryType = $checkout['delivery_type'] ?? 'standard';
        $shippingFee = $this->calculateShippingFee($deliveryType, $itemsSubtotal);

        // 2. Handle Applied Voucher
        $discount = 0;
        $appliedVoucher = null;

        if (!empty($checkout['voucher_id'])) {
            $voucher = Voucher::find($checkout['voucher_id']);
            
            // Simple logic check: Is it still valid?
            if ($voucher && $itemsSubtotal >= $voucher->min_spend) {
                
                // Shipping vouchers only apply if it's Standard AND there's a fee
                if ($voucher->type === 'shipping') {
                    if ($deliveryType === 'standard' && $shippingFee > 0) {
                        $appliedVoucher = $voucher;
                        $discount = $shippingFee;
                    }
                } else {
                    // Fixed or Percentage
                    $appliedVoucher = $voucher;
                    $discount = $voucher->calculateDiscount($itemsSubtotal);
                }
            }
            
            // If it wasn't valid above, $appliedVoucher remains null 
            // and $discount remains 0. No session unsetting here to avoid loops.
        }

        $finalTotal = ($itemsSubtotal + $shippingFee) - $discount;

        return Inertia::render('user/checkout', [
            'cartItems' => CartItemResource::collection($checkoutData['items']),
            'totalItemsCount' => (int) $checkoutData['count'],
            'itemsSubtotal' => (float) $itemsSubtotal,
            'deliveryType' => $deliveryType,
            'shippingFee' => (float) $shippingFee,
            'discount' => (float) $discount,
            'finalTotal' => (float) max(0, $finalTotal),
            'appliedVoucher' => $appliedVoucher ? new VoucherResource($appliedVoucher) : null,
            'addresses' => UserAddressResource::collection($user->addresses()->latest()->get()),
            'availableVouchers' => Inertia::lazy(fn() => $this->getEligibleVouchers($user, $itemsSubtotal)),
        ]);
    }

    public function updateDelivery(Request $request)
    {
        $request->validate([
            'delivery_type' => 'required|in:standard,express,custom',
            'schedule_date' => 'required_if:delivery_type,custom',
            'schedule_time' => 'required_if:delivery_type,custom',
        ]);

        $checkout = session()->get('checkout_settings', ['delivery_type' => 'standard']);
        
        // Auto-remove shipping voucher if switching to non-standard
        if ($request->delivery_type !== 'standard' && !empty($checkout['voucher_id'])) {
            $voucher = Voucher::find($checkout['voucher_id']);
            if ($voucher && $voucher->type === 'shipping') {
                unset($checkout['voucher_id']);
                session()->flash('warning', 'Shipping voucher removed (Standard only).');
            }
        }

        $checkout['delivery_type'] = $request->delivery_type;
        $checkout['schedule'] = $request->delivery_type === 'custom' ? [
            'date' => $request->schedule_date,
            'time' => $request->schedule_time,
        ] : null;

        session()->put('checkout_settings', $checkout);
        return back();
    }

    public function applyVoucher(Request $request)
    {
        $request->validate(['voucher_id' => 'required|exists:vouchers,id']);

        $user = Auth::user();
        $voucher = Voucher::findOrFail($request->voucher_id);
        
        // Use the existing checkout data for subtotal
        $checkoutData = $this->getCheckoutData($request, $user);
        $subtotal = $checkoutData['subtotal'];
        
        $checkout = session()->get('checkout_settings', []);
        $deliveryType = $checkout['delivery_type'] ?? 'standard';

        // 1. Minimum Spend
        if ($subtotal < $voucher->min_spend) {
            return back()->withErrors(['voucher' => "Minimum spend of ₱{$voucher->min_spend} required."]);
        }

        // 2. Shipping Logic
        if ($voucher->type === 'shipping') {
            if ($deliveryType !== 'standard') {
                return back()->withErrors(['voucher' => 'Shipping vouchers only apply to Standard Delivery.']);
            }
            
            $fee = $this->calculateShippingFee($deliveryType, $subtotal);
            if ($fee <= 0) {
                return back()->withErrors(['voucher' => 'Free shipping is already applied to this order.']);
            }
        }

        // 3. Usage check
        if (!$voucher->isUsable($subtotal, $user->id)) {
            return back()->withErrors(['voucher' => 'This voucher is no longer valid.']);
        }

        $checkout['voucher_id'] = $voucher->id;
        session()->put('checkout_settings', $checkout);

        return back()->with('success', 'Voucher applied!');
    }

    public function removeVoucher()
    {   
        //
        $checkout = session()->get('checkout_settings', []);

        //
        unset($checkout['voucher_id']);
        
        //
        session()->put('checkout_settings', $checkout);
        return back()->with('success', 'Voucher removed');
    }


    /**
     * Helper to calculate shipping based on type and subtotal
     */
    private function calculateShippingFee($type, $subtotal): float
    {
        // Example logic:
        // Standard: $40, Free if over $300
        // Express: $80 flat
        // Custom: $60 flat (Priority delivery)
        
        return match ($type) {
            'express' => 80.0,
            'custom'  => 60.0,
            default   => $subtotal >= 300 ? 0.0 : 40.0,
        };
    }

    /**
     * Helper: Get Items, Subtotal and Count
     */
    private function getCheckoutData(Request $request, $user)
    {
        if ($request->query('source') === 'buy_now') {
            $variant = ProductVariant::with(['product'])->findOrFail($request->query('variant_id'));
            $qty = (int) $request->query('qty', 1);

            $item = new CartItem(['quantity' => $qty, 'product_variant_id' => $variant->id, 'checked' => true]);
            $item->setRelation('variant', $variant);
            $items = collect([$item]);
        } else {
            $items = $user->cartItems()
                ->where('checked', true)
                ->whereHas('variant', fn($q) => $q->where('stock_qty', '>', 0))
                ->with(['variant.product'])->get();
        }

        $subtotal = $items->sum(fn($i) => $i->variant->calculated_price * $i->quantity);
        
        return ['items' => $items, 'subtotal' => $subtotal, 'count' => $items->sum('quantity')];
    }

    /**
     * Helper: Get optimized list of vouchers for the popup
     */
    private function getEligibleVouchers($user, $subtotal)
    {
        return Voucher::where(function ($q) use ($user) {
                $q->whereNull('user_id')->orWhere('user_id', $user->id);
            })
            ->where(fn($q) => $q->whereNull('expires_at')->orWhere('expires_at', '>', now()))
            ->whereDoesntHave('users', fn($q) => $q->where('user_id', $user->id)->whereNotNull('used_at'))
            ->get()
            ->map(fn($v) => [
                'id' => $v->id,
                'code' => $v->code,
                'type' => $v->type,
                'value' => (float)$v->value,
                'minSpend' => (float)$v->min_spend,
                'isClaimed' => $user->vouchers()->where('voucher_id', $v->id)->exists(),
                'isPersonal' => $v->user_id !== null,
                'canApply' => $subtotal >= $v->min_spend,
                'amountNeeded' => max(0, $v->min_spend - $subtotal),
                'isActive' => $v->is_active,
                'description' => $v->description,
                'expiresAt' => $v->expires_at 
                    ? $v->expires_at->format('M d, Y') // Results in "Feb 16, 2026"
                    : 'No Expiry',
            ]);
    }

    /**
     * Helper to get the subtotal based on the source (Buy Now or Cart)
     */
    private function calculateSubtotal(Request $request): float
    {
        $user = Auth::user();
        $source = $request->query('source');

        if ($source === 'buy_now') {
            $variantId = $request->query('variant_id');
            $qty = (int) $request->query('qty', 1);
            $variant = ProductVariant::findOrFail($variantId);
            
            return (float) ($variant->calculated_price * $qty);
        }

        // Default: Regular Cart Flow
        $checkoutItems = $user->cartItems()
            ->where('checked', true)
            ->whereHas('variant', function ($query) {
                $query->where('stock_qty', '>', 0);
            })
            ->with('variant')
            ->get();

        return (float) $checkoutItems->sum(fn($item) => 
            $item->variant->calculated_price * $item->quantity
        );
    }

}
