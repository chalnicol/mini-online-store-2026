<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;       // Correct Import
use Spatie\Permission\Models\Permission; //


class RoleAndPermissionSeeder extends Seeder
{
    public function run()
    {
        // app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

        // 1. Create Permissions
        Permission::create(['name' => 'manage categories']);
        Permission::create(['name' => 'manage products']);
        Permission::create(['name' => 'view orders']);

        // 2. Create Roles and Assign Permissions
        $admin = Role::create(['name' => 'admin']);
        $admin->givePermissionTo(Permission::all());

        $manager = Role::create(['name' => 'manager']);
        $manager->givePermissionTo(['manage products', 'view orders']);

        $customer = Role::create(['name' => 'customer']);
        // Customers usually don't need specific permissions, just the role
    }
}