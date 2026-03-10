<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Services\PayMongoService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class PaymentController extends Controller
{
    public function __construct(private PayMongoService $payMongo) {}

    // ---- Step 1: Create PayMongo source after order is placed ----

    public function createSource(Request $request)
    {
        $request->validate([
            'order_id' => 'required|exists:orders,id',
        ]);

        $order = Order::findOrFail($request->order_id);

        if ($order->user_id !== Auth::id()) {
            abort(403);
        }

        if ($order->payment_status === 'paid') {
            return back()->withErrors(['payment' => 'This order has already been paid.']);
        }

        $type = match ($order->payment_method) {
            'gcash'   => 'gcash',
            'paymaya' => 'paymaya',
            default   => null,
        };

        if (!$type) {
            return back()->withErrors(['payment' => 'Invalid payment method for online payment.']);
        }

        $user = Auth::user();

        $source = $this->payMongo->createSource(
            type:         $type,
            amountInCents: $this->payMongo->toCents($order->final_total),
            returnUrl:    route('payment.return', $order->id),
            cancelUrl:    route('payment.cancel', $order->id),
            billing:      [
                'name'  => $user->fname . ' ' . $user->lname,
                'email' => $user->email,
                'phone' => $order->shippingContactNumber ?? '',
            ],
        );

        // Store source ID on the order
        $order->update(['paymongo_source_id' => $source['id']]);

        $attributes = $source['attributes'];

        return response()->json([
            'sourceId'    => $source['id'],
            'checkoutUrl' => $attributes['redirect']['checkout_url'],
            'qrCode'      => $attributes['qr_code'] ?? null, // only available for gcash
            'status'      => $attributes['status'],
        ]);
    }

    // ---- Step 2: Poll source status (frontend calls this every few seconds) ----

    public function checkSource(Request $request, Order $order)
    {
        if ($order->user_id !== Auth::id()) {
            abort(403);
        }

        if (!$order->paymongo_source_id) {
            return response()->json(['status' => 'pending']);
        }

        // Already paid — no need to check
        if ($order->payment_status === 'paid') {
            return response()->json(['status' => 'paid']);
        }

        $source = $this->payMongo->getSource($order->paymongo_source_id);
        $status = $source['attributes']['status'];

        // Source is chargeable — create the actual payment
        if ($status === 'chargeable') {
            $payment = $this->payMongo->createPayment(
                sourceId:     $order->paymongo_source_id,
                amountInCents: $this->payMongo->toCents($order->final_total),
                description:  "Payment for Order {$order->order_number}",
            );

            $order->update([
                'payment_status'     => 'paid',
                'paymongo_payment_id' => $payment['id'],
            ]);

            return response()->json(['status' => 'paid']);
        }

        return response()->json(['status' => $status]);
    }

    // ---- Step 3a: User returns after successful payment (redirect method) ----

    public function handleReturn(Request $request, Order $order)
    {
        if ($order->user_id !== Auth::id()) {
            abort(403);
        }

        return Inertia::render('user/profile/payment-result', [
            'order'  => $order->load('items'),
            'status' => $order->payment_status === 'paid' ? 'success' : 'pending',
        ]);
    }

    // ---- Step 3b: User cancels payment ----

    public function handleCancel(Request $request, Order $order)
    {
        if ($order->user_id !== Auth::id()) {
            abort(403);
        }

        return Inertia::render('user/profile/payment-result', [
            'order'  => $order->load('items'),
            'status' => 'cancelled',
        ]);
    }

    // ---- Webhook: PayMongo notifies us of payment events ----

    public function webhook(Request $request)
    {
        $payload   = $request->getContent();
        $signature = $request->header('Paymongo-Signature');

        if (!$this->payMongo->verifyWebhook($payload, $signature)) {
            Log::warning('PayMongo webhook signature mismatch');
            return response()->json(['message' => 'Invalid signature'], 401);
        }

        $event = $request->json('data.attributes');
        $type  = $event['type'] ?? null;

        Log::info('PayMongo webhook received', ['type' => $type]);

        if ($type === 'source.chargeable') {
            $sourceId = $event['data']['id'];

            $order = Order::where('paymongo_source_id', $sourceId)->first();

            if (!$order || $order->payment_status === 'paid') {
                return response()->json(['message' => 'OK']);
            }

            $payment = $this->payMongo->createPayment(
                sourceId:      $sourceId,
                amountInCents: $this->payMongo->toCents($order->final_total),
                description:   "Payment for Order {$order->order_number}",
            );

            $order->update([
                'payment_status'      => 'paid',
                'paymongo_payment_id' => $payment['id'],
            ]);
        }

        return response()->json(['message' => 'OK']);
    }
}
