<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\PriceHistory;
use App\Http\Resources\PriceHistoryResource;
use Inertia\Inertia;

class PriceHistoryController extends Controller
{
  //
  public function index(Request $request)
  {
    $priceHistory = PriceHistory::query()
      ->with(['variant.product', 'user']) // Eager load the user too if you display who changed the price
      ->when($request->search, function ($query, $search) {
        $query->whereHas('variant.product', function ($q) use ($search) {
          $q->where('name', 'like', "%{$search}%");
        });
      })
      ->orderByDesc('updated_at')
      ->orderByDesc('id')
      ->paginate(10)
      ->withQueryString();

    return Inertia::render('admin/price-history/index', [
      'priceHistory' => PriceHistoryResource::collection($priceHistory),
      'filters' => (object) $request->only(['search']),
    ]);
  }

  public function show(PriceHistory $priceHistory)
  {
    return Inertia::render('admin/price-history/show', [
      'priceHistory' => new PriceHistoryResource($priceHistory),
    ]);
  }
}
