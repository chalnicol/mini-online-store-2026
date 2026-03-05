<?php

namespace App\Http\Controllers;

use App\Models\{ProductVariant, CartItem, Voucher};
use App\Http\Resources\{CartItemResource, UserAddressResource, VoucherResource};
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class CheckoutController extends Controller
{
  public function index(Request $request)
  {
    $user = Auth::user();

    // Ensure session exists
    if (!session()->has('checkout_settings')) {
      session()->put('checkout_settings', [
        'delivery_type' => 'standard',
        'schedule' => null,
        'voucher_id' => null,
      ]);
    }

    $checkout = session()->get('checkout_settings');
    $checkoutData = $this->getCheckoutData($request, $user);
    $itemsSubtotal = $checkoutData['subtotal'];

    $deliveryType = $checkout['delivery_type'] ?? 'standard';
    $shippingFee = $this->calculateShippingFee($deliveryType, $itemsSubtotal);

    $discount = 0;
    $appliedVoucher = null;

    if (!empty($checkout['voucher_id'])) {
      $voucher = Voucher::find($checkout['voucher_id']);

      // Use the Model's isUsable logic (which checks is_personal & pivot table)
      if ($voucher && $voucher->isUsable($itemsSubtotal, $user->id)) {
        // Specific check: Shipping vouchers only apply to Standard + when there is a fee
        if ($voucher->type === 'shipping') {
          if ($deliveryType === 'standard' && $shippingFee > 0) {
            $appliedVoucher = $voucher;
            $discount = $shippingFee;
          }
        } else {
          $appliedVoucher = $voucher;
          $discount = $voucher->calculateDiscount($itemsSubtotal);
        }
      }
    }

    return Inertia::render('user/checkout', [
      'cartItems' => CartItemResource::collection($checkoutData['items']),
      'totalItemsCount' => (int) $checkoutData['count'],
      'itemsSubtotal' => (float) $itemsSubtotal,
      'deliveryType' => $deliveryType,
      'shippingFee' => (float) $shippingFee,
      'discount' => (float) $discount,
      'finalTotal' => (float) max(0, $itemsSubtotal + $shippingFee - $discount),
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

    // Auto-remove shipping voucher if switching away from standard
    if ($request->delivery_type !== 'standard' && !empty($checkout['voucher_id'])) {
      $voucher = Voucher::find($checkout['voucher_id']);
      if ($voucher && $voucher->type === 'shipping') {
        $checkout['voucher_id'] = null;
        session()->flash('warning', 'Shipping voucher removed (Standard delivery only).');
      }
    }

    $checkout['delivery_type'] = $request->delivery_type;
    $checkout['schedule'] =
      $request->delivery_type === 'custom'
        ? [
          'date' => $request->schedule_date,
          'time' => $request->schedule_time,
        ]
        : null;

    session()->put('checkout_settings', $checkout);
    return back();
  }

  public function applyVoucher(Request $request)
  {
    $request->validate(['voucher_id' => 'required|exists:vouchers,id']);

    $user = Auth::user();
    $voucher = Voucher::findOrFail($request->voucher_id);
    $checkoutData = $this->getCheckoutData($request, $user);

    if (!$voucher->isUsable($checkoutData['subtotal'], $user->id)) {
      return back()->withErrors(['voucher' => 'This voucher is not available for your order.']);
    }

    // Extra check for shipping type
    $checkout = session()->get('checkout_settings');
    if ($voucher->type === 'shipping' && ($checkout['delivery_type'] ?? 'standard') !== 'standard') {
      return back()->withErrors(['voucher' => 'Shipping vouchers only apply to Standard Delivery.']);
    }

    session()->put('checkout_settings.voucher_id', $voucher->id);

    return back()->with('success', 'Voucher applied!');
  }

  public function removeVoucher()
  {
    session()->put('checkout_settings.voucher_id', null);
    return back()->with('success', 'Voucher removed');
  }

  private function getEligibleVouchers($user, $subtotal)
  {
    $vouchers = Voucher::where('is_active', true)
      ->where(fn($q) => $q->whereNull('expires_at')->orWhere('expires_at', '>', now()))
      ->where(function ($q) use ($user) {
        $q->where('is_personal', false) //.
          ->orWhereHas('users', fn($sq) => $sq->where('user_id', $user->id));
      })
      ->get();

    // Pass subtotal to the resource via request helper
    request()->merge(['subtotal' => $subtotal]);

    return VoucherResource::collection($vouchers);
  }

  private function getCheckoutData(Request $request, $user)
  {
    if ($request->query('source') === 'buy_now') {
      $variant = ProductVariant::with('product')->findOrFail($request->query('variant_id'));
      $qty = (int) $request->query('qty', 1);
      $item = new CartItem(['quantity' => $qty, 'product_variant_id' => $variant->id]);
      $item->setRelation('variant', $variant);
      $items = collect([$item]);
    } else {
      $items = $user
        ->cartItems()
        ->where('checked', true)
        ->whereHas('variant', fn($q) => $q->where('stock_qty', '>', 0))
        ->with('variant.product')
        ->get();
    }

    $subtotal = $items->sum(fn($i) => $i->variant->calculated_price * $i->quantity);
    return ['items' => $items, 'subtotal' => $subtotal, 'count' => $items->sum('quantity')];
  }

  private function calculateShippingFee($type, $subtotal): float
  {
    return match ($type) {
      'express' => 80.0,
      'custom' => 60.0,
      default => $subtotal >= 300 ? 0.0 : 40.0,
    };
  }
}
