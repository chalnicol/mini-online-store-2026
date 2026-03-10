<?php

namespace Database\Seeders;

use App\Models\ServiceableArea;
use Illuminate\Database\Seeder;

class ServiceableAreaSeeder extends Seeder
{
  public function run(): void
  {
    $areas = [
      ['barangay' => 'Brgy. Holy Spirit', 'city' => 'Quezon City', 'province' => 'Metro Manila', 'is_active' => true],
      ['barangay' => 'Brgy. Batasan Hills', 'city' => 'Quezon City', 'province' => 'Metro Manila', 'is_active' => true],
      ['barangay' => 'Brgy. Commonwealth', 'city' => 'Quezon City', 'province' => 'Metro Manila', 'is_active' => true],
      ['barangay' => 'Brgy. Payatas', 'city' => 'Quezon City', 'province' => 'Metro Manila', 'is_active' => false],
    ];

    foreach ($areas as $area) {
      ServiceableArea::create($area);
    }
  }
}
