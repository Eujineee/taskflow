<?php

namespace App\Policies;

use App\Models\Card;
use App\Models\User;

class CardPolicy
{
    // 카드 조회·생성·수정·삭제 모두 — 해당 프로젝트 멤버이면 가능
    public function before(User $user, string $ability): ?bool
    {
        // 슈퍼어드민 같은 전역 예외가 필요할 때 여기서 처리
        return null;
    }

    public function view(User $user, Card $card): bool
    {
        return $this->isProjectMember($user, $card);
    }

    public function create(User $user, Card $card): bool
    {
        return $this->isProjectMember($user, $card);
    }

    public function update(User $user, Card $card): bool
    {
        return $this->isProjectMember($user, $card);
    }

    public function delete(User $user, Card $card): bool
    {
        return $this->isProjectMember($user, $card);
    }

    // ────────── 헬퍼 ──────────

    private function isProjectMember(User $user, Card $card): bool
    {
        $project = $card->board->project;

        return $project->owner_id === $user->id
            || $project->members()->where('user_id', $user->id)->exists();
    }
}
