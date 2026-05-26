<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Board extends Model
{
    protected $fillable = [
        'project_id',
        'name',
        'position',
    ];

    // 이 컬럼이 속한 프로젝트
    public function project(): BelongsTo
    {
        return $this->belongsTo(Project::class);
    }

    // 이 컬럼에 속한 카드들
    public function cards(): HasMany
    {
        return $this->hasMany(Card::class)->orderBy('position');
    }
}