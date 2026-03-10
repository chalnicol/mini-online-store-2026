<?php

namespace App\Http\Controllers;

use App\Models\Voucher;
use App\Http\Resources\VoucherResource;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class VoucherWalletController extends Controller
{
  /**
   * Voucher Wallet Page — two tabs:
   * 1. Available: public vouchers user hasn't claimed yet
   * 2. My Wallet: vouchers already claimed, not yet used
   */
  public function index()
  {
    $user = Auth::user();

    //  Tab 1: Public vouchers not yet claimed by this user
    $available = Voucher::where('is_active', true)
      ->where('is_personal', false) // public only
      ->where(fn($q) => $q->whereNull('expires_at')->orWhere('expires_at', '>', now()))
      ->where(fn($q) => $q->whereNull('usage_limit')->orWhereColumn('used_count', '<', 'usage_limit'))
      //  Not yet in user's wallet
      ->whereDoesntHave('users', fn($q) => $q->where('users.id', $user->id))
      ->with('users')
      ->get();

    //  Tab 2: Vouchers in user's wallet (claimed but not yet used)
    $wallet = Voucher::where('is_active', true)
      ->where(fn($q) => $q->whereNull('expires_at')->orWhere('expires_at', '>', now()))
      ->whereHas('users', fn($q) => $q->where('users.id', $user->id)->whereNull('user_voucher.used_at'))
      ->with('users')
      ->get();

    //  subtotal 0 — not in checkout context
    request()->merge(['subtotal' => 0]);

    return Inertia::render('user/profile/vouchers', [
      'available' => VoucherResource::collection($available),
      'wallet' => VoucherResource::collection($wallet),
    ]);
  }

  /**
   * Claim a public voucher — adds to user_voucher pivot
   */
  public function claim(Voucher $voucher)
  {
    $user = Auth::user();

    //  Only public vouchers can be claimed here
    if ($voucher->is_personal) {
      return back()->withErrors(['voucher' => 'This voucher is not available for claiming.']);
    }

    //  Already claimed
    if ($user->vouchers()->where('voucher_id', $voucher->id)->exists()) {
      return back()->withErrors(['voucher' => 'You already have this voucher in your wallet.']);
    }

    //  Usage limit reached
    if ($voucher->usage_limit && $voucher->used_count >= $voucher->usage_limit) {
      return back()->withErrors(['voucher' => 'This voucher has reached its limit.']);
    }

    //  Expired
    if ($voucher->expires_at && $voucher->expires_at->isPast()) {
      return back()->withErrors(['voucher' => 'This voucher has expired.']);
    }

    //  Add to wallet
    $user->vouchers()->attach($voucher->id, ['used_at' => null]);

    return back()->with('success', 'Voucher claimed and added to your wallet!');
  }

  /**
   * Remove a voucher from user's wallet (unclaim)
   * Only allowed if voucher hasn't been used yet
   */
  public function unclaim(Voucher $voucher)
  {
    $user = Auth::user();

    //  Check if voucher is in user's wallet
    $pivot = $user->vouchers()->where('voucher_id', $voucher->id)->first();

    if (!$pivot) {
      return back()->withErrors(['voucher' => 'This voucher is not in your wallet.']);
    }

    //  Can't remove if already used
    if ($pivot->pivot->used_at !== null) {
      return back()->withErrors(['voucher' => 'This voucher has already been used and cannot be removed.']);
    }

    //  Detach from wallet
    $user->vouchers()->detach($voucher->id);

    return back()->with('success', 'Voucher removed from your wallet.');
  }
}
