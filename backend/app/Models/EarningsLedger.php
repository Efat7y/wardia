<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use RuntimeException;

class EarningsLedger extends Model
{
    use HasFactory;

    protected $table = 'earnings_ledger';
    public $timestamps = false;

    protected $fillable = [
        'worker_id',
        'shift_booking_id',
        'transaction_type',
        'amount',
        'notes',
        'created_at',
    ];

    /**
     * Enforce Section 2.3: Immutable Financial Ledger
     * Direct UPDATE or DELETE queries are strictly prohibited on ledger entries.
     */
    protected static function booted(): void
    {
        static::updating(function () {
            throw new RuntimeException('خرق أمني: جدول الأرباح ودفتر المستحقات (earnings_ledger) غير قابل للتعديل (Immutable). استخدم قيود تسوية ADJUSTMENT بدلاً من ذلك.');
        });

        static::deleting(function () {
            throw new RuntimeException('خرق أمني: جدول الأرباح ودفتر المستحقات (earnings_ledger) غير قابل للحذف (Immutable).');
        });
    }

    public function worker(): BelongsTo
    {
        return $this->belongsTo(Worker::class);
    }
}
