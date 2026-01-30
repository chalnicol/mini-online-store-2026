<?php
namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\UserContact;
use Illuminate\Http\Request;

class ContactController extends Controller
{
    public function index(Request $request)
    {
        return $request->user()->contacts;
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'phone_number' => 'required|string|max:20',
            'label' => 'nullable|string|max:50', // e.g., "Work", "Personal"
            'is_primary' => 'boolean'
        ]);

        $user = $request->user();

        // If this is the first number, force it to be primary
        if ($user->contacts()->count() === 0) {
            $validated['is_primary'] = true;
        }

        // If user is setting this as primary, unset the old primary
        if ($validated['is_primary'] ?? false) {
            $user->contacts()->update(['is_primary' => false]);
        }

        $contact = $user->contacts()->create($validated);

        return response()->json($contact, 201);
    }

    public function destroy(UserContact $contact)
    {
        if (auth()->id() !== $contact->user_id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $wasPrimary = $contact->is_primary;
        $contact->delete();

        // Reassign primary if the deleted one was the primary
        if ($wasPrimary) {
            $nextContact = UserContact::where('user_id', auth()->id())->first();
            if ($nextContact) {
                $nextContact->update(['is_primary' => true]);
            }
        }

        return response()->json(['message' => 'Contact deleted']);
    }
}