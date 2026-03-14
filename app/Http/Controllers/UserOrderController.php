<?php

namespace App\Http\Controllers;

use App\Models\Order;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Http\Resources\OrderResource;
use Inertia\Inertia;

class UserOrderController extends Controller
{
  public function index(Request $request)
  {
    $user = Auth::user();

    $query = Order::where('user_id', $user->id)->with(['items']);

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

    return Inertia::render('user/profile/orders/index', [
      'orders' => OrderResource::collection($orders),
      'orderFilters' => (object) $request->only(['search', 'status', 'date_from', 'date_to']),
    ]);
  }

  // Clean show() method
  public function show(Order $order)
  {
    if ($order->user_id !== Auth::id()) {
      abort(403);
    }

    $order->load(['items.variant', 'address', 'returns.items']);

    return Inertia::render('user/profile/orders/show', [
      'order' => new OrderResource($order),
    ]);
  }

  public function cancel(Request $request, Order $order)
  {
    if ($order->user_id !== Auth::id()) {
      abort(403);
    }

    if (!$order->isCancellable()) {
      return back()->withErrors(['order' => 'This order can no longer be cancelled.']);
    }

    $order->update(['status' => 'cancelled']);

    return back()->with('success', 'Order cancelled successfully.');
  }

  public function requestReturn(Request $request, Order $order)
  {
    if ($order->user_id !== Auth::id()) {
      abort(403);
    }

    if (!$order->isReturnable()) {
      return back()->withErrors(['order' => 'Only delivered orders can be returned.']);
    }

    // Return request logic handled in OrderReturnController
    return redirect()->route('orders.return.create', $order);
  }
}
