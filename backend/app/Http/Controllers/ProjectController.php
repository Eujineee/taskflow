<?php
// 프로젝트 생성 / 조회 / 수정 / 삭제

namespace App\Http\Controllers;

use App\Models\Project;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ProjectController extends Controller
{
    // 내가 속한 프로젝트 목록
    public function index(Request $request): JsonResponse
    {
        $this->authorize('viewAny', Project::class);

        $projects = Project::where('owner_id', $request->user()->id)
            ->orWhereHas('members', fn($q) => $q->where('user_id', $request->user()->id))
            ->get();

        return response()->json($projects);
    }

    // 프로젝트 생성
    public function store(Request $request): JsonResponse
    {
        $this->authorize('create', Project::class);

        $data = $request->validate([
            'name'        => 'required|string|max:255',
            'description' => 'nullable|string',
            'color'       => 'nullable|string|size:7',
        ]);

        $project = Project::create([
            ...$data,
            'owner_id' => $request->user()->id,
        ]);

        // 생성자를 admin 멤버로 자동 추가
        $project->members()->attach($request->user()->id, ['role' => 'admin']);

        return response()->json($project, 201);
    }

    // 프로젝트 상세 (보드 + 카드 포함)
    public function show(Project $project): JsonResponse
    {
        $this->authorize('view', $project);

        $project->load('boards.cards', 'members');

        return response()->json($project);
    }

    // 프로젝트 수정
    public function update(Request $request, Project $project): JsonResponse
    {
        $this->authorize('update', $project);

        $data = $request->validate([
            'name'        => 'sometimes|string|max:255',
            'description' => 'nullable|string',
            'color'       => 'nullable|string|size:7',
        ]);

        $project->update($data);

        return response()->json($project);
    }

    // 프로젝트 삭제
    public function destroy(Project $project): JsonResponse
    {
        $this->authorize('delete', $project);

        $project->delete();

        return response()->json(['message' => 'Deleted']);
    }
}
