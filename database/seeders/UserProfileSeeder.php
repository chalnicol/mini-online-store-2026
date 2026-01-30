<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\UserAddress;
use App\Models\UserContact;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserProfileSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Create an Admin User
        $admin = User::create([
            'fname' => 'Store',
            'lname' => 'Admin',
            'email' => 'admin@store.com',
            'password' => Hash::make('asdfasdf123'),
            'email_verified_at' => now(),
        ]);
        $admin->assignRole('admin');

        // 2. Create a Store Manager
        $manager = User::create([
            'fname' => 'Store',
            'lname' => 'Manager',
            'email' => 'manager@mystore.com',
            'password' => Hash::make('asdfasdf123'),
            'email_verified_at' => now(),
        ]);
        $manager->assignRole('manager');

        // 3. Create a Regular Customer
        $user = User::create([
            'fname' => 'John',
            'lname' => 'Doe',
            'email' => 'john@example.com',
            'password' => Hash::make('asdfasdf123'),
            'email_verified_at' => now(),
        ]);
        $user->assignRole('customer');


        // 3. Add Addresses for John Doe
        $user->addresses()->createMany([
            [
                'type' => 'Home',
                'contact_person' => $user->fname , // Defaulting to the user's name
                'contact_number' => '09171234567',
                'full_address' => '123 Main St, Brgy. 143, Manila, 1000 Metro Manila',
                'is_default' => true,
            ],
            [
                'type' => 'Office',
                'contact_person' => $user->fname,
                'contact_number' => '0288881234',
                'full_address' => '456 Business Hub, 15th Floor, Tower 1, Ayala Ave, Makati City, 1200',
                'is_default' => false,
            ],
        ]);

        // 4. Add Contacts for John Doe
        $user->contacts()->createMany([
            [
                'phone_number' => '09171234567',
                'label' => 'Personal Mobile',
                'is_primary' => true,
            ],
            [
                'phone_number' => '0288881234',
                'label' => 'Office Landline',
                'is_primary' => false,
            ],
        ]);
    }
}