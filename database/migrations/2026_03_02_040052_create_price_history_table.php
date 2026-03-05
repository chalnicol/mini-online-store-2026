<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
  /**
   * Run the migrations.
   */
  public function up(): void
  {
    Schema::create('price_history', function (Blueprint $table) {
      $table->id();
      $table->foreignId('product_variant_id')->constrained()->onDelete('cascade');
      $table->decimal('old_price', 12, 2);
      $table->decimal('new_price', 12, 2);
      $table->decimal('margin_at_time', 5, 2); // To see if it was exactly 30% or custom
      $table->string('reason')->nullable(); // e.g., "Cost increase from supplier"
      $table->timestamps();
    });
  }

  /**
   * Reverse the migrations.
   */
  public function down(): void
  {
    Schema::dropIfExists('price_history');
  }
};
