<?php

namespace Database\Factories;

use App\Models\Discount;
use Illuminate\Database\Eloquent\Factories\Factory;

class DiscountFactory extends Factory
{
    public function definition(): array
    {
        return [
            'code' => strtoupper($this->faker->unique()->bothify('??###')),
            'description' => $this->faker->randomElement(['Summer Sale', 'Flash Deal', 'Member Discount']),
            'type' => $this->faker->randomElement(['percentage', 'fixed']),
            'value' => $this->faker->numberBetween(5, 50),
            'start_date' => now()->subDays(5),
            'end_date' => now()->addDays(20),
        ];
    }
}