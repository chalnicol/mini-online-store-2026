<?php

namespace App\Http\Controllers\Admin;

use Illuminate\Http\Request;

use App\Http\Controllers\Controller;
use App\Http\Resources\VoucherResource;
use App\Http\Resources\UserResource;

use App\Models\Voucher;
use App\Models\User;

use Inertia\Inertia;

class VoucherController extends Controller
{
  public function index(Request $request)
  {
    $vouchers = Voucher::query()
      ->when($request->search, function ($query, $search) {
        $query->where(function ($q) use ($search) {
          $q->where('code', 'like', "%{$search}%")->orWhere('description', 'like', "%{$search}%");
        });
      })
      ->orderBy('updated_at', 'desc')
      ->paginate(10)
      ->withQueryString();

    return Inertia::render('admin/vouchers/index', [
      'vouchers' => VoucherResource::collection($vouchers),
      'filters' => (object) $request->only(['search']),
    ]);
  }

  public function create(Voucher $voucher)
  {
    return Inertia::render('admin/vouchers/create');
  }

  public function edit(Voucher $voucher)
  {
    return Inertia::render('admin/vouchers/edit', [
      'voucher' => new VoucherResource($voucher->load('users')),
    ]);
  }

  public function show(Voucher $voucher)
  {
    //
    $users = $voucher->users()->latest()->paginate(5)->withQueryString();

    return Inertia::render('admin/vouchers/show', [
      'voucher' => new VoucherResource($voucher),
      'users' => UserResource::collection($users),
    ]);
  }

  public function store(Request $request)
  {
    // dd($request->code);

    $validated = $request->validate([
      'code' => 'required|string|unique:vouchers,code|max:50',
      'type' => 'required|in:fixed,percentage,shipping',
      'value' => 'required|numeric|min:0',
      'min_spend' => 'required|numeric|min:0',
      'description' => 'nullable|string|max:255',
      'usage_limit' => 'nullable|integer|min:0',
      'expires_at' => 'nullable|date|after:today',
      'is_active' => 'boolean',
      'is_personal' => 'boolean',
    ]);

    // Format code to uppercase automatically
    $validated['code'] = strtoupper($validated['code']);

    $voucher = Voucher::create($validated);

    return to_route('admin.vouchers')->with('success', 'Voucher created successfully.');
  }

  public function update(Voucher $voucher, Request $request)
  {
    $isUsed = $voucher->used_count > 0;

    $rules = [
      'description' => 'nullable|string|max:255',
      'usage_limit' => 'nullable|integer|min:' . $voucher->used_count, // Cannot set limit lower than current usage
      'expires_at' => 'nullable|date',
      'is_active' => 'boolean',
      'is_personal' => 'boolean',
    ];

    // Only allow editing these if the voucher hasn't been used yet
    if (!$isUsed) {
      $rules['code'] = 'required|string|max:50|unique:vouchers,code,' . $voucher->id;
      $rules['type'] = 'required|in:fixed,percentage,shipping';
      $rules['value'] = 'required|numeric|min:0';
      $rules['min_spend'] = 'required|numeric|min:0';
    }

    $validated = $request->validate($rules);

    // If used, prevent the request from sneaking in restricted fields
    if ($isUsed) {
      $validated = $request->only(['description', 'usage_limit', 'expires_at', 'is_active', 'is_personal']);
    } else {
      $validated['code'] = strtoupper($validated['code']);
    }

    $voucher->update($validated);

    return to_route('admin.vouchers.show', $voucher->id)->with('success', 'Voucher updated successfully.');
  }

  public function destroy(Voucher $voucher)
  {
    // Guard: Cannot delete if users are attached
    if ($voucher->users()->exists()) {
      return back()->withErrors([
        'delete' => 'Cannot delete voucher because it is currently applied to one or more users.',
      ]);
    }

    $voucher->delete();

    return to_route('admin.vouchers')->with('success', 'Voucher deleted successfully.');
  }

  public function toggleActiveStatus(Voucher $voucher)
  {
    $voucher->update(['is_active' => !$voucher->is_active]);

    return back();
  }

  public function updateAttachedUsers(Voucher $voucher, Request $request)
  {
    $request->validate([
      'action' => 'required|in:attach,detach',
      'id' => 'required|integer|exists:users,id',
    ]);

    $userId = $request->input('id');
    $action = $request->input('action');

    if ($action === 'attach') {
      // syncWithoutDetaching prevents duplicate rows if clicked twice
      $voucher->users()->syncWithoutDetaching([$userId]);
    } else {
      $voucher->users()->detach($userId);
    }

    return back()->with('success', 'Users updated successfully.');
  }

  public function searchUsers(Voucher $voucher, Request $request)
  {
    $users = User::query()
      // 1. Efficiently check if attached (Adds 'vouchers_exists' boolean)
      ->withExists([
        'vouchers' => function ($q) use ($voucher) {
          $q->where('vouchers.id', $voucher->id);
        },
      ])
      // 2. Search logic
      ->when($request->search, function ($query, $search) {
        $query->where(function ($q) use ($search) {
          $q->where('fname', 'like', "%{$search}%")
            ->orWhere('lname', 'like', "%{$search}%")
            ->orWhere('email', 'like', "%{$search}%");
        });
      })
      ->limit(10)
      ->get();

    // 3. Transform for the response
    $data = $users->map(function ($user) {
      return [
        'id' => $user->id,
        'fname' => $user->fname,
        'lname' => $user->lname,
        'email' => $user->email,
        'isAttached' => $user->vouchers_exists, // No extra query here!
      ];
    });

    return response()->json($data);
  }
}
