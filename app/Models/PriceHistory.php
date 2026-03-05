<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PriceHistory extends Model
{
  // Important: Specify the table if it's not the plural of the class name
  protected $table = 'price_history';

  protected $fillable = ['product_variant_id', 'old_price', 'new_price', 'margin_at_time', 'reason'];

  /**
   * The variant this price change belongs to.
   */
  public function variant(): BelongsTo
  {
    return $this->belongsTo(ProductVariant::class, 'product_variant_id');
  }

  /**
   * Accessor: Calculate the percentage change between prices.
   * Helpful for displaying in your React charts.
   */
  public function getPercentageChangeAttribute(): float
  {
    if ($this->old_price <= 0) {
      return 0;
    }

    return (($this->new_price - $this->old_price) / $this->old_price) * 100;
  }
}
