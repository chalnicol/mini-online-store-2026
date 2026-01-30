<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PurchaseLog extends Model
{
    protected $fillable = ['product_variant_id', 'supplier_name', 'quantity', 'unit_cost', 'total_cost', 'purchased_at'];
}

