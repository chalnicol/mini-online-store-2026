<?php
namespace Database\Factories;

use App\Models\Product;
use App\Models\ProductVariant;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

class ProductVariantFactory extends Factory
{
  protected $model = ProductVariant::class;

  public function definition(): array
  {
    $retailPrice = $this->faker->randomFloat(2, 20, 500);
    // Backward calculate the cost so your math logic doesn't break
    // If Retail is 130, Avg Cost is 100.
    $cost = round($retailPrice / 1.3, 2);

    return [
      'sku' => strtoupper($this->faker->unique()->bothify('??-####-####')),
      'price' => $retailPrice,
      'avg_unit_cost' => $cost, // INITIALIZE THIS
      'suggested_price' => null,
      'stock_qty' => $this->faker->numberBetween(10, 50), // Don't start at 0 for testing
      'product_id' => Product::factory(),
      'attributes' => [],
      'name' => 'Standard',
      'is_active' => true,
    ];
  }

  public function createForProduct(Product $product)
  {
    $sizes = ['S', 'M', 'L', 'XL'];
    $colors = ['Red', 'Blue', 'Black', 'White'];
    $materials = ['Leather', 'Canvas', 'Cotton'];

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
      $sList = $this->faker->randomElements($sizes, 2);
      $cList = $this->faker->randomElements($colors, 2);
      foreach ($sList as $s) {
        foreach ($cList as $c) {
          $combinations[] = ['Size' => $s, 'Color' => $c];
        }
      }
    }

    foreach ($combinations as $attr) {
      $variantName = implode(' / ', array_values($attr));

      // Clean prefix for SKU
      $prefix = Str::upper(Str::limit(preg_replace('/[^A-Za-z0-9]/', '', $product->name), 3, ''));

      $this->create([
        'product_id' => $product->id,
        'name' => $variantName,
        'attributes' => $attr,
        'sku' => $prefix . $this->faker->unique()->bothify('-####-####'),
      ]);
    }
  }
}
