<?php
namespace Database\Factories;

use App\Models\Product;
use App\Models\ProductVariant;
use Illuminate\Database\Eloquent\Factories\Factory;

class ProductVariantFactory extends Factory
{
    protected $model = ProductVariant::class;

    public function definition(): array
    {
        return [
            'sku' => strtoupper($this->faker->unique()->bothify('??-####-####')),
            'price' => $this->faker->randomFloat(2, 20, 500),
            'stock_qty' => $this->faker->numberBetween(0, 50),
            'product_id' => Product::factory(),
            // 'name', 'size', 'color' will be overwritten by our "Generation" logic
        ];
    }

    /**
     * Create a realistic set of variants for a specific product.
     */
    public function createForProduct(Product $product)
    {
        // 1. Define possible attributes
        $sizes = ['S', 'M', 'L', 'XL'];
        $colors = ['Red', 'Blue', 'Black', 'White'];

        // 2. Decide the "Style" of variations for THIS product
        $type = $this->faker->randomElement(['size_only', 'color_only', 'both']);

        $variantsToCreate = [];

        if ($type === 'size_only') {
            foreach ($this->faker->randomElements($sizes, rand(2, 4)) as $size) {
                $variantsToCreate[] = ['size' => $size, 'color' => null];
            }
        } elseif ($type === 'color_only') {
            foreach ($this->faker->randomElements($colors, rand(2, 4)) as $color) {
                $variantsToCreate[] = ['size' => null, 'color' => $color];
            }
        } else {
            // "Both" - create a few random combinations
            $chosenSizes = $this->faker->randomElements($sizes, rand(2, 3));
            $chosenColors = $this->faker->randomElements($colors, rand(2, 3));
            
            foreach ($chosenSizes as $size) {
                foreach ($chosenColors as $color) {
                    $variantsToCreate[] = ['size' => $size, 'color' => $color];
                }
            }
        }

        // 3. Persist the variants
        foreach ($variantsToCreate as $attributes) {
            $variantName = $product->name;
            if ($attributes['color']) $variantName .= " - " . $attributes['color'];
            if ($attributes['size']) $variantName .= " (" . $attributes['size'] . ")";

            $this->create(array_merge($attributes, [
                'product_id' => $product->id,
                'name' => $variantName,
                'sku' => strtoupper(substr($product->name, 0, 2)) . $this->faker->unique()->bothify('-####-####'),
            ]));
        }
    }
}