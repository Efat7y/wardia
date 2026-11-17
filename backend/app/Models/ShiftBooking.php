<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ShiftBooking extends Model
{
    use HasFactory;

    protected $fillable = [
        'shift_id',
        'worker_id',
        'status',
        'check_in_at',
        'check_out_at',
        'overtime_hours',
        'verified_by_user_id',
    ];

    public function shift(): BelongsTo
    {
        return $this->belongsTo(Shift::class);
    }

    public function worker(): BelongsTo
    {
        return $this->belongsTo(Worker::class);
    }
}
