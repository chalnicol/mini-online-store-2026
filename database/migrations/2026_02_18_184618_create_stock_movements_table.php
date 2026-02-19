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
        Schema::create('stock_movements', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_variant_id')->constrained()->onDelete('cascade');
            $table->foreignId('user_id')->nullable()->constrained(); // Who did it? (Admin or System)
            
            $table->integer('quantity'); // Positive for 'in', negative for 'out'
            $table->enum('type', ['in', 'out', 'adjustment', 'return', 'initial']);
            $table->string('reason')->nullable(); // e.g., "Supplier Restock", "Order #1002", "Damage"
            
            // Link to other tables for tracking
            $table->morphs('reference'); // This creates reference_id and reference_type
            // Allows linking to a PurchaseLogItem or an OrderItem easily.

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('stock_movements');
    }
};
