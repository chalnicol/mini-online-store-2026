<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('orders', function (Blueprint $table) {
            $table->id();
            $table->string('order_number')->unique(); // e.g., ORD-123456
            $table->foreignId('user_id')->constrained();
            $table->foreignId('address_id')->constrained('user_addresses');
            
            // Totals
            $table->decimal('items_subtotal', 12, 2);
            $table->decimal('shipping_fee', 12, 2);
            $table->decimal('voucher_discount', 12, 2)->default(0);
            $table->decimal('final_total', 12, 2);
            
            // Statuses
            $table->enum('status', ['pending', 'processing', 'shipped', 'delivered', 'cancelled', 'returned'])->default('pending');
            $table->enum('payment_status', ['unpaid', 'paid', 'refunded'])->default('unpaid');
            $table->string('payment_method'); // cod, gcash, paymaya
            
            // Delivery Info
            $table->string('delivery_type'); // standard, express, custom
            $table->json('delivery_schedule')->nullable(); // Store date/time for custom
            
            $table->text('notes')->nullable();
            $table->timestamps();
        });

        Schema::create('order_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->constrained()->onDelete('cascade');
            $table->foreignId('product_variant_id')->constrained();
            
            $table->string('product_name'); // Snapshot for history
            $table->string('variant_name'); // Snapshot for history
            $table->integer('quantity');
            $table->decimal('price_at_purchase', 12, 2); // The selling price at that time
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('orders');
        Schema::dropIfExists('order_items');
    }
};
