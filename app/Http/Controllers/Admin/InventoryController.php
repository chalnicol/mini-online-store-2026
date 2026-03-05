<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ProductVariant;
use App\Services\InventoryService;
use Illuminate\Http\Request;
use Inertia\Inertia;

use App\Http\Resources\InventoryMovementResource;
use App\Models\InventoryMovement;

class InventoryController extends Controller
{
  protected $inventoryService;

  public function __construct(InventoryService $inventoryService)
  {
    $this->inventoryService = $inventoryService;
  }

  public function index(Request $request)
  {
    // Added Request $request
    $inventories = InventoryMovement::query()
      ->with(['variant.product', 'supplier', 'user']) // Eager load nested product
      ->when($request->search, function ($query, $search) {
        $query->where(function ($q) use ($search) {
          // 1. Search by the Admin/User who recorded the movement
          $q->whereHas('user', function ($userQuery) use ($search) {
            $userQuery->where('fname', 'like', "%{$search}%")->orWhere('lname', 'like', "%{$search}%");
          })
            // 2. Search by Product Name (via Variant)
            ->orWhereHas('variant.product', function ($productQuery) use ($search) {
              $productQuery->where('name', 'like', "%{$search}%");
            })
            // 3. Search by Supplier Name
            ->orWhereHas('supplier', function ($supplierQuery) use ($search) {
              $supplierQuery->where('name', 'like', "%{$search}%");
            })
            // 4. Search by Reason or Type
            ->orWhere('reason', 'like', "%{$search}%")
            ->orWhere('type', 'like', "%{$search}%");
        });
      })
      ->latest() // Shorthand for orderBy('created_at', 'desc')
      ->paginate(15)
      ->withQueryString();

    return Inertia::render('admin/inventories/index', [
      'inventories' => InventoryMovementResource::collection($inventories),
      'filters' => (object) $request->only(['search']),
    ]);
  }

  public function createPurchase()
  {
    return Inertia::render('admin/inventories/create-purchase');
  }

  public function createAdjustment()
  {
    return Inertia::render('admin/inventories/create-adjustment');
  }

  public function show(InventoryMovement $inventory)
  {
    return Inertia::render('admin/inventories/show', [
      'inventory' => new InventoryMovementResource($inventory->load(['variant.product', 'supplier', 'user'])),
    ]);
  }

  public function edit(InventoryMovement $inventory)
  {
    return Inertia::render('admin/inventories/edit', [
      'inventory' => new InventoryMovementResource($inventory->load(['variant.product', 'supplier'])),
    ]);
  }

  /**
   * Display a list of variants that need price approval.
   */
  public function priceAdjustments()
  {
    $pendingApprovals = ProductVariant::whereNotNull('suggested_price')
      ->whereColumn('suggested_price', '!=', 'price')
      ->with('product') // Assuming Variant belongsTo Product
      ->get();

    return Inertia::render('Admin/Inventory/PriceAdjustments', [
      'items' => $pendingApprovals,
    ]);
  }

  /**
   * Handle the form submission for a new stock purchase.
   */
  public function storePurchase(Request $request)
  {
    $validated = $request->validate([
      'product_variant_id' => 'required|exists:product_variants,id',
      'quantity' => 'required|integer|min:1',
      'unit_cost' => 'required|numeric|min:0',
      'update_price_instantly' => 'required|boolean', // The checkbox value
      'reason' => 'nullable|string',
      'supplier_id' => 'required|exists:suppliers,id',
    ]);

    $variant = ProductVariant::findOrFail($validated['product_variant_id']);

    $this->inventoryService->recordPurchase(
      $variant,
      $validated['quantity'],
      $validated['unit_cost'],
      $validated['update_price_instantly'], // Pass the boolean here
      $validated['supplier_id'],
      $validated['reason'] ?? 'Supplier Restock',
    );

    return to_route('admin.inventories')->with('success', 'Purchase recorded successfully.');
  }

  /**
   * Approve the suggested price.
   */
  public function approvePrice(Request $request, ProductVariant $variant)
  {
    $validated = $request->validate([
      'new_price' => 'required|numeric|min:0',
    ]);

    $this->inventoryService->approvePriceChange($variant, $validated['new_price']);

    return back()->with('success', 'Price updated successfully.');
  }
}
