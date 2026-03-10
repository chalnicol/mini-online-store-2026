<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

use App\Models\Supplier;

class SupplierSeeder extends Seeder
{
  /**
   * Run the database seeds.
   */
  protected $suppliers = [
    [
      'name' => 'Eribor Trading Inc',
      'contact_person' => 'John Doe',
      'contact_number' => '123-456-7890',
      'email' => 'john.doe@eribortradinginc.com',
    ],
    [
      'name' => 'Global Tech Solutions',
      'contact_person' => 'Jane Smith',
      'contact_number' => '987-654-3210',
      'email' => 'jane.smith@globaltech.com',
    ],
    [
      'name' => 'Fresh Harvest Co.',
      'contact_person' => 'Michael Chen',
      'contact_number' => '555-0199-2233',
      'email' => 'm.chen@freshharvest.com',
    ],
    [
      'name' => 'Urban Style Wholesale',
      'contact_person' => 'Sarah Wilson',
      'contact_number' => '444-555-6666',
      'email' => 's.wilson@urbanstyle.com',
    ],
  ];

  public function run()
  {
    foreach ($this->suppliers as $supplier) {
      Supplier::create($supplier);
    }
  }
}
