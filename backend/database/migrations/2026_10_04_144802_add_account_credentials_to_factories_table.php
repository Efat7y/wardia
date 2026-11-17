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
        Schema::table('factories', function (Blueprint $table) {
            $table->string('manager_email')->nullable()->unique();
            $table->string('manager_password')->nullable();
            $table->string('gate_email')->nullable()->unique();
            $table->string('gate_password')->nullable();
            $table->string('gate_name')->nullable()->default('البوابة الرئيسية');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('factories', function (Blueprint $table) {
            $table->dropColumn([
                'manager_email',
                'manager_password',
                'gate_email',
                'gate_password',
                'gate_name',
            ]);
        });
    }
};
