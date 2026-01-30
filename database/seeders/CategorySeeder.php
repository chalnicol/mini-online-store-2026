<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

use App\Models\Category;

class CategorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */

     protected $categories = [
        'Food & Beverages' => [
            'Fruits & Vegetables' => [
                'Fresh Fruits',
                'Fresh Vegetables',
            ],
            'Meat & Seafood' => [
                'Fresh Meat',
                'Frozen Seafood',
                'Processed Meats',
            ],
            'Dairy Products' => [
                'Milk & Cream',
                'Cheese',
                'Yogurt',
            ],
            'Bakery' => [
                'Breads',
                'Pastries',
                'Cakes',
            ],
            'Snacks' => [
                'Chips & Crisps',
                'Nuts',
                'Candy & Sweets',
            ],
            'Condiments & Sauces' => [
                'Spices & Seasonings',
                'Sauces & Dressings',
            ],
            'Frozen Foods' => [
                'Frozen Vegetables',
                'Frozen Meals',
            ],
            'Deli' => [
                'Cold Cuts',
                'Cheese Varieties',
                'Ready-to-Eat Meals',
            ],
            'Non-Alcoholic Beverages' => [
                'Soft Drinks',
                'Juices',
                'Water',
                'Coffee & Tea',
            ],
            'Alcoholic Beverages' => [
                'Beer',
                'Wine',
                'Spirits (Liquors)' => [
                    'Vodka',
                    'Whiskey',
                    'Rum',
                    'Liqueurs',
                ],
                'Cocktails & Mixers',
            ],
        ],
        'Electronics' => [
            'Mobile Phones & Accessories' => [
                'Smartphones',
                'Phone Cases',
                'Chargers & Cables',
            ],
            'Computers & Laptops' => [
                'Desktops',
                'Laptops',
                'Computer Accessories',
            ],
            'Audio & Headphones' => [
                'Speakers',
                'Earphones',
                'Headphones',
            ],
            'Cameras & Photography' => [
                'Digital Cameras',
                'Lenses',
                'Camera Accessories',
                'Wearable Technology' => [
                    'Smartwatches',
                    'Fitness Trackers',
                ],
            ],
        ],
        'Home & Garden' => [
            'Furniture' => [
                'Living Room',
                'Bedroom',
                'Office',
            ],
            'Home Decor' => [
                'Wall Art',
                'Rugs',
                'Lighting',
            ],
            'Garden Supplies' => [
                'Plants',
                'Tools',
            ],
            'Outdoor Furniture',
            'Kitchenware' => [
                'Cookware',
                'Tableware',
                'Storage Solutions',
            ],
            'Cleaning Products' => [
                'Detergents',
                'Soaps',
                'Dishwashing',
                'Floor Cleaners',
                'Disinfectants',
            ],
        ],
        'Health & Beauty' => [
            'Skincare' => [
                'Cleansers',
                'Moisturizers',
                'Sunscreen',
            ],
            'Makeup' => [
                'Face',
                'Eyes',
                'Lips',
            ],
            'Personal Care' => [
                'Hair Care',
                'Oral Care',
                'Fragrances',
            ],
            'Personal Care & Hygiene' => [
                'Toiletries',
                'Feminine Care',
                'Health Supplements',
                'Shaving & Grooming',
            ],
        ],
        'Apparel' => [
            'Men\'s Clothing' => [
                'T-Shirts',
                'Jeans',
                'Outerwear',
            ],
            'Women\'s Clothing' => [
                'Dresses',
                'Tops',
                'Skirts',
            ],
            'Children\'s Clothing' => [
                'Boys',
                'Girls',
            ],
            'Apparel Accessories' => [
                'Bags',
                'Jewelry',
                'Sunglasses',
            ],
        ],
        'Baby & Kids' => [
            'Baby Essentials' => [
                'Diapers',
                'Wipes',
            ],
            'Baby Clothing' => [
                'Onesies',
                'Socks & Hats',
            ],
            'Toys & Games',
            'Baby Feeding' => [
                'Bottles',
                'Nursing Accessories',
            ],
        ],
        'Pet Supplies' => [
            'Pet Food',
            'Pet Toys & Accessories',
            'Pet Grooming',
            'Pet Health',
        ],
        'Books & Stationery' => [
            'Books' => [
                'Fiction',
                'Non-fiction',
            ],
            'School Supplies',
            'Journals & Notebooks',
        ],
        'Sports & Outdoors' => [
            'Exercise Equipment',
            'Sports Apparel',
            'Outdoor Gear',
            'Cycling',
        ],
        'Automotive & Tools' => [
            'Car Accessories',
            'Car Care',
            'Tools & Hardware',
        ],
        'Office Supplies & Furniture' => [
            'Office Furniture',
            'Office Supplies',
            'Home Office Décor',
        ],
        'Gift & Novelties' => [
            'Gift Cards',
            'Party Supplies',
            'Novelty Items',
        ],
    ];
    
    

    public function run()
    {
        $this->createCategories($this->categories);
    }

    protected function createCategories(array $categories, $parentId = null)
    {
        foreach ($categories as $key => $subcategories) {
            // Check if $subcategories is an array (indicating a category)
            if (is_array($subcategories)) {
                // Create the category
                $category = Category::create([
                    'name' => $key, // Use the key as the category name
                    'slug' => Str::slug($key), // Generate a slug from the key
                    'parent_id' => $parentId, // Use parent ID if provided
                    'active' => true
                ]);

                // Recursively call the function for subcategories
                $this->createCategories($subcategories, $category->id);
            } else {
                // If it's not an array, treat it as a subcategory
                Category::create([
                    'name' => $subcategories, // Use the subcategory name directly
                    'slug' => Str::slug($subcategories), // Generate slug from subcategory name
                    'parent_id' => $parentId, // Use parent ID if provided
                    'active' => true
                ]);
            }
        }
    }

    // public function run(): void
    // {
    //     //
    //     // Category::factory()->count(100)->create();

    //     $categories = [

    //         [ 'category' => [

    //         ]]
    //         'Health & Beauty', 
    //         'Electronics',
    //         'Home & Garden',
    //         'Food & Beverages', 
    //         'Clothing',
    //         'Uncategorized'
    //     ];

    //     foreach ($categories as $category) {
    //         Category::create([
    //             'name' => $category,
    //             'slug' => Str::slug($category),
    //             'created_at' => now(),
    //             'updated_at' => now(),
    //         ]);
    //     }

       
    // }
}


