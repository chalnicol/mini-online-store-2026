<?php

namespace App\Http\Controllers\Admin;

use Illuminate\Http\Request;

use App\Http\Controllers\Controller;
use App\Http\Resources\SupplierResource;

use App\Models\Supplier;

use Inertia\Inertia;

class SupplierController extends Controller
{
  //
  public function index(Request $request)
  {
    $suppliers = Supplier::query()
      // Use 'where' inside a closure if you plan to search multiple columns later
      ->when($request->search, function ($query, $search) {
        $query->where(function ($q) use ($search) {
          $q->where('name', 'like', "%{$search}%")
            ->orWhere('email', 'like', "%{$search}%")
            ->orWhere('contact_person', 'like', "%{$search}%")
            ->orWhere('contact_number', 'like', "%{$search}%");
        });
      })
      // ->latest()
      ->orderBy('updated_at', 'desc')
      ->orderBy('id', 'desc')
      ->paginate(10)
      ->withQueryString();

    return Inertia::render('admin/suppliers/index', [
      // FIXED: Do not use UserResource::collection() here for paginated data
      // Instead, pass the paginator directly; Laravel/Inertia will handle the transformation
      'suppliers' => SupplierResource::collection($suppliers),
      'filters' => (object) $request->only(['search']),
    ]);
  }

  public function create()
  {
    return Inertia::render('admin/suppliers/create');
  }

  public function edit(Supplier $supplier)
  {
    return Inertia::render('admin/suppliers/edit', [
      'supplier' => new SupplierResource($supplier),
    ]);
  }

  public function show(Supplier $supplier)
  {
    return Inertia::render('admin/suppliers/show', [
      'supplier' => new SupplierResource($supplier),
    ]);
  }

  public function store(Request $request)
  {
    $validated = $request->validate([
      'name' => 'required|string|unique:suppliers,name',
      'contact_person' => 'nullable|string|min:5|max:50',
      'contact_number' => 'nullable|string|min:5|max:50',
      'email' => 'nullable|email|unique:suppliers,email',
    ]);

    $supplier = Supplier::create($validated);

    return to_route('admin.suppliers')->with('success', 'Supplier created successfully.');
  }

  public function update(Supplier $supplier, Request $request)
  {
    $validated = $request->validate([
      'name' => 'required|string|unique:suppliers,name,' . $supplier->id,
      'contact_person' => 'nullable|string|min:5|max:50',
      'contact_number' => 'nullable|string|min:5|max:50',
      'email' => 'nullable|email|unique:suppliers,email,' . $supplier->id,
    ]);

    $supplier->update($validated);

    return to_route('admin.suppliers.show', $supplier->id)->with('success', 'Supplier updated successfully.');
  }

  public function destroy(Supplier $supplier)
  {
    $supplier->delete();

    return to_route('admin.suppliers')->with('success', 'Supplier deleted successfully.');
  }

  //
  public function search(Request $request)
  {
    $suppliers = Supplier::query()
      // Only run this if there is a search term
      ->when($request->search, function ($query, $search) {
        $query->where(function ($q) use ($search) {
          $q->where('name', 'like', "%{$search}%")
            ->orWhere('email', 'like', "%{$search}%")
            ->orWhere('contact_person', 'like', "%{$search}%")
            ->orWhere('contact_number', 'like', "%{$search}%");
          // 2. Search the parent Product's name
        });
      })
      ->limit(10) // Good for performance in a picker modal
      ->get(); // Execute the query

    return response()->json(SupplierResource::collection($suppliers));
  }
}
