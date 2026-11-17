<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Worker extends Model
{
    use HasFactory;

    protected $fillable = [
        'full_name',
        'phone',
        'national_id',
        'meeza_card_number',
        'meeza_bank_name',
        'wallet_balance',
        'id_card_front',
        'id_card_back',
        'id_card_photo_url',
        'attendance_score',
        'status',
    ];

    protected $casts = [
        'attendance_score' => 'float',
    ];

    public function bookings(): HasMany
    {
        return $this->hasMany(ShiftBooking::class);
    }

    public function ledgerEntries(): HasMany
    {
        return $this->hasMany(EarningsLedger::class);
    }

    public function getWalletBalanceAttribute(): float
    {
        return (float) $this->ledgerEntries()->sum('amount');
    }
}
