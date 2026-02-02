<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;
use Illuminate\Support\Facades\Cache;
use App\Models\Category;
use App\Http\Resources\CategoryResource;
use App\Http\Resources\UserResource;
use App\Models\CartItem;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @see https://inertiajs.com/server-side-setup#root-template
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determines the current asset version.
     *
     * @see https://inertiajs.com/asset-versioning
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @see https://inertiajs.com/shared-data
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        
        return [
            ...parent::share($request),
            'name' => config('app.name'),
            'auth' => [
                'user' => $request->user() 
                    ? new UserResource(
                        $request->user()->loadSum('cartItems', 'quantity')
                    ) 
                    : null,
            ],
            'categories' =>Cache::rememberForever('global_category_tree', function () {
                $tree = Category::whereNull('parent_id')
                    ->with('childrenRecursive')
                    ->orderBy('name', 'asc')
                    ->get();

                return CategoryResource::collection($tree)->resolve();
            }),
            
            // 'flash' => [
            //     'success' => $request->session()->get('success') ?? $request->session()->get('status'),
            //     'error' => $request->session()->get('error'),
            // ],
            // 'sidebarOpen' => ! $request->hasCookie('sidebar_state') || $request->cookie('sidebar_state') === 'true',
        ];
    }
}
