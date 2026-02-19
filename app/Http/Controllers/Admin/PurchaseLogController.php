<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class PurchaseLogController extends Controller
{
    public function index(Request $request)
    {
        $purchaseLogs = PurchaseLog::query()
            ->when($request->search, fn($q, $s) => $q->where('batch_number', 'like', "%{$s}%"))
            ->latest()
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('Admin/PurchaseLogs/Index', [
            'logs' => $purchaseLogs,
            'filters' => $request->only(['search'])
        ]);
    }
}
