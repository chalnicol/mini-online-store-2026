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
        Schema::create('purchase_logs', function (Blueprint $table) {
            $table->id();
            $table->string('batch_number')->unique(); // e.g., PUR-2024-001
            $table->string('supplier_name')->nullable();
            $table->decimal('total_amount', 12, 2)->default(0);
            $table->date('received_at')->nullable();
            $table->enum('status', ['pending', 'received', 'cancelled'])->default('pending');
            $table->text('notes')->nullable();
            $table->timestamps();
        });

        Schema::create('purchase_log_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('purchase_log_id')->constrained()->onDelete('cascade');
            $table->foreignId('product_variant_id')->constrained();
            
            $table->integer('quantity');
            $table->decimal('unit_cost', 12, 2); // Price History! What you paid.
            $table->decimal('subtotal', 12, 2);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('purchase_logs');
        Schema::dropIfExists('purchase_log_items');

    }
};
