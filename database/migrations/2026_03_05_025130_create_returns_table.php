<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
  public function up(): void
  {
    Schema::create('order_returns', function (Blueprint $table) {
      $table->id();
      $table->string('return_number')->unique(); // e.g., RET-XXXXXXXX

      $table->foreignId('order_id')->constrained()->onDelete('restrict'); // ✅ never hard delete an order with returns

      $table->foreignId('user_id')->constrained()->onDelete('restrict'); // ✅ the customer who requested

      $table
        ->enum('status', [
          'pending', // customer submitted
          'approved', // admin approved
          'rejected', // admin rejected (e.g., change of mind)
          'received', // items arrived back at warehouse
          'completed', // all items inspected + resolved
          'cancelled', // customer cancelled before approval
        ])
        ->default('pending')
        ->index();

      $table->text('admin_note')->nullable(); // admin's reason for approval/rejection

      $table->timestamps();
      $table->softDeletes();
    });

    Schema::create('return_items', function (Blueprint $table) {
      $table->id();

      $table->foreignId('order_return_id')->constrained('order_returns')->onDelete('cascade');

      // Snapshot from order_item — in case variant is deleted
      $table->foreignId('order_item_id')->constrained()->onDelete('restrict'); // ✅ preserve link to original order item

      $table->foreignId('product_variant_id')->nullable()->constrained()->onDelete('set null'); // ✅ nullable snapshot fallback

      // ---- Snapshots ----
      $table->string('product_name'); // ✅ snapshot
      $table->string('variant_name'); // ✅ snapshot

      $table->integer('quantity'); // partial returns supported

      $table->enum('reason', ['damaged_item_received', 'expired_product', 'wrong_item_sent', 'missing_items']);

      // ---- Inspection (filled after items received) ----
      $table->enum('condition', ['pending_inspection', 'sellable', 'damaged'])->default('pending_inspection');

      // ---- Resolution (per item) ----
      $table->enum('resolution', ['pending', 'refund', 'replacement'])->default('pending');

      $table->boolean('is_restocked')->default(false); // ✅ tracks if inventory_movement was created

      $table->timestamps();
    });
  }

  public function down(): void
  {
    Schema::dropIfExists('return_items');
    Schema::dropIfExists('order_returns');
  }
};
