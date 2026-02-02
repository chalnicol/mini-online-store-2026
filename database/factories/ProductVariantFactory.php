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
            'compare_at_price' => $this->faker->optional(0.3)->randomFloat(2, 501, 700), // 30% chance of a "sale"
            'stock_qty' => $this->faker->numberBetween(0, 50),
            'product_id' => Product::factory(),
            'attributes' => [], // Default to empty array
            'name' => 'Standard',
            'is_active' => true,
        ];
    }

    public function createForProduct(Product $product)
    {
        $sizes = ['S', 'M', 'L', 'XL'];
        $colors = ['Red', 'Blue', 'Black', 'White'];
        $materials = ['Leather', 'Canvas', 'Cotton'];

        // Randomly decide what attributes this product actually uses
        $type = $this->faker->randomElement(['size_color', 'material_only', 'size_only']);

        $combinations = [];

        if ($type === 'size_only') {
            foreach ($this->faker->randomElements($sizes, rand(2, 3)) as $s) {
                $combinations[] = ['Size' => $s];
            }
        } elseif ($type === 'material_only') {
            foreach ($this->faker->randomElements($materials, rand(2, 3)) as $m) {
                $combinations[] = ['Material' => $m];
            }
        } else {
            // Mix of Size and Color
            $sList = $this->faker->randomElements($sizes, rand(2, 2));
            $cList = $this->faker->randomElements($colors, rand(2, 2));
            foreach ($sList as $s) {
                foreach ($cList as $c) {
                    $combinations[] = ['Size' => $s, 'Color' => $c];
                }
            }
        }

        foreach ($combinations as $attr) {
            // Generate Name from the attribute values (e.g., "L / Blue")
            $variantName = implode(' / ', array_values($attr));

            $this->create([
                'product_id' => $product->id,
                'name' => $variantName,
                'attributes' => $attr, // This will be cast to JSON automatically
                'sku' => strtoupper(substr(preg_replace('/[^A-Za-z]/', '', $product->name), 0, 3)) 
                         . $this->faker->unique()->bothify('-####-####'),
            ]);
        }
    }
}