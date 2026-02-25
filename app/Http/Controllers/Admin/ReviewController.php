<?php

namespace App\Http\Controllers\Admin;

use App\Models\Discount;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use App\Http\Resources\ReviewResource;

use App\Models\Review;

use Inertia\Inertia;

class ReviewController extends Controller
{

    public function index(Request $request)
    {
        $reviews = Review::query()
            ->with(['user', 'product', 'variant'])
            ->when($request->search, function ($query, $search) {
                $query->where(function ($q) use ($search) {
                    // 1. Search in the review text itself
                    $q->where('comments', 'like', "%{$search}%")
                    
                    // 2. Search by User First Name or Last Name
                    ->orWhereHas('user', function ($userQuery) use ($search) {
                        $userQuery->where('fname', 'like', "%{$search}%")
                                    ->orWhere('lname', 'like', "%{$search}%");
                    })
                    
                    // 3. Optional: Search by Product Name (very useful for reviews)
                    ->orWhereHas('product', function ($productQuery) use ($search) {
                        $productQuery->where('name', 'like', "%{$search}%");
                    });
                });
            })
            ->orderBy('updated_at', 'desc')
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('admin/reviews/index', [ // Fixed path from discounts to reviews
            'reviews' => ReviewResource::collection($reviews),
            'filters' => (object) $request->only(['search'])
        ]);
    }

    public function show(Review $review)
    {
        return Inertia::render('admin/reviews/show', [
            'review' => new ReviewResource($review->load(['user', 'product', 'variant']))
        ]);

    }


    public function togglePublishedStatus(Review $review)
    {
        $review->update(['is_published' => !$review->is_published]);
        
        return back();
    }


    public function destroy(Discount $discount)
    {
        // Guard: Cannot delete if variants are attached
        if ($discount->variants()->exists()) {
            return back()->withErrors([
                'delete' => 'Cannot delete discount because it is currently applied to one or more product variants.'
            ]);
        }

        $discount->delete();

        return to_route('admin.discounts.show', $discount->id)
            ->with('success', 'Discount deleted successfully.');
    }

}
