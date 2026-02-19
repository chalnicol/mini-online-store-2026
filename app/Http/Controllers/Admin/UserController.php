<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

use App\Models\User;
use App\Http\Resources\UserResource;

use Inertia\Inertia;

class UserController extends Controller
{
    //
    public function index(Request $request)
    {
        $users = User::query()
            ->with(['addresses', 'contacts'])
            // Use 'where' inside a closure if you plan to search multiple columns later
            ->when($request->search, function ($query, $search) {
                // Grouping the OR conditions inside a nested closure
                $query->where(function ($q) use ($search) {
                    $q->where('fname', 'like', "%{$search}%")
                    ->orWhere('lname', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%");
                });
            })
            ->latest()
            ->paginate(10)
            ->withQueryString();


        return Inertia::render('admin/users/index', [
            // FIXED: Do not use UserResource::collection() here for paginated data
            // Instead, pass the paginator directly; Laravel/Inertia will handle the transformation
            'users' => UserResource::collection($users),
            'filters' => (object) $request->only(['search'])
        ]);
    }

    public function show(User $user)
    {   

        return Inertia::render('admin/users/show', [
            'user' => new UserResource($user->load('addresses'))
        ]);
    }
}
