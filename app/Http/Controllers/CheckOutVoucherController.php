<?php

namespace App\Http\Controllers;

use App\Models\Voucher;
use App\Http\Resources\VoucherResource;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class CheckOutVoucherController extends Controller
{
  /**
   * Voucher Wallet — shows all vouchers available to claim + already claimed
   * Used for the /profile/vouchers wallet page
   */
  public function index(Request $request)
  {
    $user = Auth::user();

    // ✅ Public vouchers not yet claimed + personal vouchers assigned to user
    $vouchers = Voucher::where('is_active', true)
      ->where(fn($q) => $q->whereNull('expires_at')->orWhere('expires_at', '>', now()))
      ->where(fn($q) => $q->whereNull('usage_limit')->orWhereColumn('used_count', '<', 'usage_limit'))
      ->where(
        fn($q) => $q
          // Public unclaimed vouchers
          ->where(
            fn($q) => $q
              ->where('is_personal', false)
              ->whereDoesntHave('users', fn($q) => $q->where('users.id', $user->id)),
          )
          // OR already in user's wallet (claimed, not yet used)
          ->orWhereHas('users', fn($q) => $q->where('users.id', $user->id)->whereNull('user_voucher.used_at'))
          // OR personal vouchers assigned to this user
          ->orWhere(
            fn($q) => $q->where('is_personal', true)->whereHas('users', fn($q) => $q->where('users.id', $user->id)),
          ),
      )
      ->with('users') // ✅ needed for isClaimed check in resource
      ->get();

    // ✅ Pass subtotal as 0 for wallet page — canApply not relevant here
    request()->merge(['subtotal' => 0]);

    return response()->json([
      'vouchers' => VoucherResource::collection($vouchers),
    ]);
  }

  /**
   * Claim a public voucher — adds to user_voucher pivot
   */
  public function claim(Request $request, Voucher $voucher)
  {
    $user = Auth::user();

    // ✅ Check if already claimed
    if ($user->vouchers()->where('voucher_id', $voucher->id)->exists()) {
      return back()->withErrors(['voucher' => 'You already claimed this voucher.']);
    }

    // ✅ Block personal vouchers not assigned to this user
    if ($voucher->is_personal) {
      $isAssigned = $voucher->users()->where('users.id', $user->id)->exists();

      if (!$isAssigned) {
        return back()->withErrors(['voucher' => 'This voucher is not available for you.']);
      }
    }

    // ✅ Check global usage limit
    if ($voucher->usage_limit && $voucher->used_count >= $voucher->usage_limit) {
      return back()->withErrors(['voucher' => 'This voucher has reached its limit.']);
    }

    // ✅ Check expiry
    if ($voucher->expires_at && $voucher->expires_at->isPast()) {
      return back()->withErrors(['voucher' => 'This voucher has expired.']);
    }

    // ✅ Attach to wallet
    $user->vouchers()->attach($voucher->id, ['used_at' => null]);

    return back()->with('success', 'Voucher added to your wallet!');
  }
}
