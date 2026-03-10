<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\OrderReturn;
use App\Http\Resources\OrderReturnResource;
use App\Http\Resources\PaginatedResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Inertia\Inertia;

class OrderReturnController extends Controller
{
  public function index(Request $request)
  {
    $user = Auth::user();

    $query = OrderReturn::where('user_id', $user->id)->with(['order:id,order_number', 'items']);

    if ($request->filled('search')) {
      $query->where(
        fn($q) => $q
          ->where('return_number', 'like', "%{$request->search}%")
          ->orWhereHas('order', fn($q) => $q->where('order_number', 'like', "%{$request->search}%")),
      );
    }

    if ($request->filled('status')) {
      $query->where('status', $request->status);
    }

    $returns = $query->latest()->paginate(10)->withQueryString();

    return Inertia::render('user/profile/returns', [
      'returns' => OrderReturnResource::collection($returns),
      'filters' => $request->only(['search', 'status']),
    ]);
  }

  public function store(Request $request, Order $order)
  {
    if ($order->user_id !== Auth::id()) {
      abort(403);
    }

    if (!$order->isReturnable()) {
      return back()->withErrors(['return' => 'Only delivered orders can be returned.']);
    }

    if (
      $order
        ->returns()
        ->whereIn('status', ['pending', 'approved', 'received'])
        ->exists()
    ) {
      return back()->withErrors(['return' => 'This order already has an active return request.']);
    }

    $request->validate([
      'notes' => 'nullable|string|max:1000',
      'items' => 'required|array|min:1',
      'items.*.order_item_id' => 'required|exists:order_items,id',
      'items.*.quantity' => 'required|integer|min:1',
      'items.*.reason' => 'required|in:damaged_item_received,expired_product,wrong_item_sent,missing_items',
      'items.*.photos' => 'nullable|array|max:3',
      'items.*.photos.*' => 'nullable|image|max:2048',
    ]);

    DB::transaction(function () use ($request, $order) {
      $return = OrderReturn::create([
        'return_number' => $this->generateReturnNumber(),
        'order_id' => $order->id,
        'user_id' => Auth::id(),
        'status' => 'pending',
      ]);

      foreach ($request->items as $itemData) {
        $orderItem = $order->items->firstWhere('id', $itemData['order_item_id']);

        if (!$orderItem) {
          continue;
        }

        $photoPaths = [];
        if (!empty($itemData['photos'])) {
          foreach ($itemData['photos'] as $photo) {
            $photoPaths[] = $photo->store('returns', 'public');
          }
        }

        $return->items()->create([
          'order_item_id' => $orderItem->id,
          'product_variant_id' => $orderItem->product_variant_id,
          'product_name' => $orderItem->product_name,
          'variant_name' => $orderItem->variant_name,
          'quantity' => $itemData['quantity'],
          'reason' => $itemData['reason'],
          'condition' => 'pending_inspection',
          'resolution' => 'pending',
          'is_restocked' => false,
        ]);
      }
    });

    return back()->with('success', 'Return request submitted successfully.');
  }

  public function cancel(OrderReturn $return)
  {
    if ($return->user_id !== Auth::id()) {
      abort(403);
    }

    if ($return->status !== 'pending') {
      return back()->withErrors(['return' => 'Only pending returns can be cancelled.']);
    }

    $return->update(['status' => 'cancelled']);

    return back()->with('success', 'Return request cancelled.');
  }

  private function generateReturnNumber(): string
  {
    do {
      $number = 'RET-' . strtoupper(Str::random(8));
    } while (OrderReturn::where('return_number', $number)->exists());

    return $number;
  }
}
