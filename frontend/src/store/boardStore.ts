import { create } from 'zustand'
import type { Board, Card } from '@/types'

interface BoardStore {
  boards: Board[]          // 현재 프로젝트의 보드(컬럼) 목록
  isLoading: boolean

  // 함수들
  setBoards: (boards: Board[]) => void
  addBoard: (board: Board) => void
  updateBoard: (updated: Board) => void
  removeBoard: (id: number) => void

  // 카드 관련 (보드 안에 카드가 있어서 같은 스토어에서 관리)
  setCards: (boardId: number, cards: Card[]) => void
  addCard: (boardId: number, card: Card) => void
  updateCard: (boardId: number, updated: Card) => void
  removeCard: (boardId: number, cardId: number) => void
  moveCard: (cardId: number, fromBoardId: number, toBoardId: number, newPosition: number) => void

  setLoading: (loading: boolean) => void
}

export const useBoardStore = create<BoardStore>((set) => ({
  boards: [],
  isLoading: false,

  // ── 보드 함수들 ───────────────────────────────────────
  setBoards: (boards) => set({ boards }),

  addBoard: (board) =>
    set((state) => ({ boards: [...state.boards, board] })),

  updateBoard: (updated) =>
    set((state) => ({
      boards: state.boards.map((b) => (b.id === updated.id ? updated : b)),
    })),

  removeBoard: (id) =>
    set((state) => ({
      boards: state.boards.filter((b) => b.id !== id),
    })),

  // ── 카드 함수들 ───────────────────────────────────────
  // 특정 보드(boardId)의 cards 배열을 교체
  setCards: (boardId, cards) =>
    set((state) => ({
      boards: state.boards.map((b) =>
        b.id === boardId ? { ...b, cards } : b
        //                   ↑ ...b → 기존 보드 데이터 유지하면서 cards만 교체
        //                   PHP의 array_merge($board, ['cards' => $cards]) 같은 것
      ),
    })),

  addCard: (boardId, card) =>
    set((state) => ({
      boards: state.boards.map((b) =>
        b.id === boardId
          ? { ...b, cards: [...(b.cards ?? []), card] }
          //                      ↑ b.cards가 undefined일 수도 있어서 ?? [] 로 방어
          : b
      ),
    })),

  updateCard: (boardId, updated) =>
    set((state) => ({
      boards: state.boards.map((b) =>
        b.id === boardId
          ? {
              ...b,
              cards: b.cards?.map((c) => (c.id === updated.id ? updated : c)),
            }
          : b
      ),
    })),

  removeCard: (boardId, cardId) =>
    set((state) => ({
      boards: state.boards.map((b) =>
        b.id === boardId
          ? { ...b, cards: b.cards?.filter((c) => c.id !== cardId) }
          : b
      ),
    })),

  // 드래그앤드롭: 카드를 다른 보드로 이동
  moveCard: (cardId, fromBoardId, toBoardId, newPosition) =>
    set((state) => {
      // 1. 원본 보드에서 카드 찾기
      const fromBoard = state.boards.find((b) => b.id === fromBoardId)
      const card = fromBoard?.cards?.find((c) => c.id === cardId)
      if (!card) return state  // 카드 없으면 아무것도 안 함

      // 2. 원본 보드에서 카드 제거
      // 3. 대상 보드에 카드 삽입 (newPosition 위치에)
      return {
        boards: state.boards.map((b) => {
          if (b.id === fromBoardId) {
            return { ...b, cards: b.cards?.filter((c) => c.id !== cardId) }
          }
          if (b.id === toBoardId) {
            const newCards = [...(b.cards ?? [])]
            newCards.splice(newPosition, 0, { ...card, board_id: toBoardId })
            return { ...b, cards: newCards }
          }
          return b
        }),
      }
    }),

  setLoading: (loading) => set({ isLoading: loading }),
}))
