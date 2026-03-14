<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Services\PayMongoService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class PaymentController extends Controller
{
  public function __construct(private PayMongoService $payMongo) {}

  // ---- Return handler ----

  public function handleReturn(Order $order)
  {
    if ($order->user_id !== Auth::id()) {
      abort(403);
    }

    if ($order->payment_status !== 'paid' && $order->paymongo_payment_intent_id) {
      try {
        $intent = $this->payMongo->getPaymentIntent($order->paymongo_payment_intent_id);

        if ($intent['attributes']['status'] === 'succeeded') {
          $paymentId = $intent['attributes']['payments'][0]['id'] ?? null;

          $order->update([
            'payment_status' => 'paid',
            'paymongo_payment_id' => $paymentId,
          ]);
        }
      } catch (\Exception $e) {
        Log::error('Payment intent check on return failed', ['error' => $e->getMessage()]);
      }
    }

    $order->refresh();

    return redirect()->route('checkout.order-result', [
      'order' => $order->id,
      'result' => $order->payment_status === 'paid' ? 'success' : 'pending',
    ]);
  }

  // ---- Cancel handler ----

  public function handleCancel(Order $order)
  {
    if ($order->user_id !== Auth::id()) {
      abort(403);
    }

    return redirect()->route('checkout.order-result', [
      'order' => $order->id,
      'result' => 'cancelled',
    ]);
  }

  // ---- Webhook ----

  public function webhook(Request $request)
  {
    $payload = $request->getContent();
    $signature = $request->header('Paymongo-Signature');

    if (!$this->payMongo->verifyWebhook($payload, $signature)) {
      Log::warning('PayMongo webhook signature mismatch');
      return response()->json(['message' => 'Invalid signature'], 401);
    }

    $event = $request->json('data.attributes');
    $type = $event['type'] ?? null;

    if ($type === 'payment_intent.succeeded') {
      $intentId = $event['data']['id'];
      $order = Order::where('paymongo_payment_intent_id', $intentId)->first();

      if (!$order || $order->payment_status === 'paid') {
        return response()->json(['message' => 'OK']);
      }

      $paymentId = $event['data']['attributes']['payments'][0]['id'] ?? null;

      $order->update([
        'payment_status' => 'paid',
        'paymongo_payment_id' => $paymentId,
      ]);
    }

    return response()->json(['message' => 'OK']);
  }
}
