<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use App\Models\Product;
use App\Models\Review;
use App\Models\User;
/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Review>
 */
class ReviewFactory extends Factory
{
    protected $model = Review::class;

    public function definition(): array
    {
        $comments = [
            'Absolutely love this! The quality is better than expected.',
            'Decent for the price, but the shipping took a bit long.',
            'Perfect fit! I will definitely be ordering more colors.',
            'The material is a bit thinner than it looks in the photos.',
            'Great customer service and a fantastic product.',
            'Highly recommend this to anyone looking for quality.',
        ];

        
        return [
            'rating' => $this->faker->numberBetween(3, 5),
            'comment' => $this->faker->randomElement($comments),
            'user_id' => fn () => \App\Models\User::inRandomOrder()->first()?->id ?? \App\Models\User::factory(),
            
            // 1. Get a random variant first
            'product_variant_id' => function () {
                return \App\Models\ProductVariant::inRandomOrder()->first()?->id 
                    ?? \App\Models\ProductVariant::factory();
            },

            // 2. Set the product_id based on that variant
            'product_id' => function (array $attributes) {
                return \App\Models\ProductVariant::find($attributes['product_variant_id'])->product_id;
            },

            'created_at' => now(),
        ];
    }
}
