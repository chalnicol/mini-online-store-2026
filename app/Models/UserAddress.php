<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class UserAddress extends Model
{
    //
    protected $fillable = [
        'user_id', 
        'type', 
        'full_address', 
        'contact_person', 
        'contact_number', 
        'is_default'
    ];

    /**
     * Modern Laravel 12 Casting
     */
    protected function casts(): array
    {
        return [
            'is_default' => 'boolean',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }


}
