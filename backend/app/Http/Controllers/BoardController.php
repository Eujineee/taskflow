<?php

namespace App\Http\Controllers;

use App\Models\Board;
use App\Models\Project;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class BoardController extends Controller
{
    // 프로젝트의 보드(컬럼) 목록
    public function index(Project $project): JsonResponse
    {
        return response()->json($project->boards);
    }

    // 보드 생성
    public function store(Request $request, Project $project): JsonResponse
    {
        $data = $request->validate([
            'name' => 'required|string|max:255',
        ]);

        // 마지막 position 다음으로 추가
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
        $data = $request->validate([
            'name' => 'required|string|max:255',
        ]);

        $board->update($data);

        return response()->json($board);
    }

    // 보드 삭제
    public function destroy(Project $project, Board $board): JsonResponse
    {
        $board->delete();

        return response()->json(['message' => 'Deleted']);
    }

    // 보드 순서 변경 (드래그앤드롭)
    public function reorder(Request $request, Project $project): JsonResponse
    {
        $data = $request->validate([
            'boards'          => 'required|array',
            'boards.*.id'     => 'required|integer',
            'boards.*.position' => 'required|integer',
        ]);

        foreach ($data['boards'] as $item) {
            $project->boards()->where('id', $item['id'])->update(['position' => $item['position']]);
        }

        return response()->json(['message' => '순서 변경 완료']);
    }
}