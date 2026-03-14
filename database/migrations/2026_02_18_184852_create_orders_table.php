<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
  public function up(): void
  {
    Schema::create('orders', function (Blueprint $table) {
      $table->id();
      $table->string('order_number')->unique(); // e.g., ORD-123456

      // ---- User ----
      $table->foreignId('user_id')->constrained()->onDelete('restrict'); // never delete user with active orders

      // ---- Address (FK + Snapshot) ----
      $table->foreignId('address_id')->nullable()->constrained('user_addresses')->onDelete('set null'); // ✅ if address deleted, FK goes null but snapshot stays
      $table->string('shipping_contact_person'); // ✅ snapshot
      $table->string('shipping_contact_number'); // ✅ snapshot
      $table->text('shipping_full_address'); // ✅ snapshot

      // ---- Voucher Snapshot ----
      $table->string('voucher_code')->nullable(); // ✅ snapshot of code used
      $table->decimal('voucher_discount', 12, 2)->default(0); // ✅ snapshot of amount discounted

      // ---- Totals ----
      $table->decimal('items_subtotal', 12, 2);
      $table->decimal('shipping_fee', 12, 2);
      $table->decimal('final_total', 12, 2);

      // ---- Statuses ----
      $table
        ->enum('status', ['pending', 'processing', 'shipped', 'delivered', 'cancelled', 'returned'])
        ->default('pending')
        ->index();

      $table->enum('payment_status', ['unpaid', 'paid', 'refunded'])->default('unpaid');

      $table->enum('payment_method', ['cod', 'gcash', 'paymaya', 'card']);

      $table->string('paymongo_source_id')->nullable();
      $table->string('paymongo_payment_id')->nullable(); //
      $table->string('paymongo_payment_intent_id')->nullable();

      // ---- Delivery ----
      $table->enum('delivery_type', ['standard', 'express', 'custom']);
      $table->json('delivery_schedule')->nullable(); // for custom delivery date/time

      $table->text('notes')->nullable();
      $table->timestamps();
      $table->softDeletes(); // ✅ soft delete
    });

    Schema::create('order_items', function (Blueprint $table) {
      $table->id();
      $table->foreignId('order_id')->constrained()->onDelete('cascade');
      $table
        ->foreignId('product_variant_id')
        ->nullable() // ✅ nullable — variant might be deleted
        ->constrained()
        ->onDelete('set null'); // ✅ preserve item even if variant deleted

      // ---- Snapshots ----
      $table->string('product_name'); // ✅ snapshot
      $table->string('variant_name'); // ✅ snapshot
      $table->json('variant_attributes')->nullable(); // ✅ snapshot e.g. {"Color":"Red","Size":"L"}

      $table->integer('quantity');
      $table->decimal('price_at_purchase', 12, 2); // ✅ snapshot of selling price
      $table->decimal('discount_at_purchase', 12, 2)->default(0); // ✅ snapshot of variant discount

      $table->timestamps();
    });
  }

  public function down(): void
  {
    Schema::dropIfExists('order_items');
    Schema::dropIfExists('orders');
  }
};
