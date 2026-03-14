<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;

class PayMongoService
{
  private string $secretKey;
  private string $baseUrl = 'https://api.paymongo.com/v1';

  public function __construct()
  {
    $this->secretKey = config('services.paymongo.secret_key');
  }

  // ---- Payment Intent API ----

  public function createPaymentIntent(int $amountInCents, array $paymentMethodAllowed, string $description = ''): array
  {
    $response = Http::withBasicAuth($this->secretKey, '')->post("{$this->baseUrl}/payment_intents", [
      'data' => [
        'attributes' => [
          'amount' => $amountInCents,
          'currency' => 'PHP',
          'description' => $description,
          'payment_method_allowed' => $paymentMethodAllowed,
          'payment_method_options' => [
            'card' => ['request_three_d_secure' => 'any'],
          ],
        ],
      ],
    ]);

    if ($response->failed()) {
      throw new \Exception('PayMongo payment intent creation failed: ' . $response->body());
    }

    return $response->json('data');
  }

  public function createPaymentMethod(string $type, array $billing = []): array
  {
    $response = Http::withBasicAuth($this->secretKey, '')->post("{$this->baseUrl}/payment_methods", [
      'data' => [
        'attributes' => [
          'type' => $type,
          'billing' => $billing,
        ],
      ],
    ]);

    if ($response->failed()) {
      throw new \Exception('PayMongo payment method creation failed: ' . $response->body());
    }

    return $response->json('data');
  }

  public function attachPaymentIntent(string $paymentIntentId, string $paymentMethodId, string $returnUrl): array
  {
    $response = Http::withBasicAuth($this->secretKey, '')->post(
      "{$this->baseUrl}/payment_intents/{$paymentIntentId}/attach",
      [
        'data' => [
          'attributes' => [
            'payment_method' => $paymentMethodId,
            'return_url' => $returnUrl,
          ],
        ],
      ],
    );

    if ($response->failed()) {
      throw new \Exception('PayMongo attach payment intent failed: ' . $response->body());
    }

    return $response->json('data');
  }

  public function getPaymentIntent(string $paymentIntentId): array
  {
    $response = Http::withBasicAuth($this->secretKey, '')->get("{$this->baseUrl}/payment_intents/{$paymentIntentId}");

    if ($response->failed()) {
      throw new \Exception('PayMongo payment intent retrieval failed: ' . $response->body());
    }

    return $response->json('data');
  }

  // ---- Webhook ----

  public function verifyWebhook(string $payload, string $signature): bool
  {
    $secret = config('services.paymongo.webhook_secret');
    $computed = hash_hmac('sha256', $payload, $secret);

    return hash_equals($computed, $signature);
  }

  // ---- Helpers ----

  public function toCents(float $amount): int
  {
    return (int) round($amount * 100);
  }
}
