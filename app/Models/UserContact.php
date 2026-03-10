<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;

class UserContact extends Model
{
  use HasFactory, SoftDeletes;

  protected $fillable = ['user_id', 'phone_number', 'label', 'is_primary'];

  protected function casts(): array
  {
    return [
      'is_primary' => 'boolean',
    ];
  }

  // ---- Relationships ----

  public function user(): BelongsTo
  {
    return $this->belongsTo(User::class);
  }

  // ---- Scopes ----

  public function scopePrimary($query)
  {
    return $query->where('is_primary', true); // ✅ Usage: UserContact::primary()->first()
  }

  // ---- Lifecycle Hooks ----

  protected static function booted(): void
  {
    // ✅ When primary contact is deleted, promote another to primary
    static::deleted(function (UserContact $contact) {
      if ($contact->is_primary) {
        $next = static::where('user_id', $contact->user_id)->whereNull('deleted_at')->first();

        if ($next) {
          $next->update(['is_primary' => true]);
        }
      }
    });

    // ✅ When restored, only re-promote if user has no primary contact
    static::restored(function (UserContact $contact) {
      $hasPrimary = static::where('user_id', $contact->user_id)->where('is_primary', true)->exists();

      if (!$hasPrimary) {
        $contact->update(['is_primary' => true]);
      }
    });
  }
}
