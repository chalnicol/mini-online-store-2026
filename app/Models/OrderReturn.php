<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Str;

class OrderReturn extends Model
{
  use HasFactory, SoftDeletes;

  protected $fillable = ['return_number', 'order_id', 'user_id', 'status', 'admin_note'];

  // ---- Relationships ----

  public function order(): BelongsTo
  {
    return $this->belongsTo(Order::class);
  }

  public function user(): BelongsTo
  {
    return $this->belongsTo(User::class);
  }

  public function items(): HasMany
  {
    return $this->hasMany(ReturnItem::class, 'order_return_id');
  }

  // ---- Helpers ----

  public function isPending(): bool
  {
    return $this->status === 'pending';
  }

  public function isApproved(): bool
  {
    return $this->status === 'approved';
  }

  public function isCompleted(): bool
  {
    return $this->status === 'completed';
  }

  // ✅ Auto-complete return when all items are resolved
  public function checkIfCompleted(): void
  {
    $allResolved = $this->items()->where('condition', 'pending_inspection')->doesntExist();

    if ($allResolved) {
      $this->update(['status' => 'completed']);
    }
  }

  // ---- Lifecycle Hooks ----

  protected static function booted(): void
  {
    // ✅ Auto-generate return number
    static::creating(function (OrderReturn $return) {
      do {
        $number = 'RET-' . strtoupper(Str::random(8));
      } while (static::where('return_number', $number)->exists());

      $return->return_number = $number;
    });

    // ✅ Soft delete cascade to return items
    static::deleting(function (OrderReturn $return) {
      $return->items()->each(fn($item) => $item->delete());
    });

    // ✅ Restore cascade
    static::restoring(function (OrderReturn $return) {
      $return->items()->withTrashed()->each(fn($item) => $item->restore());
    });
  }
}
