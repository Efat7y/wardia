<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('shift_bookings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('shift_id')->constrained('shifts')->onDelete('cascade');
            $table->foreignId('worker_id')->constrained('workers')->onDelete('cascade');
            $table->enum('status', ['booked', 'attended', 'no_show', 'cancelled_valid'])->default('booked');
            $table->timestamp('check_in_at')->nullable();
            $table->timestamp('check_out_at')->nullable();
            $table->unsignedBigInteger('verified_by_user_id')->nullable();
            $table->timestamps();

            $table->unique(['shift_id', 'worker_id'], 'uq_shift_worker');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('shift_bookings');
    }
};
