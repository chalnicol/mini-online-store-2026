<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class StockLog extends Model
{
    protected $fillable = ['product_variant_id', 'adjustment', 'reason', 'new_stock_level'];
}
