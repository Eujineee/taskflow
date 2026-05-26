<?php

namespace App\Policies;

use App\Models\Project;
use App\Models\User;

class ProjectPolicy
{
    // 프로젝트 목록 조회 — 누구나 (로그인만 되면)
    public function viewAny(User $user): bool
    {
        return true;
    }

    // 프로젝트 상세 조회 — 멤버이거나 오너
    public function view(User $user, Project $project): bool
    {
        return $this->isMember($user, $project);
    }

    // 프로젝트 생성 — 누구나
    public function create(User $user): bool
    {
        return true;
    }

    // 프로젝트 수정 — 오너 또는 admin
    public function update(User $user, Project $project): bool
    {
        return $this->isAdminOrOwner($user, $project);
    }

    // 프로젝트 삭제 — 오너만
    public function delete(User $user, Project $project): bool
    {
        return $project->owner_id === $user->id;
    }

    // 멤버 초대 / 역할변경 / 제거 — 오너 또는 admin
    public function manageMembers(User $user, Project $project): bool
    {
        return $this->isAdminOrOwner($user, $project);
    }

    // 보드 생성·수정·삭제 — 오너 또는 admin
    public function manageBoards(User $user, Project $project): bool
    {
        return $this->isAdminOrOwner($user, $project);
    }

    // ────────── 헬퍼 ──────────

    private function isMember(User $user, Project $project): bool
    {
        return $project->owner_id === $user->id
            || $project->members()->where('user_id', $user->id)->exists();
    }

    private function isAdminOrOwner(User $user, Project $project): bool
    {
        if ($project->owner_id === $user->id) {
            return true;
        }

        return $project->members()
            ->where('user_id', $user->id)
            ->wherePivot('role', 'admin')
            ->exists();
    }
}
