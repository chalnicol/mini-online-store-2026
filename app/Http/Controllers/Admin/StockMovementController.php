<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class StockMovementController extends Controller
{
    public function index(Request $request)
    {
        $movements = StockMovement::with(['productVariant.product', 'user'])
            ->when($request->type, fn($q, $t) => $q->where('type', $t))
            ->latest()
            ->paginate(15);

        return Inertia::render('Admin/StockMovements/Index', [
            'movements' => $movements,
            'types' => ['in', 'out', 'adjustment', 'return']
        ]);
    }
}
