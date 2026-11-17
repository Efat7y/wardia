<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class GateReport extends Model
{
    use HasFactory;

    protected $fillable = [
        'factory_id',
        'report_title',
        'report_date',
        'security_officer_name',
        'total_attended',
        'total_absent',
        'workers_summary',
        'notes',
        'status',
        'submitted_at',
    ];

    protected $casts = [
        'workers_summary' => 'array',
        'submitted_at' => 'datetime',
    ];

    public function factory(): BelongsTo
    {
        return $this->belongsTo(Factory::class);
    }
}
