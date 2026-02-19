<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\StockMovementResource;
use Illuminate\Http\Request;

use Inertia\Inertia;

class DashboardController extends Controller
{
    //
    public function index()
    {
        // return Inertia::render('Admin/Dashboard', [
        //     'stats' => [
        //         'total_sales' => Order::where('payment_status', 'paid')->sum('final_total'),
        //         'pending_orders' => Order::where('status', 'pending')->count(),
        //         'low_stock_alerts' => ProductVariant::where('stock_qty', '<', 10)->count(),
        //         'today_revenue' => Order::whereDate('created_at', now())->sum('final_total'),
        //     ],
        //     'recent_movements' => StockMovementResource::collection(
        //         StockMovement::with(['productVariant.product'])->latest()->take(5)->get()
        //     )
        // ]);
        return Inertia::render('admin/dashboard');
    }
}
