<?php
// 보드(컬럼) 생성 / 수정 / 삭제 / 순서 변경

namespace App\Http\Controllers;

use App\Models\Board;
use App\Models\Project;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class BoardController extends Controller
{
    // 프로젝트의 보드(컬럼) 목록
    public function index(Project $project): JsonResponse
    {
        $this->authorize('view', $project);

        return response()->json($project->boards);
    }

    // 보드 생성
    public function store(Request $request, Project $project): JsonResponse
    {
        $this->authorize('manageBoards', $project);

        $data = $request->validate([
            'name' => 'required|string|max:255',
        ]);

        $position = $project->boards()->max('position') + 1;

        $board = $project->boards()->create([
            'name'     => $data['name'],
            'position' => $position,
        ]);

        return response()->json($board, 201);
    }

    // 보드 이름 수정
    public function update(Request $request, Project $project, Board $board): JsonResponse
    {
        abort_if($board->project_id !== $project->id, 404);
        $this->authorize('manageBoards', $project);

        $data = $request->validate([
            'name' => 'required|string|max:255',
        ]);

        $board->update($data);

        return response()->json($board);
    }

    // 보드 삭제
    public function destroy(Project $project, Board $board): JsonResponse
    {
        abort_if($board->project_id !== $project->id, 404);
        $this->authorize('manageBoards', $project);

        $board->delete();

        return response()->json(['message' => 'Deleted']);
    }

    // 보드 순서 변경 (드래그앤드롭)
    public function reorder(Request $request, Project $project): JsonResponse
    {
        $this->authorize('manageBoards', $project);

        $data = $request->validate([
            'boards'            => 'required|array',
            'boards.*.id'       => 'required|integer',
            'boards.*.position' => 'required|integer',
        ]);

        DB::transaction(function () use ($project, $data) {
            foreach ($data['boards'] as $item) {
                $project->boards()->where('id', $item['id'])->update(['position' => $item['position']]);
            }
        });

        return response()->json(['message' => '순서 변경 완료']);
    }
}
