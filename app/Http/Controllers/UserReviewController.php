<?php

namespace App\Http\Controllers;

use App\Models\Review;
use App\Models\OrderItem;
use App\Http\Resources\ReviewResource;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class UserReviewController extends Controller
{
  public function index(Request $request)
  {
    $user = Auth::user();

    // My Reviews
    $reviewsQuery = Review::where('user_id', $user->id)->with(['product', 'variant']);

    if ($request->filled('search')) {
      $reviewsQuery->whereHas('product', fn($q) => $q->where('name', 'like', "%{$request->search}%"));
    }

    $myReviews = $reviewsQuery
      ->latest()
      ->paginate(10, ['*'], 'page')
      ->withQueryString();

    // Pending Reviews
    $pendingQuery = \App\Models\OrderItem::query()
      ->whereHas('order', fn($q) => $q->where('user_id', $user->id)->where('status', 'delivered'))
      ->whereNotNull('product_variant_id')
      ->whereDoesntHave('variant.reviews', fn($q) => $q->where('user_id', $user->id))
      ->with(['variant.product', 'order']);

    $pendingTotal = $pendingQuery->count();

    $pendingReviews = $pendingQuery
      ->latest()
      ->paginate(10, ['*'], 'pending_page')
      ->withQueryString()
      ->through(
        fn($item) => [
          'order_id' => $item->order->id,
          'order_number' => $item->order->order_number,
          'order_item_id' => $item->id,
          'product_id' => $item->variant?->product_id,
          'product_variant_id' => $item->product_variant_id,
          'product_name' => $item->product_name,
          'variant_name' => $item->variant_name,
          'image_path' => $item->variant?->image_path,
          'product_slug' => $item->variant?->product?->slug,
        ],
      );

    return Inertia::render('user/profile/reviews', [
      'myReviews' => ReviewResource::collection($myReviews),
      'pendingReviews' => [
        'data' => $pendingReviews->items(),
        'meta' => [
          'current_page' => $pendingReviews->currentPage(),
          'last_page' => $pendingReviews->lastPage(),
          'per_page' => $pendingReviews->perPage(),
          'total' => $pendingReviews->total(),
          'from' => $pendingReviews->firstItem(),
          'to' => $pendingReviews->lastItem(),
          'links' => $pendingReviews->linkCollection()->toArray(),
        ],
      ],
      'pendingTotal' => $pendingTotal,
      'reviewFilters' => (object) $request->only(['search']),
    ]);
  }

  public function store(Request $request)
  {
    $request->validate([
      'product_id' => 'required|exists:products,id',
      'product_variant_id' => 'required|exists:product_variants,id',
      'order_item_id' => 'required|exists:order_items,id',
      'rating' => 'required|integer|min:1|max:5',
      'comment' => 'nullable|string|max:1000',
    ]);

    $user = Auth::user();

    $orderItem = $user
      ->orders()
      ->where('status', 'delivered')
      ->with('items')
      ->get()
      ->flatMap(fn($o) => $o->items)
      ->firstWhere('id', $request->order_item_id);

    if (!$orderItem) {
      return back()->withErrors(['review' => 'You can only review items from delivered orders.']);
    }

    if (Review::where('user_id', $user->id)->where('product_variant_id', $request->product_variant_id)->exists()) {
      return back()->withErrors(['review' => 'You have already reviewed this item.']);
    }

    Review::create([
      'user_id' => $user->id,
      'product_id' => $request->product_id,
      'product_variant_id' => $request->product_variant_id,
      'rating' => $request->rating,
      'comment' => $request->comment,
      'is_published' => true,
    ]);

    return back()->with('success', 'Review submitted!');
  }

  public function update(Request $request, Review $review)
  {
    if ($review->user_id !== Auth::id()) {
      abort(403);
    }

    $request->validate([
      'rating' => 'required|integer|min:1|max:5',
      'comment' => 'nullable|string|max:1000',
    ]);

    $review->update([
      'rating' => $request->rating,
      'comment' => $request->comment,
    ]);

    return back()->with('success', 'Review updated!');
  }

  public function destroy(Review $review)
  {
    if ($review->user_id !== Auth::id()) {
      abort(403);
    }

    $review->delete();

    return back()->with('success', 'Review deleted.');
  }
}
