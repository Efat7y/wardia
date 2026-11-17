<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Shift extends Model
{
    use HasFactory;

    protected $fillable = [
        'factory_id',
        'title',
        'description',
        'shift_date',
        'start_time',
        'end_time',
        'worker_wage',
        'service_fee',
        'slots_needed',
        'slots_filled',
        'status',
    ];

    public function factory(): BelongsTo
    {
        return $this->belongsTo(Factory::class);
    }

    public function bookings(): HasMany
    {
        return $this->hasMany(ShiftBooking::class);
    }
}
