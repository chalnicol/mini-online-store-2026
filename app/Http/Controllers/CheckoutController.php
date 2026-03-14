<?php

namespace App\Http\Controllers;

use App\Models\{ProductVariant, CartItem, Voucher, Order, OrderItem, InventoryMovement, ServiceableArea};
use App\Http\Resources\{CartItemResource, UserAddressResource, VoucherResource, ServiceableAreaResource, OrderResource};
use App\Services\PayMongoService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class CheckoutController extends Controller
{
  public function __construct(private PayMongoService $payMongo) {}

  public function index(Request $request)
  {
    $user = Auth::user();

    if ($request->query('source') === 'cart') {
      session()->forget('checkout_settings.buy_now');
    }

    if (!session()->has('checkout_settings')) {
      session()->put('checkout_settings', [
        'delivery_type' => 'standard',
        'schedule' => null,
        'voucher_id' => null,
        'buy_now' => null,
      ]);
    }

    $checkoutData = $this->getCheckoutData($request, $user);

    if ($checkoutData['items']->isEmpty()) {
      return redirect()->route('cart.index')->with('error', 'No items selected for checkout.');
    }

    $checkout = session()->get('checkout_settings');
    $itemsSubtotal = $checkoutData['subtotal'];
    $deliveryType = $checkout['delivery_type'] ?? 'standard';
    $shippingFee = $this->calculateShippingFee($deliveryType, $itemsSubtotal);

    $discount = 0;
    $appliedVoucher = null;

    if (!empty($checkout['voucher_id'])) {
      $voucher = Voucher::withoutTrashed()->find($checkout['voucher_id']);

      if ($voucher && $voucher->isUsable($itemsSubtotal, $user->id)) {
        if ($voucher->type === 'shipping') {
          if ($deliveryType === 'standard' && $shippingFee > 0) {
            $appliedVoucher = $voucher;
            $discount = $shippingFee;
          }
        } else {
          $appliedVoucher = $voucher;
          $discount = $voucher->calculateDiscount($itemsSubtotal);
        }
      } else {
        session()->put('checkout_settings.voucher_id', null);
      }
    }

    return Inertia::render('user/checkout/index', [
      'cartItems' => CartItemResource::collection($checkoutData['items']),
      'totalItemsCount' => (int) $checkoutData['count'],
      'itemsSubtotal' => (float) $itemsSubtotal,
      'deliveryType' => $deliveryType,
      'shippingFee' => (float) $shippingFee,
      'discount' => (float) $discount,
      'finalTotal' => (float) max(0, $itemsSubtotal + $shippingFee - $discount),
      'appliedVoucher' => $appliedVoucher ? new VoucherResource($appliedVoucher) : null,
      'addresses' => UserAddressResource::collection($user->addresses()->with('serviceableArea')->latest()->get()),
      'serviceableAreas' => ServiceableAreaResource::collection(ServiceableArea::orderBy('barangay')->get()),
      'availableVouchers' => Inertia::lazy(fn() => $this->getEligibleVouchers($user, $itemsSubtotal)),
    ]);
  }

  public function buyNow(Request $request)
  {
    $request->validate([
      'variant_id' => 'required|exists:product_variants,id',
      'qty' => 'sometimes|integer|min:1|max:100',
    ]);

    session()->put('checkout_settings', [
      'delivery_type' => 'standard',
      'schedule' => null,
      'voucher_id' => null,
      'buy_now' => [
        'variant_id' => $request->variant_id,
        'qty' => $request->qty ?? 1,
      ],
    ]);

    return to_route('checkout');
  }

  public function placeOrder(Request $request)
  {
    $request->validate([
      'address_id' => 'required|exists:user_addresses,id',
      'payment_method' => 'required|in:cod,gcash,paymaya,card',
      'notes' => 'nullable|string|max:500',
    ]);

    $user = Auth::user();
    $checkout = session()->get('checkout_settings', []);
    $checkoutData = $this->getCheckoutData($request, $user);

    if ($checkoutData['items']->isEmpty()) {
      return back()->withErrors(['cart' => 'Your cart is empty.']);
    }

    $deliveryType = $checkout['delivery_type'] ?? 'standard';
    $itemsSubtotal = $checkoutData['subtotal'];
    $shippingFee = $this->calculateShippingFee($deliveryType, $itemsSubtotal);

    $discount = 0;
    $voucherCode = null;
    $appliedVoucher = null;

    if (!empty($checkout['voucher_id'])) {
      $voucher = Voucher::withoutTrashed()->find($checkout['voucher_id']);

      if ($voucher && $voucher->isUsable($itemsSubtotal, $user->id)) {
        if ($voucher->type === 'shipping') {
          if ($deliveryType === 'standard' && $shippingFee > 0) {
            $appliedVoucher = $voucher;
            $discount = $shippingFee;
          }
        } else {
          $appliedVoucher = $voucher;
          $discount = $voucher->calculateDiscount($itemsSubtotal);
        }
        $voucherCode = $voucher->code;
      }
    }

    $finalTotal = max(0, $itemsSubtotal + $shippingFee - $discount);
    $address = $user->addresses()->findOrFail($request->address_id);

    $order = null;

    DB::transaction(function () use (
      $user,
      $request,
      $checkout,
      $checkoutData,
      $address,
      $appliedVoucher,
      $voucherCode,
      $itemsSubtotal,
      $shippingFee,
      $discount,
      $finalTotal,
      $deliveryType,
      &$order,
    ) {
      $order = Order::create([
        'user_id' => $user->id,
        'address_id' => $address->id,
        'shipping_contact_person' => $address->contact_person,
        'shipping_contact_number' => $address->contact_number,
        'shipping_full_address' => $address->full_address,
        'voucher_code' => $voucherCode,
        'voucher_discount' => $discount,
        'items_subtotal' => $itemsSubtotal,
        'shipping_fee' => $shippingFee,
        'final_total' => $finalTotal,
        'status' => 'pending',
        'payment_status' => 'unpaid',
        'payment_method' => $request->payment_method,
        'delivery_type' => $deliveryType,
        'delivery_schedule' => $checkout['schedule'] ?? null,
        'notes' => $request->notes,
      ]);

      foreach ($checkoutData['items'] as $item) {
        $variant = $item->variant;

        OrderItem::create([
          'order_id' => $order->id,
          'product_variant_id' => $variant->id,
          'product_name' => $variant->product->name,
          'variant_name' => $variant->name,
          'variant_attributes' => $variant->attributes,
          'quantity' => $item->quantity,
          'price_at_purchase' => $variant->calculated_price,
          'discount_at_purchase' => max(0, $variant->price - $variant->calculated_price),
        ]);

        $variant->decrement('stock_qty', $item->quantity);

        InventoryMovement::create([
          'product_variant_id' => $variant->id,
          'quantity' => -$item->quantity,
          'type' => 'sale',
          'status' => 'available',
          'reason' => "Order #{$order->order_number}",
          'reference_type' => Order::class,
          'reference_id' => $order->id,
          'user_id' => $user->id,
        ]);
      }

      if ($appliedVoucher) {
        $appliedVoucher->increment('used_count');

        $alreadyInPivot = $appliedVoucher->users()->where('users.id', $user->id)->exists();

        if ($alreadyInPivot) {
          $appliedVoucher->users()->updateExistingPivot($user->id, ['used_at' => now()]);
        } else {
          $appliedVoucher->users()->attach($user->id, ['used_at' => now()]);
        }
      }

      if (empty(session()->get('checkout_settings.buy_now'))) {
        $user->cartItems()->where('checked', true)->delete();
      }

      session()->forget('checkout_settings');
    });

    // COD
    if ($request->payment_method === 'cod') {
      return redirect()->route('checkout.order-result', [
        'order' => $order->id,
        'result' => 'success',
      ]);
    }

    // GCash, Maya, Card — all via Payment Intent
    $methodType = match ($request->payment_method) {
      'gcash' => 'gcash',
      'paymaya' => 'paymaya',
      default => null,
    };

    $intent = $this->payMongo->createPaymentIntent(
      amountInCents: $this->payMongo->toCents($order->final_total),
      paymentMethodAllowed: [$methodType],
      description: "Payment for Order {$order->order_number}",
    );

    $method = $this->payMongo->createPaymentMethod(
      type: $methodType,
      billing: [
        'name' => $user->fname . ' ' . $user->lname,
        'email' => $user->email,
        'phone' => $address->contact_number ?? '',
      ],
    );

    $attached = $this->payMongo->attachPaymentIntent(
      paymentIntentId: $intent['id'],
      paymentMethodId: $method['id'],
      returnUrl: route('payment.return', $order->id),
    );

    $order->update(['paymongo_payment_intent_id' => $intent['id']]);

    $redirectUrl = $attached['attributes']['next_action']['redirect']['url'] ?? null;

    if (!$redirectUrl) {
      if ($attached['attributes']['status'] === 'succeeded') {
        $order->update(['payment_status' => 'paid']);

        return redirect()->route('checkout.order-result', [
          'order' => $order->id,
          'result' => 'success',
        ]);
      }

      return redirect()->route('checkout.order-result', [
        'order' => $order->id,
        'result' => 'failed',
      ]);
    }

    return Inertia::location($redirectUrl);
  }

  public function orderResult(Request $request)
  {
    $order = Order::where('id', $request->query('order'))->where('user_id', Auth::id())->firstOrFail();

    return Inertia::render('user/checkout/result', [
      'order' => new OrderResource($order),
      'result' => $request->query('result', 'success'),
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

    if ($request->delivery_type !== 'standard' && !empty($checkout['voucher_id'])) {
      $voucher = Voucher::withoutTrashed()->find($checkout['voucher_id']);
      if ($voucher && $voucher->type === 'shipping') {
        $checkout['voucher_id'] = null;
        session()->flash('warning', 'Shipping voucher removed (Standard delivery only).');
      }
    }

    $checkout['delivery_type'] = $request->delivery_type;
    $checkout['schedule'] =
      $request->delivery_type === 'custom'
        ? ['date' => $request->schedule_date, 'time' => $request->schedule_time]
        : null;

    session()->put('checkout_settings', $checkout);

    return back();
  }

  public function applyVoucher(Request $request)
  {
    $request->validate(['voucher_id' => 'required|exists:vouchers,id']);

    $user = Auth::user();
    $voucher = Voucher::withoutTrashed()->findOrFail($request->voucher_id);
    $checkoutData = $this->getCheckoutData($request, $user);

    if (!$voucher->isUsable($checkoutData['subtotal'], $user->id)) {
      return back()->withErrors(['voucher' => 'This voucher is not available for your order.']);
    }

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

    return back()->with('success', 'Voucher removed.');
  }

  // ---- Private Helpers ----

  private function getCheckoutData(Request $request, $user)
  {
    $checkout = session()->get('checkout_settings', []);

    if (!empty($checkout['buy_now'])) {
      $variantId = $checkout['buy_now']['variant_id'];
      $qty = (int) ($checkout['buy_now']['qty'] ?? 1);
      $variant = ProductVariant::with('product')->findOrFail($variantId);

      $item = new CartItem(['quantity' => $qty, 'product_variant_id' => $variant->id]);
      $item->setRelation('variant', $variant);

      return [
        'items' => collect([$item]),
        'subtotal' => $variant->calculated_price * $qty,
        'count' => $qty,
      ];
    }

    $items = $user
      ->cartItems()
      ->where('checked', true)
      ->whereHas('variant', fn($q) => $q->where('stock_qty', '>', 0))
      ->with('variant.product')
      ->get();

    return [
      'items' => $items,
      'subtotal' => $items->sum(fn($i) => $i->variant->calculated_price * $i->quantity),
      'count' => $items->sum('quantity'),
    ];
  }

  private function getEligibleVouchers($user, float $subtotal)
  {
    request()->merge(['subtotal' => $subtotal]);

    return VoucherResource::collection(
      Voucher::where('is_active', true)
        ->with('users')
        ->where(fn($q) => $q->whereNull('expires_at')->orWhere('expires_at', '>', now()))
        ->where(fn($q) => $q->whereNull('usage_limit')->orWhereColumn('used_count', '<', 'usage_limit'))
        ->whereHas('users', fn($q) => $q->where('users.id', $user->id)->whereNull('user_voucher.used_at'))
        ->get()
        ->values(),
    );
  }

  private function calculateShippingFee(string $type, float $subtotal): float
  {
    return match ($type) {
      'express' => 80.0,
      'custom' => 60.0,
      default => $subtotal >= 300 ? 0.0 : 40.0,
    };
  }
}
