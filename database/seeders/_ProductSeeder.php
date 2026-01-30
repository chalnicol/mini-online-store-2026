<?php

namespace Database\Seeders;

use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\Category;
use App\Models\User;
use App\Models\Review;
use App\Models\Discount;

use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class ProductSeeder extends Seeder
{
    public function run(): void
    {

        // Find the first available leaf category
        $category = Category::doesntHave('children')->first();

        if (!$category) {
            // Fallback: Create a specific leaf if none exist
            $parent = Category::firstOrCreate(['name' => 'Electronics', 'slug' => 'electronics']);
            $category = Category::create([
                'name' => 'Smartphones', 
                'slug' => 'smartphones', 
                'parent_id' => $parent->id
            ]);
        }

        $customer = User::role('customer')->first();



        // 1. Product with NO variants (Default 1 Variant)
        $p1 = Product::create([
            'category_id' => $category->id,
            'name' => 'Standard Coffee Mug',
            'slug' => Str::slug('Standard Coffee Mug'),
            'description' => 'A simple, high-quality ceramic mug.',
        ]);
        ProductVariant::create([
            'product_id' => $p1->id,
            'sku' => 'MUG-001',
            'name' => 'Standard Coffee Mug', // Name matches parent
            'price' => 15.00,
            'stock_qty' => 50,
        ]);

        // 2. Product with 2 Variants (e.g., Simple choice)
        $p2 = Product::create([
            'category_id' => $category->id,
            'name' => 'Minimalist Wallet',
            'slug' => Str::slug('Minimalist Wallet'),
            'description' => 'Genuine leather slim wallet.',
        ]);
        ProductVariant::create([
            'product_id' => $p2->id,
            'sku' => 'WLT-BLK',
            'name' => 'Minimalist Wallet - Black',
            'color' => 'Black',
            'price' => 45.00,
            'stock_qty' => 20,
        ]);
        ProductVariant::create([
            'product_id' => $p2->id,
            'sku' => 'WLT-BRW',
            'name' => 'Minimalist Wallet - Brown',
            'color' => 'Brown',
            'price' => 45.00,
            'stock_qty' => 15,
        ]);

        // 3. Product with Multiple Variants (Varying Sizes & Colors)
        $p3 = Product::create([
            'category_id' => $category->id,
            'name' => 'Premium Cotton T-Shirt',
            'slug' => Str::slug('Premium Cotton T-Shirt'),
            'description' => 'Breathable cotton tee in various styles.',
        ]);
        
        $colors = ['White', 'Navy'];
        $sizes = ['S', 'M', 'L'];

        foreach ($colors as $color) {
            foreach ($sizes as $size) {
                ProductVariant::create([
                    'product_id' => $p3->id,
                    'sku' => "TEE-".strtoupper($color)."-".$size,
                    'name' => "Premium Cotton T-Shirt - $color ($size)",
                    'color' => $color,
                    'size' => $size,
                    'price' => $size === 'L' ? 25.00 : 22.00, // Price varies by size
                    'stock_qty' => rand(10, 100),
                    'image_path' => "products/tee-".strtolower($color).".jpg"
                ]);
            }
        }

        // 4. Another Single-Variant Product (Special Edition)
        $p4 = Product::create([
            'category_id' => $category->id,
            'name' => 'Limited Edition Fountain Pen',
            'slug' => Str::slug('Limited Edition Fountain Pen'),
        ]);
        ProductVariant::create([
            'product_id' => $p4->id,
            'sku' => 'PEN-LTD-01',
            'name' => 'Fountain Pen Gold-Plated',
            'price' => 250.00,
            'stock_qty' => 5,
        ]);

        // 5. Product with 2 Variants (Different Sizes)
        $p5 = Product::create([
            'category_id' => $category->id,
            'name' => 'Stainless Steel Water Bottle',
            'slug' => Str::slug('Stainless Steel Water Bottle'),
        ]);
        ProductVariant::create(['product_id' => $p5->id, 'sku' => 'BTL-500', 'name' => 'Bottle 500ml', 'size' => '500ml', 'price' => 20.00, 'stock_qty' => 40]);
        ProductVariant::create(['product_id' => $p5->id, 'sku' => 'BTL-1000', 'name' => 'Bottle 1L', 'size' => '1L', 'price' => 30.00, 'stock_qty' => 30]);
    
        // 6. Product with DISCOUNTS (e.g., Flash Sale Item)
        $p6 = Product::create([
            'category_id' => $category->id,
            'name' => 'Noise Cancelling Headphones',
            'slug' => Str::slug('Noise Cancelling Headphones'),
            'description' => 'Premium sound quality with active noise cancellation.',
        ]);

        $v6 = ProductVariant::create([
            'product_id' => $p6->id,
            'sku' => 'HP-NC-01',
            'name' => 'Headphones - Matte Black',
            'color' => 'Black',
            'price' => 200.00,
            'stock_qty' => 15,
        ]);

        // Create a 25% Discount for this variant
        $discount = Discount::create([
            'code' => 'FLASH25',
            'description' => '25% Off Flash Sale',
            'type' => 'percentage',
            'value' => 25,
            'start_date' => now()->subDay(),
            'end_date' => now()->addDays(7),
            'is_active' => true,
        ]);

        $v6->discounts()->attach($discount->id);


        // 7. Product with REVIEWS (Top Rated Item)
        $p7 = Product::create([
            'category_id' => $category->id,
            'name' => 'Mechanical Keyboard K1',
            'slug' => Str::slug('Mechanical Keyboard K1'),
            'description' => 'RGB Backlit mechanical keyboard with blue switches.',
        ]);

        $v7 = ProductVariant::create([
            'product_id' => $p7->id,
            'sku' => 'KB-RGB-01',
            'name' => 'Keyboard K1 - Silver',
            'price' => 120.00,
            'stock_qty' => 30,
        ]);

        // Add Manual Reviews (This triggers the average_rating update in Product model)
        Review::create([
            'product_id' => $p7->id,
            'product_variant_id' => $v7->id,
            'user_id' => $customer->id,
            'rating' => 5,
            'comment' => 'Best keyboard I have ever used! The clicks are so satisfying.'
        ]);

        Review::create([
            'product_id' => $p7->id,
            'product_variant_id' => $v7->id,
            'user_id' => $customer->id,
            'rating' => 4,
            'comment' => 'Great build quality, but the software is a bit tricky.'
        ]);
    
    }
}
