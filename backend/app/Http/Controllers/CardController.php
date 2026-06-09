<?php
// 카드 생성 / 조회 / 수정 / 삭제 / 이동 / 순서 변경

namespace App\Http\Controllers;

use App\Models\Board;
use App\Models\Card;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CardController extends Controller
{
    // 보드의 카드 목록
    public function index(Board $board): JsonResponse
    {
        return response()->json($board->cards);
    }

    // 카드 생성
    public function store(Request $request, Board $board): JsonResponse
    {
        $data = $request->validate([
            'title'       => 'required|string|max:255',
            'description' => 'nullable|string',
            'priority'    => 'nullable|in:low,medium,high,urgent',
            'due_date'    => 'nullable|date',
            'assignee_id' => 'nullable|exists:users,id',
            'labels'      => 'nullable|array',
        ]);

        $position = $board->cards()->max('position') + 1;

        $card = $board->cards()->create([
            ...$data,
            'position' => $position,
        ]);

        return response()->json($card, 201);
    }

    // 카드 상세
    public function show(Board $board, Card $card): JsonResponse
    {
        return response()->json($card->load('assignee'));
    }

    // 카드 수정
    public function update(Request $request, Board $board, Card $card): JsonResponse
    {
        $data = $request->validate([
            'title'       => 'sometimes|string|max:255',
            'description' => 'nullable|string',
            'priority'    => 'nullable|in:low,medium,high,urgent',
            'due_date'    => 'nullable|date',
            'assignee_id' => 'nullable|exists:users,id',
            'labels'      => 'nullable|array',
        ]);

        $card->update($data);

        return response()->json($card);
    }

    // 카드 삭제
    public function destroy(Board $board, Card $card): JsonResponse
    {
        $card->delete();

        return response()->json(['message' => 'Deleted']);
    }

    // 카드 다른 보드로 이동 (드래그앤드롭 컬럼 이동)
    public function move(Request $request, Board $board, Card $card): JsonResponse
    {
        $data = $request->validate([
            'board_id' => 'required|exists:boards,id',
            'position' => 'required|integer',
        ]);

        $card->update([
            'board_id' => $data['board_id'],
            'position' => $data['position'],
        ]);

        return response()->json($card);
    }

    // 같은 보드 내 카드 순서 변경
    public function reorder(Request $request, Board $board): JsonResponse
    {
        $data = $request->validate([
            'cards'            => 'required|array',
            'cards.*.id'       => 'required|integer',
            'cards.*.position' => 'required|integer',
        ]);

        foreach ($data['cards'] as $item) {
            $board->cards()->where('id', $item['id'])->update(['position' => $item['position']]);
        }

        return response()->json(['message' => '순서 변경 완료']);
    }
}