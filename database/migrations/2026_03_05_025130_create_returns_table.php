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
    Schema::create('returns', function (Blueprint $table) {
      $table->id();
      $table->foreignId('order_id')->constrained();
      $table->foreignId('user_id')->constrained(); // The Admin/Staff handling it
      $table->string('return_number')->unique(); // e.g., RET-1001
      $table->enum('status', ['pending', 'approved', 'received', 'rejected', 'cancelled'])->default('pending');
      $table->text('reason_note')->nullable(); // General note for the whole return
      $table->timestamps();
    });

    Schema::create('return_items', function (Blueprint $table) {
      $table->id();
      $table->foreignId('return_id')->constrained()->onDelete('cascade');
      $table->foreignId('product_variant_id')->constrained();
      $table->integer('quantity');
      $table->enum('condition', ['pending_inspection', 'sellable', 'damaged'])->default('pending_inspection');
      $table->timestamps();
    });
  }

  /**
   * Reverse the migrations.
   */
  public function down(): void
  {
    Schema::dropIfExists('returns');
    Schema::dropIfExists('return_items');
  }
};
