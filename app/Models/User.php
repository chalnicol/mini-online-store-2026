<?php

namespace App\Models;

use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
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


class User extends Authenticatable implements MustVerifyEmail
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasRoles, HasPermissions, HasFactory, Notifiable, TwoFactorAuthenticatable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
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

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'two_factor_secret',
        'two_factor_recovery_codes',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
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
        // This triggers your custom notification instead of the default one
        $this->notify(new PasswordResetRequestNotification($token));
    }

   public function sendEmailVerificationNotification()
    {
        $this->notify(new VerifyEmailNotification);
    }

    public function hasVerifiedEmail(): bool
    {
        // return (bool) ($this->email_verified_at !== null);
        return !is_null($this->email_verified_at);
    }


    public function isBlocked(): bool
    {
        return (bool) $this->is_blocked;
    }


    /**
     * A user can have many addresses (Home, Work, etc.)
     */
    public function addresses(): HasMany
    {
        return $this->hasMany(UserAddress::class);
    }

    /**
     * A user can have many contact numbers.
     */
    public function contacts(): HasMany
    {
        return $this->hasMany(UserContact::class);
    }

    /**
     * Get the user's full name.
     * Usage: $user->full_name
     */
    public function getFullNameAttribute(): string
    {
        return "{$this->fname} {$this->lname}";
    }

    /**
     * Get all of the cart items for the user.
     */
    public function cartItems(): HasMany
    {
        return $this->hasMany(CartItem::class);
    }

    /**
     * Accessor for cart_item_count.
     * Usage: $user->cart_item_count
     */
    public function getCartItemCountAttribute(): int
    {
        // sum('quantity') gives you the total items (e.g., 2 shirts + 1 hat = 3)
        // count() gives you total unique rows (e.g., 2 shirts + 1 hat = 2)
        return (int) $this->cartItems()->sum('quantity');
    }

    /**
     * Get the vouchers assigned specifically to this user.
     */
    public function vouchers(): BelongsToMany
    {
        return $this->belongsToMany(Voucher::class, 'user_voucher')
                    ->withPivot('used_at')
                    ->withTimestamps();
    }

}
