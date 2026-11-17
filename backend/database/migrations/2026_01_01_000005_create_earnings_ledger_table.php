<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('earnings_ledger', function (Blueprint $table) {
            $table->id();
            $table->foreignId('worker_id')->constrained('workers')->onDelete('cascade');
            $table->unsignedBigInteger('shift_booking_id')->default(0);
            $table->enum('transaction_type', ['EARNED', 'PENALTY_COMPENSATION', 'PAYOUT', 'ADJUSTMENT']);
            $table->decimal('amount', 10, 2);
            $table->string('notes', 255)->nullable();
            $table->timestamp('created_at')->useCurrent();

            $table->index(['worker_id', 'transaction_type'], 'idx_ledger_worker');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('earnings_ledger');
    }
};
