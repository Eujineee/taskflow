<?php
// 프로젝트 멤버 초대 / 역할 변경 / 제거

namespace App\Http\Controllers;

use App\Models\Project;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ProjectMemberController extends Controller
{
    // 멤버 초대
    public function store(Request $request, Project $project): JsonResponse
    {
        $data = $request->validate([
            'email' => 'required|email|exists:users,email',
            'role'  => 'required|in:admin,member,viewer',
        ]);

        $user = User::where('email', $data['email'])->first();

        // 이미 멤버인지 확인
        if ($project->members()->where('user_id', $user->id)->exists()) {
            return response()->json(['message' => '이미 멤버입니다.'], 422);
        }

        $project->members()->attach($user->id, ['role' => $data['role']]);

        return response()->json(['message' => '초대 완료']);
    }

    // 역할 변경
    public function update(Request $request, Project $project, User $user): JsonResponse
    {
        $data = $request->validate([
            'role' => 'required|in:admin,member,viewer',
        ]);

        $project->members()->updateExistingPivot($user->id, ['role' => $data['role']]);

        return response()->json(['message' => '역할 변경 완료']);
    }

    // 멤버 제거
    public function destroy(Project $project, User $user): JsonResponse
    {
        $project->members()->detach($user->id);

        return response()->json(['message' => '멤버 제거 완료']);
    }
}