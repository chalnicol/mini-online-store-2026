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
    Schema::create('reviews', function (Blueprint $table) {
      $table->id();
      $table->foreignId('product_id')->constrained()->onDelete('cascade');
      $table->foreignId('product_variant_id')->constrained()->onDelete('cascade');
      $table->foreignId('user_id')->constrained();
      $table->integer('rating')->unsigned(); // 1 to 5
      $table->text('comment')->nullable();
      $table->boolean('is_published')->default(true);
      $table->timestamps();
      $table->softDeletes();
    });
  }

  /**
   * Reverse the migrations.
   */
  public function down(): void
  {
    Schema::dropIfExists('reviews');
  }
};
