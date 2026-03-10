<?php

namespace App\Models;

use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes; // ✅ added
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Fortify\TwoFactorAuthenticatable;
use Spatie\Permission\Traits\HasRoles;
use Spatie\Permission\Traits\HasPermissions;

use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

use App\Models\UserAddress;
use App\Models\UserContact;
use App\Notifications\VerifyEmailNotification;
use App\Notifications\PasswordResetRequestNotification;
use Illuminate\Notifications\DatabaseNotification;
use Illuminate\Database\Eloquent\Relations\MorphMany;

class User extends Authenticatable implements MustVerifyEmail
{
  use HasRoles, SoftDeletes, HasPermissions, HasFactory, Notifiable, TwoFactorAuthenticatable;

  protected $fillable = [
    'fname',
    'lname',
    'email',
    'password',
    'email_verified_at',
    'email_verification_token',
    'email_verification_token_expires_at',
    'is_blocked',
  ];

  protected $hidden = ['password', 'two_factor_secret', 'two_factor_recovery_codes', 'remember_token'];

  protected function casts(): array
  {
    return [
      'email_verified_at' => 'datetime',
      'password' => 'hashed',
      'two_factor_confirmed_at' => 'datetime',
      'email_verification_token_expires_at' => 'datetime',
      'is_blocked' => 'boolean',
    ];
  }

  protected $appends = ['cart_item_count'];

  public function sendPasswordResetNotification($token)
  {
    $this->notify(new PasswordResetRequestNotification($token));
  }

  public function sendEmailVerificationNotification()
  {
    $this->notify(new VerifyEmailNotification());
  }

  public function hasVerifiedEmail(): bool
  {
    return !is_null($this->email_verified_at);
  }

  public function isBlocked(): bool
  {
    return (bool) $this->is_blocked;
  }

  // ---- Relationships ----

  public function orders(): HasMany
  {
    return $this->hasMany(Order::class);
  }

  public function addresses(): HasMany
  {
    return $this->hasMany(UserAddress::class);
  }

  public function contacts(): HasMany
  {
    return $this->hasMany(UserContact::class);
  }

  public function cartItems(): HasMany
  {
    return $this->hasMany(CartItem::class);
  }

  public function reviews(): HasMany
  {
    // ✅ added
    // ✅ added
    return $this->hasMany(Review::class);
  }

  public function vouchers(): BelongsToMany
  {
    return $this->belongsToMany(Voucher::class, 'user_voucher')->withPivot('used_at')->withTimestamps();
  }

  // ---- Accessors ----

  public function getFullNameAttribute(): string
  {
    return "{$this->fname} {$this->lname}";
  }

  public function getCartItemCountAttribute(): int
  {
    return (int) $this->cartItems()->sum('quantity');
  }

  // ---- Lifecycle Hooks ----

  protected static function booted(): void
  {
    static::deleting(function (User $user) {
      // 🗑️ Hard delete ephemeral data
      $user->cartItems()->delete();
      $user->notifications()->delete();
      $user->addresses()->delete(); // ✅ clean up addresses
      $user->contacts()->delete(); // ✅ clean up contacts

      // 🔒 Anonymize reviews — preserve ratings/comments but remove identity
      $user->reviews()->update(['user_id' => null]);

      // ✅ Orders & returns are preserved as-is for financial records
    });
  }
}
