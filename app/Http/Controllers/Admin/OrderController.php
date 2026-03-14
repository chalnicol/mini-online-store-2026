<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Models\Order;
use App\Http\Resources\OrderResource;

use Inertia\Inertia;

class OrderController extends Controller
{
  //

  public function index(Request $request)
  {
    $query = Order::query()->with(['items']);

    if ($request->filled('search')) {
      $search = $request->search;
      $query->where(
        fn($q) => $q
          ->where('order_number', 'like', "%{$search}%")
          ->orWhereHas('items', fn($q) => $q->where('product_name', 'like', "%{$search}%")),
      );
    }

    if ($request->filled('status')) {
      $query->where('status', $request->status);
    }

    if ($request->filled('date_from')) {
      $query->whereDate('created_at', '>=', $request->date_from);
    }

    if ($request->filled('date_to')) {
      $query->whereDate('created_at', '<=', $request->date_to);
    }

    $orders = $query->latest()->paginate(10)->withQueryString();

    $statuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled', 'returned'];

    $statusCounts = Order::query()
      ->selectRaw('status, count(*) as count')
      ->groupBy('status')
      ->pluck('count', 'status')
      ->toArray();

    // Ensure all statuses are present even if count is 0
    $counts = ['all' => Order::count()];
    foreach ($statuses as $status) {
      $counts[$status] = $statusCounts[$status] ?? 0;
    }

    return Inertia::render('admin/orders/index', [
      'orders' => OrderResource::collection($orders),
      'orderFilters' => (object) $request->only(['search', 'status', 'date_from', 'date_to']),
      'statusCounts' => $counts,
    ]);
  }

  public function show(Order $order)
  {
    return Inertia::render('admin/orders/show', [
      'order' => new OrderResource($order->load(['items'])),
    ]);
  }

  public function updateStatus(Order $order, Request $request)
  {
    $validated = $request->validate([
      'status' => 'required|in:pending,processing,shipped,delivered,cancelled',
    ]);

    $progression = [
      'pending' => 0,
      'processing' => 1,
      'shipped' => 2,
      'delivered' => 3,
      'cancelled' => 4,
    ];

    $currentRank = $progression[$order->status] ?? 0;
    $newRank = $progression[$validated['status']] ?? 0;

    // Allow forward progression only
    // Cancellation is allowed from pending and processing only
    if ($validated['status'] === 'cancelled') {
      if (!in_array($order->status, ['pending', 'processing'])) {
        return back()->withErrors(['status' => 'Order can only be cancelled before it is shipped.']);
      }
    } elseif ($newRank <= $currentRank) {
      return back()->withErrors([
        'status' => "Cannot move order from '{$order->status}' back to '{$validated['status']}'.",
      ]);
    }

    $order->update(['status' => $validated['status']]);

    return back()->with('success', 'Order status updated successfully.');
  }
}
