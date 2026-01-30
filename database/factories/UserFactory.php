<?php

namespace Database\Factories;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class UserFactory extends Factory
{
    protected static ?string $password;

    public function definition(): array
    {
        return [
            'fname' => fake()->firstName(),
            'lname' => fake()->lastName(),
            'email' => fake()->unique()->safeEmail(),
            'email_verified_at' => now(),
            'password' => static::$password ??= Hash::make('password'),
            'remember_token' => Str::random(10),
            // Removed 2FA fields as they are not being used yet
        ];
    }

    /**
     * Automatically create related profile data for the user.
     */
    public function configure(): static
    {
        return $this->afterCreating(function (User $user) {
            // Create a default address
            $user->addresses()->create([
                'type' => 'Home',
                'contact_person' => $user->fname . ' ' . $user->lname,
                'contact_number' => fake()->phoneNumber(),
                'full_address' => fake()->address(),
                'is_default' => true,
            ]);

            // Create a primary contact
            $user->contacts()->create([
                'phone_number' => fake()->phoneNumber(),
                'label' => 'Mobile',
                'is_primary' => true,
            ]);
        });
    }

    public function unverified(): static
    {
        return $this->state(fn (array $attributes) => [
            'email_verified_at' => null,
        ]);
    }
}