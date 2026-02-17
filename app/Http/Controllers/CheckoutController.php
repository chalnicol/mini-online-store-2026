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
    public function index(Request $request)
    {
        $user = Auth::user();
        
        // 1. Get Items and Subtotal using helper
        $checkoutData = $this->getCheckoutData($request, $user);
        $itemsSubtotal = $checkoutData['subtotal'];

        // 2. Handle Applied Voucher (Session)
        $discount = 0;
        $appliedVoucher = null;
        if (session()->has('applied_voucher_id')) {
            $appliedVoucher = Voucher::find(session('applied_voucher_id'));
            if ($appliedVoucher && $itemsSubtotal >= $appliedVoucher->min_spend) {
                $discount = $appliedVoucher->calculateDiscount($itemsSubtotal);
            } else {
                session()->forget('applied_voucher_id');
                $appliedVoucher = null;
            }
        }

        return Inertia::render('user/checkout', [
            'cartItems' => CartItemResource::collection($checkoutData['items']),
            'totalItemsCount' => (int) $checkoutData['count'],
            'itemsSubtotal' => (float) $itemsSubtotal,
            'initialShippingFee' => (float) ($itemsSubtotal >= 300 ? 0 : 40),
            'addresses' => UserAddressResource::collection($user->addresses()->latest()->get()),
            'checkoutSource' => $request->query('source', 'cart'),
            'appliedVoucher' => $appliedVoucher,
            'discount' => (float) $discount,
            
            // 3. The Voucher List (Lazy loaded for performance)
            'availableVouchers' => Inertia::lazy(fn() => 
                 $this->getEligibleVouchers($user, $itemsSubtotal)
            ),
            // 'availableVouchers' => $this->getEligibleVouchers($user, $itemsSubtotal),
        ]);
    }

    public function updateDelivery(Request $request)
    {
        $request->validate([
            'delivery_type' => 'required|in:standard,express,custom',
            'schedule_date' => 'required_if:delivery_type,custom',
            'schedule_time' => 'required_if:delivery_type,custom',
        ]);

        session()->put([
            'delivery_type' => $request->delivery_type,
            'delivery_schedule' => [
                'date' => $request->schedule_date,
                'time' => $request->schedule_time,
            ]
        ]);

        return back();
    }

    public function applyVoucher(Request $request)
    {
        $request->validate([
            'voucher_id' => 'required|exists:vouchers,id',
        ]);

        $user = Auth::user();
        $voucher = Voucher::findOrFail($request->voucher_id);
        $subtotal = $this->calculateSubtotal($request);

        // 1. Check Ownership & Claim if necessary
        $hasVoucher = $user->vouchers()
            ->where('voucher_id', $voucher->id)
            ->wherePivot('used_at', null)
            ->exists();

        if (!$hasVoucher) {
            // If it's a private voucher meant for someone else, block it
            if ($voucher->user_id !== null && $voucher->user_id !== $user->id) {
                return back()->withErrors(['voucher' => 'This voucher is not available for you.']);
            }
            
            // AUTO-CLAIM: Attach it to their wallet now
            $user->vouchers()->attach($voucher->id);
        }

        // 2. Validate standard rules (Min Spend / Expiry)
        if (!$voucher->isUsable($subtotal, $user->id)) {
            return back()->withErrors(['voucher' => 'Requirement not met (e.g., minimum spend).']);
        }

        // 3. Save to Session
        session()->put('applied_voucher_id', $voucher->id);

        return back()->with('success', 'Voucher applied!');
    }

    public function removeVoucher()
    {
        session()->forget('applied_voucher_id');
        return back()->with('success', 'Voucher removed');
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
