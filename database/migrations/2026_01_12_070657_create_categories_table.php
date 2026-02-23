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
        Schema::create('categories', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('slug')->unique();
            $table->boolean('active')->default(true);

            $table->foreignId('parent_id')
                ->nullable() 
                ->constrained('categories')
                ->onDelete('cascade');

            $table->timestamps();

            // --- ADD INDEXES HERE ---
            // This speeds up finding root categories that are active
            $table->index(['parent_id', 'active']); 
            
            // Optional: Speed up searching by name in the admin panel
            $table->index('name'); 
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('categories');
    }
};
