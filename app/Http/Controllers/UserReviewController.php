<?php

namespace App\Http\Controllers;

use App\Models\Review;
use App\Http\Resources\ReviewResource;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class UserReviewController extends Controller
{
  public function index(Request $request)
  {
    $user = Auth::user();

    $reviewsQuery = Review::where('user_id', $user->id)->with(['product', 'variant']);

    if ($request->filled('search')) {
      $reviewsQuery->whereHas('product', fn($q) => $q->where('name', 'like', "%{$request->search}%"));
    }

    $myReviews = $reviewsQuery->latest()->paginate(5)->withQueryString();

    $pendingReviews = $user
      ->orders()
      ->where('status', 'delivered')
      ->with([
        'items' => fn($q) => $q
          ->whereNotNull('product_variant_id')
          ->whereDoesntHave('variant.reviews', fn($q) => $q->where('user_id', $user->id))
          ->with(['variant', 'variant.product']),
      ])
      ->get()
      ->flatMap(
        fn($order) => $order->items->map(
          fn($item) => [
            'order_id' => $order->id,
            'order_number' => $order->order_number,
            'order_item_id' => $item->id,
            'product_id' => $item->variant?->product_id,
            'product_variant_id' => $item->product_variant_id,
            'product_name' => $item->product_name,
            'variant_name' => $item->variant_name,
            'image_path' => $item->variant?->image_path,
            'product_slug' => $item->variant?->product?->slug,
          ],
        ),
      )
      ->values();

    return Inertia::render('user/profile/reviews', [
      'myReviews' => ReviewResource::collection($myReviews),
      'pendingReviews' => $pendingReviews,
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
