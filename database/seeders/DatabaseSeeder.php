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

    public function run(): void
    {
        $this->call([
            RoleAndPermissionSeeder::class, 
            CategorySeeder::class, 
            UserProfileSeeder::class,
            VoucherSeeder::class,
        ]);
        
        $products = Product::factory(30)->create();
        $variantFactory = ProductVariant::factory();

        foreach ($products as $product) {
            // Determine if this product should have only 1 variant (30% chance)
            $isSingleVariant = rand(1, 10) <= 3;

            if ($isSingleVariant) {
                // Create exactly ONE variant
                $variantFactory->create([
                    'product_id' => $product->id,
                    'name' => 'Standard',
                    'attributes' => [], // Empty array instead of color/size
                    'sku' => 'STD-' . strtoupper($product->id) . '-' . rand(1000, 9999),
                ]);
            } else {
                // Create multiple logical variants via the factory's custom method
                $variantFactory->createForProduct($product);
            }

            // Refresh variants collection
            $variants = $product->variants()->get();

            // Add some random Reviews
            Review::factory(rand(1, 3))->create([
                'product_id' => $product->id,
                'product_variant_id' => $variants->random()->id,
                'user_id' => rand(0, 1) 
                    ? User::where('email', 'john@example.com')->first()->id 
                    : User::factory()->create()->id,
            ]);

            // Occasionally add a Discount
            if (rand(1, 10) > 7) {
                // $discount = Discount::factory()->create();

                // // Pick random variants to apply discount
                // $countToSelect = rand(1, min(2, $variants->count()));
                // $targetVariants = $variants->random($countToSelect);

                // // Ensure we have a collection to loop over
                // $targetVariants = ($targetVariants instanceof ProductVariant) 
                //     ? collect([$targetVariants]) 
                //     : $targetVariants;

                // foreach ($targetVariants as $variant) {
                //     $variant->discounts()->attach($discount->id);
                // }
                
                // 1. Create the discount
                $discount = Discount::factory()->create();

                // 2. Apply it to ALL variants of the current product
                // We use the ID because attach() is highly efficient with arrays
                $variantIds = $variants->pluck('id')->toArray();

                // 3. Use attach() with the array of IDs
                // This creates the link in the pivot table for every variant at once
                $discount->variants()->attach($variantIds);
            }
        }
    }
}