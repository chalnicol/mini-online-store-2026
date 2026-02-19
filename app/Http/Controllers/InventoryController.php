<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Services\InventoryService;
use App\Models\ProductVariant;
use Illuminate\Http\Request;

class InventoryController extends Controller
{
    protected $inventory;

    public function __construct(InventoryService $inventory)
    {
        $this->inventory = $inventory;
    }

    public function adjust(Request $request)
    {
        $request->validate([
            'variant_id' => 'required|exists:product_variants,id',
            'quantity' => 'required|integer', // Can be negative
            'reason' => 'required|string|max:255',
            'type' => 'required|in:adjustment,in,out'
        ]);

        $this->inventory->adjustStock(
            $request->variant_id,
            $request->quantity,
            $request->type,
            $request->reason
        );

        return back()->with('success', 'Stock updated successfully.');
    }
}