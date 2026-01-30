<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use App\Models\UserAddress;
use App\Http\Resources\UserAddressResource;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class AddressController extends Controller
{
    public function index(Request $request)
    {
        $addresses = $request->user()->addresses()
            // ->orderBy('is_default', 'desc')
            ->orderBy('created_at', 'desc')
            ->get();

        return Inertia::render('user/profile/addresses', [
            'addresses' => UserAddressResource::collection($addresses)
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'type' => 'required|in:Home,Office,Other',
            'full_address' => 'required|string',
            'contact_person' => 'required|string',
            'contact_number' => 'required|string|regex:/^\d{11}$/',
            'is_default' => 'required|boolean'
        ], [
            'contact_number' => 'The contact number must be exactly 11 digits.'
        ]);
        
        // Use a transaction to ensure data integrity
        $address = DB::transaction(function () use ($request, $validated) {
            $user = $request->user();

            // 1. Force is_default to true if this is the first address
            if ($user->addresses()->count() === 0) {
                $validated['is_default'] = true;
            }

            // 2. If the new address is default, unset existing default addresses
            if ($validated['is_default']) {
                // Note: Ensure 'is_default' is in the $fillable array of your Address model
                $user->addresses()->where('is_default', true)->update(['is_default' => false]);
            }

            // 3. Create the new address
            return $user->addresses()->create($validated);
        });

        return back()->with('success', 'Address added successfully!');
    }

    public function update(Request $request, UserAddress $address)
    {
        // Security check
        if (auth()->id() !== $address->user_id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'type' => 'sometimes|required|in:Home,Office,Other',
            'full_address' => 'sometimes|required|string',
            'contact_person' => 'sometimes|required|string',
            'contact_number' => 'sometimes|required|string|regex:/^\d{11}$/',
            'is_default' => 'sometimes|boolean'
        ]);

        DB::transaction(function () use ($request, $validated, $address) {
            // If the user is trying to set THIS address as default
            if (($validated['is_default'] ?? false) == true) {
                $request->user()->addresses()->where('id', '!=', $address->id)->update(['is_default' => false]);
            } 
            
            // Prevent unsetting the default if it's the only address or already the default
            // (Ensures the user always has at least one default)
            if (isset($validated['is_default']) && $validated['is_default'] == false && $address->is_default) {
                unset($validated['is_default']); 
            }

            $address->update($validated);
        });

        // return response()->json([
        //     'message' => 'Address updated successfully',
        //     'address' => new UserAddressResource($address->fresh())
        // ], 200);
        return back()->with('success', 'Address updated successfully!');
    }

    public function destroy(UserAddress $address)
    {
        if (auth()->id() !== $address->user_id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        DB::transaction(function () use ($address) {
            $wasDefault = $address->is_default;
            $userId = $address->user_id;

            $address->delete();

            // If we just deleted the default address, promote another one
            if ($wasDefault) {
                $nextAddress = \App\Models\UserAddress::where('user_id', $userId)
                    ->latest()
                    ->first();

                if ($nextAddress) {
                    $nextAddress->update(['is_default' => true]);
                }
            }
        });

        // return response()->json([
        //     'message' => 'Address deleted successfully'
        // ], 200);
        return back()->with('success', 'Address deleted successfully!');;
    }
}