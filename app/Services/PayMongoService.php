<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;

class PayMongoService
{
    private string $secretKey;
    private string $publicKey;
    private string $baseUrl = 'https://api.paymongo.com/v1';

    public function __construct()
    {
        $this->secretKey = config('services.paymongo.secret_key');
        $this->publicKey = config('services.paymongo.public_key');
    }

    // ---- Create a Source (GCash or PayMaya) ----

    public function createSource(
        string $type,       // 'gcash' or 'paymaya'
        int $amountInCents, // e.g. 50000 = ₱500.00
        string $returnUrl,  // where to redirect after payment
        string $cancelUrl,  // where to redirect on cancel
        array $billing = [],
    ): array {
        $response = Http::withBasicAuth($this->secretKey, '')
            ->post("{$this->baseUrl}/sources", [
                'data' => [
                    'attributes' => [
                        'type'       => $type,
                        'amount'     => $amountInCents,
                        'currency'   => 'PHP',
                        'redirect'   => [
                            'success' => $returnUrl,
                            'failed'  => $cancelUrl,
                        ],
                        'billing'    => $billing,
                    ],
                ],
            ]);

        if ($response->failed()) {
            throw new \Exception('PayMongo source creation failed: ' . $response->body());
        }

        return $response->json('data');
    }

    // ---- Create a Payment from a chargeable source ----

    public function createPayment(
        string $sourceId,
        int $amountInCents,
        string $description = '',
    ): array {
        $response = Http::withBasicAuth($this->secretKey, '')
            ->post("{$this->baseUrl}/payments", [
                'data' => [
                    'attributes' => [
                        'amount'      => $amountInCents,
                        'currency'    => 'PHP',
                        'description' => $description,
                        'source'      => [
                            'id'   => $sourceId,
                            'type' => 'source',
                        ],
                    ],
                ],
            ]);

        if ($response->failed()) {
            throw new \Exception('PayMongo payment creation failed: ' . $response->body());
        }

        return $response->json('data');
    }

    // ---- Retrieve a Source ----

    public function getSource(string $sourceId): array
    {
        $response = Http::withBasicAuth($this->secretKey, '')
            ->get("{$this->baseUrl}/sources/{$sourceId}");

        if ($response->failed()) {
            throw new \Exception('PayMongo source retrieval failed: ' . $response->body());
        }

        return $response->json('data');
    }

    // ---- Verify webhook signature ----

    public function verifyWebhook(string $payload, string $signature): bool
    {
        $secret    = config('services.paymongo.webhook_secret');
        $computed  = hash_hmac('sha256', $payload, $secret);

        return hash_equals($computed, $signature);
    }

    // ---- Convert peso to cents ----

    public function toCents(float $amount): int
    {
        return (int) round($amount * 100);
    }
}
