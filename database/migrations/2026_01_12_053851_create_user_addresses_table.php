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
    Schema::create('user_addresses', function (Blueprint $table) {
      $table->id();
      $table->foreignId('user_id')->constrained()->onDelete('cascade');
      $table->foreignId('serviceable_area_id')->nullable()->constrained()->onDelete('set null');
      $table->enum('type', ['Home', 'Office', 'Other']);
      $table->string('contact_person');
      $table->string('contact_number');
      $table->string('street_address');
      $table->boolean('is_default')->default(false);
      $table->timestamps();
      $table->softDeletes();
    });
  }

  /**
   * Reverse the migrations.
   */
  public function down(): void
  {
    Schema::dropIfExists('user_addresses');
  }
};
