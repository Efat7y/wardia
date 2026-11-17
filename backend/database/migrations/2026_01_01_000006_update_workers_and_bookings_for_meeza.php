<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('workers', function (Blueprint $table) {
            $table->string('meeza_card_number', 20)->nullable()->after('national_id');
            $table->string('meeza_bank_name', 100)->nullable()->after('meeza_card_number');
            $table->decimal('wallet_balance', 10, 2)->default(0.00)->after('meeza_bank_name');
            $table->text('id_card_front')->nullable()->after('wallet_balance');
            $table->text('id_card_back')->nullable()->after('id_card_front');
        });

        Schema::table('shift_bookings', function (Blueprint $table) {
            $table->decimal('overtime_hours', 4, 1)->default(0.0)->after('check_out_at');
        });
    }

    public function down(): void
    {
        Schema::table('workers', function (Blueprint $table) {
            $table->dropColumn(['meeza_card_number', 'meeza_bank_name', 'wallet_balance', 'id_card_front', 'id_card_back']);
        });

        Schema::table('shift_bookings', function (Blueprint $table) {
            $table->dropColumn(['overtime_hours']);
        });
    }
};
