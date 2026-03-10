<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Http\Resources\ServiceableAreaResource;
use App\Http\Resources\UserAddressResource;
use App\Models\ServiceableArea;
use App\Models\UserAddress;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class AddressController extends Controller
{
  public function index(Request $request)
  {
    $user = $request->user();

    return Inertia::render('user/profile/addresses', [
      'addresses' => UserAddressResource::collection($user->addresses()->with('serviceableArea')->latest()->get()),
      'serviceableAreas' => ServiceableAreaResource::collection(ServiceableArea::orderBy('barangay')->get()),
    ]);
  }

  public function store(Request $request)
  {
    $validated = $request->validate(
      [
        'type' => 'required|in:Home,Office,Other',
        'serviceable_area_id' => 'nullable|exists:serviceable_areas,id',
        'street_address' => 'required|string',
        'contact_person' => 'required|string',
        'contact_number' => 'required|string|regex:/^\d{11}$/',
        'is_default' => 'required|boolean',
      ],
      [
        'contact_number.regex' => 'The contact number must be exactly 11 digits.',
      ],
    );

    DB::transaction(function () use ($request, $validated) {
      $user = $request->user();

      if ($user->addresses()->count() === 0) {
        $validated['is_default'] = true;
      }

      if ($validated['is_default']) {
        $user
          ->addresses()
          ->where('is_default', true)
          ->update(['is_default' => false]);
      }

      $user->addresses()->create($validated);
    });

    return back()->with('success', 'Address added successfully!');
  }

  public function update(Request $request, UserAddress $address)
  {
    if (auth()->id() !== $address->user_id) {
      abort(403);
    }

    $validated = $request->validate(
      [
        'type' => 'sometimes|required|in:Home,Office,Other',
        'serviceable_area_id' => 'sometimes|nullable|exists:serviceable_areas,id',
        'street_address' => 'sometimes|required|string',
        'contact_person' => 'sometimes|required|string',
        'contact_number' => 'sometimes|required|string|regex:/^\d{11}$/',
        'is_default' => 'sometimes|boolean',
      ],
      [
        'contact_number.regex' => 'The contact number must be exactly 11 digits.',
      ],
    );

    DB::transaction(function () use ($request, $validated, $address) {
      if (($validated['is_default'] ?? false) === true) {
        $request
          ->user()
          ->addresses()
          ->where('id', '!=', $address->id)
          ->update(['is_default' => false]);
      }

      // Prevent unsetting default if it's already the default
      if (isset($validated['is_default']) && $validated['is_default'] === false && $address->is_default) {
        unset($validated['is_default']);
      }

      $address->update($validated);
    });

    return back()->with('success', 'Address updated successfully!');
  }

  public function makeDefault(UserAddress $address)
  {
    if (auth()->id() !== $address->user_id) {
      abort(403);
    }

    if (!$address->is_default) {
      auth()
        ->user()
        ->addresses()
        ->where('is_default', true)
        ->update(['is_default' => false]);

      $address->update(['is_default' => true]);
    }
    return back()->with('success', 'Address has been set as default successfully!');
  }

  public function destroy(UserAddress $address)
  {
    if (auth()->id() !== $address->user_id) {
      abort(403);
    }

    DB::transaction(function () use ($address) {
      $wasDefault = $address->is_default;
      $userId = $address->user_id;

      $address->delete();

      if ($wasDefault) {
        $next = UserAddress::where('user_id', $userId)->latest()->first();
        if ($next) {
          $next->update(['is_default' => true]);
        }
      }
    });

    return back()->with('success', 'Address deleted successfully!');
  }
}
