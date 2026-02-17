<?php

namespace App\Http\Controllers;

use App\Models\Voucher;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class VoucherController extends Controller
{
    /**
     * Display a list of vouchers for the Global Window
     */
    public function index()
    {
        $user = Auth::user();
        $now = now();

        // 1. Get ALL vouchers that are either public OR specifically for this user
        // AND have not expired yet.
        $allEligible = Voucher::where(function ($query) use ($user) {
                $query->whereNull('user_id')      // Public vouchers
                    ->orWhere('user_id', $user->id); // Personal vouchers (Late delivery, etc.)
            })
            ->where(function ($query) use ($now) {
                $query->whereNull('expires_at')
                    ->orWhere('expires_at', '>', $now);
            })
            // Exclude vouchers THIS user has already used (in the pivot table)
            ->whereDoesntHave('users', function ($q) use ($user) {
                $q->where('user_id', $user->id)->whereNotNull('used_at');
            })
            ->get();

        // 2. Map through them to add a "status" for your React UI
        $vouchersWithStatus = $allEligible->map(function ($voucher) use ($user) {
            // Check if this specific voucher is already in the user's wallet
            $isClaimed = $user->vouchers()
                ->where('voucher_id', $voucher->id)
                ->exists();

            return [
                'id' => $voucher->id,
                'code' => $voucher->code,
                'type' => $voucher->type,
                'value' => $voucher->value,
                'min_spend' => $voucher->min_spend,
                'expires_at' => $voucher->expires_at,
                'is_claimed' => $isClaimed, // TRUE = already in wallet, FALSE = needs auto-claim
                'is_personal' => $voucher->user_id !== null, // To show "Special Reward" badge
            ];
        });

        return response()->json([
            'vouchers' => $vouchersWithStatus
        ]);
    }

    /**
     * Logic to claim a voucher
     */
    public function claim(Request $request, Voucher $voucher)
    {
        $user = Auth::user();

        // 1. Check if it's already claimed
        if ($user->vouchers()->where('voucher_id', $voucher->id)->exists()) {
            return back()->withErrors(['voucher' => 'You already claimed this voucher.']);
        }

        // 2. Check if the voucher is private to someone else
        if ($voucher->user_id !== null && $voucher->user_id !== $user->id) {
            return back()->withErrors(['voucher' => 'This voucher is not available for you.']);
        }

        // 3. Check global usage limit (if 100 people already claimed/used it)
        if ($voucher->usage_limit && $voucher->used_count >= $voucher->usage_limit) {
            return back()->withErrors(['voucher' => 'This voucher has reached its limit.']);
        }

        // 4. ATTACH TO WALLET
        $user->vouchers()->attach($voucher->id);

        return back()->with('success', 'Voucher added to your wallet!');
    }

   
}
