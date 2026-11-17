<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('shifts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('factory_id')->constrained('factories')->onDelete('cascade');
            $table->string('title');
            $table->text('description')->nullable();
            $table->date('shift_date');
            $table->time('start_time');
            $table->time('end_time');
            $table->decimal('worker_wage', 10, 2);
            $table->decimal('service_fee', 10, 2);
            $table->unsignedInteger('slots_needed');
            $table->unsignedInteger('slots_filled')->default(0);
            $table->enum('status', ['draft', 'open', 'ongoing', 'completed', 'cancelled'])->default('open');
            $table->timestamps();

            $table->index(['shift_date', 'status'], 'idx_shifts_date_status');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('shifts');
    }
};
