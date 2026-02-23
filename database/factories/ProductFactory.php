<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use App\Models\Category;
use App\Models\Product;
use Illuminate\Support\Str;
/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Product>
 */
class ProductFactory extends Factory
{
    protected $model = Product::class;
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        // Unique name + number for variety
        $name = $this->faker->unique()->word . ' ' . $this->faker->randomNumber(3);

        return [
            'name' => ucfirst($name),
            'slug' => Str::slug($name),
            'description' => $this->faker->paragraph(),
            'category_id' => function () {
                $leafIds = Category::doesntHave('children')->pluck('id');

                if ($leafIds->isEmpty()) {
                    throw new \Exception("No leaf categories found! Please seed categories before products.");
                }

                return $leafIds->random();
            },
            'average_rating' => $this->faker->randomFloat(1, 1, 5),
            'is_published' => true,
            'created_at' => now(),
            'updated_at' => now(),
        ];
    }
}
