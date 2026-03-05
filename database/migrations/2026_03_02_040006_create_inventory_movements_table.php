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
    Schema::create('inventory_movements', function (Blueprint $table) {
      $table->id();
      $table->foreignId('product_variant_id')->constrained()->onDelete('cascade');
      $table->foreignId('user_id')->nullable()->constrained(); // Admin who performed action

      // The change in quantity (positive for restock, negative for sales/returns-to-vendor)
      $table->integer('quantity');

      // The cost at the time of THIS specific movement (Crucial for Moving Average)
      $table->decimal('unit_cost', 12, 2)->nullable();

      // Categorization
      $table->enum('type', ['purchase', 'sale', 'customer_return', 'purchase_return', 'adjustment', 'initial']);

      // The state of the items in this movement
      $table->enum('status', ['available', 'quarantine', 'damaged', 'lost'])->default('available');

      $table->foreignId('supplier_id')->nullable()->constrained()->onDelete('set null');

      $table->string('reason')->nullable(); // e.g., "Supplier Restock", "Order #1002"

      // Link to Orders, PurchaseLogs, or Returns
      $table->nullableMorphs('reference');

      $table->timestamps();
    });
  }

  /**
   * Reverse the migrations.
   */
  public function down(): void
  {
    Schema::dropIfExists('inventory_movements');
  }
};
