<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Project extends Model
{
    protected $fillable = [
        'owner_id',
        'name',
        'description',
        'color',
    ];

    // 프로젝트 생성자 (users 테이블)
    public function owner(): BelongsTo
    {
        return $this->belongsTo(User::class, 'owner_id');
    }

    // 프로젝트에 속한 컬럼들
    public function boards(): HasMany
    {
        return $this->hasMany(Board::class)->orderBy('position');
    }

    // 프로젝트 멤버들 (중간 테이블: project_members)
    public function members(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'project_members')
                    ->withPivot('role')
                    ->withTimestamps();
    }
}