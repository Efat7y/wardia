<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('workers', function (Blueprint $table) {
            $table->id();
            $table->string('full_name');
            $table->string('phone', 20)->unique();
            $table->string('national_id', 14)->unique();
            $table->string('id_card_photo_url', 255)->nullable();
            $table->decimal('attendance_score', 5, 2)->default(100.00);
            $table->enum('status', ['active', 'restricted', 'blocked'])->default('active');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('workers');
    }
};
