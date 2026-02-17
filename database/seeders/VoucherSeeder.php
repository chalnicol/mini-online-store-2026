<?php

namespace Database\Seeders;

use App\Models\Voucher;
use Illuminate\Database\Seeder;
use Illuminate\Support\Carbon;

use App\Models\User;

class VoucherSeeder extends Seeder
{
    public function run(): void
    {
        $publicVouchers = [
            [
                'code' => 'WELCOME10',
                'description' => '10% discount for new users',
                'is_active' => true,
                'type' => 'percentage',
                'value' => 10.00, // 10% off
                'min_spend' => 0.00,
                'usage_limit' => 100,
                'expires_at' => Carbon::now()->addMonths(3),
            ],
            [
                'code' => 'SAVEDIFTY',
                'description' => '₱50 off on orders over ₱500',
                'is_active' => true,
                'type' => 'fixed',
                'value' => 50.00, // 50 pesos off
                'min_spend' => 500.00, // Only if spending 500+
                'usage_limit' => 50,
                'expires_at' => Carbon::now()->addMonth(),
            ],
            [
                'code' => 'FREESHIP',
                'description' => 'Free shipping on orders over ₱200',
                'is_active' => true,
                'type' => 'shipping',
                'value' => 40.00, // Standard shipping fee amount
                'min_spend' => 200.00,
                'usage_limit' => null, // Unlimited use until expiry
                'expires_at' => Carbon::now()->addWeeks(2),
            ],
            [
                'code' => 'EXPIRED_TEST',
                'description' => 'Expired Voucher',
                'is_active' => true,
                'type' => 'fixed',
                'value' => 100.00,
                'min_spend' => 0.00,
                'usage_limit' => 10,
                'expires_at' => Carbon::now()->subDays(1), // Already expired
            ],
            [
                'code' => 'LIMIT_TEST',
                'description' => 'Limited Use Voucher',
                'is_active' => true,
                'type' => 'fixed',
                'value' => 20.00,
                'min_spend' => 0.00,
                'usage_limit' => 5,
                'used_count' => 5, // Already reached the limit
                'expires_at' => Carbon::now()->addYear(),
            ],
        ];

        foreach ($publicVouchers as $data) {
            Voucher::create($data);
        }

        // 2. Create a Private Compensation Voucher (Assigned to User #1)
        $user = User::first();
        
        if ($user) {
            $personalVoucher = Voucher::create([
                'code' => 'SORRY100',
                'description' => 'Personal compensation for late delivery',
                'is_active' => true,
                'type' => 'fixed',
                'value' => 100.00,
                'min_spend' => 0.00,
                'usage_limit' => 1,
                'user_id' => $user->id, // Assigned to this user
                'expires_at' => Carbon::now()->addMonth(),
            ]);

            // Automatically "Claim" it for them by adding to the pivot table
            $user->vouchers()->attach($personalVoucher->id);
        }

       
    }
}