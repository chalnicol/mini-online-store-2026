<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
  public function up(): void
  {
    Schema::create('categories', function (Blueprint $table) {
      $table->id();
      $table->string('name');
      $table->string('slug')->unique();
      $table->boolean('active')->default(true);

      $table->foreignId('parent_id')->nullable()->constrained('categories')->onDelete('set null'); // ✅ changed from cascade — safe with soft deletes

      $table->timestamps();
      $table->softDeletes(); // ✅ added

      // Indexes
      $table->index(['parent_id', 'active']);
      $table->index('name');
    });
  }

  public function down(): void
  {
    Schema::dropIfExists('categories');
  }
};
