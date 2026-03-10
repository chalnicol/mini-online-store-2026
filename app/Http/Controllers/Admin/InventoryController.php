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
    //can be edited if 10 days since creation
    $canBeEdited = $inventory->created_at->diffInDays(now()) <= 10;

    return Inertia::render('admin/inventories/show', [
      'inventory' => new InventoryMovementResource($inventory->load(['variant.product', 'supplier', 'user'])),
      'canBeEdited' => $canBeEdited,
    ]);
  }

  public function updateSupplier(Request $request, InventoryMovement $inventory)
  {
    // 1. Implementation of the Date Guard
    if ($inventory->created_at->diffInDays(now()) > 10) {
      return back()->withErrors('supplier_id', 'This movement cannot be edited as it is older than 10 days.');
    }

    // 2. Validation
    $validated = $request->validate([
      'supplier_id' => 'required|exists:suppliers,id',
    ]);

    // 3. Update
    $inventory->update([
      'supplier_id' => $validated['supplier_id'],
    ]);

    return back()->with('success', 'Supplier updated successfully.');
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

  public function storePurchase(Request $request)
  {
    $validated = $request->validate([
      'product_variant_id' => 'required|exists:product_variants,id',
      'quantity' => 'required|integer|min:1',
      'unit_cost' => 'required|numeric|min:0',
      'update_price_instantly' => 'required|boolean',
      'supplier_id' => 'required|exists:suppliers,id',
      'reason' => 'nullable|string',
    ]);

    $variant = ProductVariant::findOrFail($validated['product_variant_id']);

    $this->inventoryService->recordPurchase(
      $variant,
      $validated['quantity'],
      $validated['unit_cost'],
      $validated['update_price_instantly'],
      $validated['supplier_id'],
      $validated['reason'] ?? 'Supplier Restock',
    );

    return to_route('admin.inventories')->with('success', 'Purchase recorded successfully.');
  }

  public function storeAdjustment(Request $request)
  {
    $validated = $request->validate([
      'product_variant_id' => 'required|exists:product_variants,id',
      'amount' => 'required|integer|min:1',
      'status' => 'required|in:available,damaged,quarantine',
      'type' => 'required|in:increment,decrement',
      'reason' => 'required|string',
    ]);

    // Convert amount to a signed quantity based on type
    $finalQuantity = $validated['type'] === 'decrement' ? -$validated['amount'] : $validated['amount'];

    $variant = ProductVariant::findOrFail($validated['product_variant_id']);

    $this->inventoryService->recordAdjustment($variant, $finalQuantity, $validated['status'], $validated['reason']);

    return to_route('admin.inventories')->with('success', 'Adjustment recorded.');
  }

  public function storePurchaseReturn(Request $request)
  {
    $validated = $request->validate([
      'inventory_id' => 'required|exists:inventory_movements,id',
      'quantity' => 'required|integer|min:1',
    ]);

    $inventory = InventoryMovement::findOrFail($validated['inventory_id']);

    $this->inventoryService->recordPurchaseReturn($inventory, $validated['quantity']);

    return to_route('admin.inventories')->with('success', 'Purchase return recorded successfully.');
  }

  public function approvePrice(Request $request, ProductVariant $variant)
  {
    $validated = $request->validate([
      'new_price' => 'required|numeric|min:0',
    ]);

    $this->inventoryService->approvePriceChange($variant, $validated['new_price']);

    return back()->with('success', 'Price updated successfully.');
  }

  public function dismissPrice(ProductVariant $variant)
  {
    $variant->update(['suggested_price' => null]);
    return back()->with('info', 'Price suggestion dismissed.');
  }
}
