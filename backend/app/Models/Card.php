<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Card extends Model
{
    protected $fillable = [
        'board_id',
        'assignee_id',
        'title',
        'description',
        'priority',
        'due_date',
        'position',
        'labels',
    ];

    protected $casts = [
        'labels'   => 'array',   // JSON 컬럼을 PHP 배열로 자동 변환
        'due_date' => 'date',
    ];

    // 이 카드가 속한 컬럼
    public function board(): BelongsTo
    {
        return $this->belongsTo(Board::class);
    }

    // 카드 담당자
    public function assignee(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assignee_id');
    }
}