<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Factory extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'tax_record',
        'industrial_zone',
        'latitude',
        'longitude',
        'status',
        'manager_email',
        'manager_password',
        'gate_email',
        'gate_password',
        'gate_name',
    ];

    public function shifts(): HasMany
    {
        return $this->hasMany(Shift::class);
    }

    public function gateReports(): HasMany
    {
        return $this->hasMany(GateReport::class);
    }
}
