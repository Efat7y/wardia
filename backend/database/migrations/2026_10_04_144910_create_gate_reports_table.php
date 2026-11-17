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
        Schema::create('gate_reports', function (Blueprint $table) {
            $table->id();
            $table->foreignId('factory_id')->constrained('factories')->onDelete('cascade');
            $table->string('report_title');
            $table->date('report_date');
            $table->string('security_officer_name')->default('مسؤول أمن الوردية');
            $table->integer('total_attended')->default(0);
            $table->integer('total_absent')->default(0);
            $table->json('workers_summary')->nullable(); // JSON list of attended workers
            $table->text('notes')->nullable();
            $table->enum('status', ['submitted', 'reviewed'])->default('submitted');
            $table->timestamp('submitted_at')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('gate_reports');
    }
};
