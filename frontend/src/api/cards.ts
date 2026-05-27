import client from './client'
import type { Card, CreateCardRequest, UpdateCardRequest, MoveCardRequest } from '@/types'

export const cardsApi = {

  // GET /api/boards/:boardId/cards
  // 특정 보드(컬럼)에 속한 카드 목록
  list: async (boardId: number): Promise<Card[]> => {
    const res = await client.get<Card[]>(`/boards/${boardId}/cards`)
    return res.data
  },

  // GET /api/boards/:boardId/cards/:cardId
  // 카드 1개 상세 (담당자, 라벨 등 포함)
  get: async (boardId: number, cardId: number): Promise<Card> => {
    const res = await client.get<Card>(`/boards/${boardId}/cards/${cardId}`)
    return res.data
  },

  // POST /api/boards/:boardId/cards
  create: async (boardId: number, data: CreateCardRequest): Promise<Card> => {
    const res = await client.post<Card>(`/boards/${boardId}/cards`, data)
    return res.data
  },

  // PUT /api/boards/:boardId/cards/:cardId
  update: async (boardId: number, cardId: number, data: UpdateCardRequest): Promise<Card> => {
    const res = await client.put<Card>(`/boards/${boardId}/cards/${cardId}`, data)
    return res.data
  },

  // DELETE /api/boards/:boardId/cards/:cardId
  delete: async (boardId: number, cardId: number): Promise<void> => {
    await client.delete(`/boards/${boardId}/cards/${cardId}`)
  },

  // POST /api/boards/:boardId/cards/:cardId/move
  // 카드를 다른 보드(컬럼)로 이동
  move: async (boardId: number, cardId: number, data: MoveCardRequest): Promise<Card> => {
    const res = await client.post<Card>(`/boards/${boardId}/cards/${cardId}/move`, data)
    return res.data
  },

  // POST /api/boards/:boardId/cards/reorder
  // 같은 보드 안에서 카드 순서 재정렬
  reorder: async (boardId: number, ids: number[]): Promise<void> => {
    await client.post(`/boards/${boardId}/cards/reorder`, { ids })
  },
}
