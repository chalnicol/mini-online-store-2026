<?php

namespace Database\Seeders;



use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

use App\Models\User;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\Review;
use App\Models\Discount;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        
        $this->call([
            RoleAndPermissionSeeder::class, // Roles FIRST
            CategorySeeder::class, // Add this line
            UserProfileSeeder::class,
        ]);
        
        $products = Product::factory(30)->create();
        $variantFactory = ProductVariant::factory();

        foreach ($products as $product) {
            // 1. Generate the logical Variants (Name - Color/Size)
            $variantFactory->createForProduct($product);

            // Now get one of those freshly created variants for the reviews
            $variants = $product->variants;

            // 2. Add some random Reviews
            Review::factory(rand(1, 3))->create([
                'product_id' => $product->id,
                'product_variant_id' => $variants->random()->id, // Pass the variant here!
                'user_id' => rand(0, 1) 
                    ? User::where('email', 'john@example.com')->first()->id 
                    : User::factory()->create()->id,
            ]);

            // 3. Occasionally add a Discount to one of the product's variants
            if (rand(1, 10) > 7) {
                $discount = \App\Models\Discount::factory()->create();

                // Pick 1 or 2 random variants from this product to apply the discount to
                $targetVariants = $variants->random(rand(1, min(2, $variants->count())));

                foreach ($targetVariants as $variant) {
                    // This inserts into your 'discount_product_variant' table automatically
                    $variant->discounts()->attach($discount->id);
                }
            }
        }
    }
}
