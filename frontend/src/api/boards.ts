import client from './client'
import type { Board, CreateBoardRequest, UpdateBoardRequest } from '@/types'

export const boardsApi = {

  // GET /api/projects/:projectId/boards
  // 특정 프로젝트의 보드(컬럼) 목록
  list: async (projectId: number): Promise<Board[]> => {
    const res = await client.get<Board[]>(`/projects/${projectId}/boards`)
    return res.data
  },

  // POST /api/projects/:projectId/boards
  create: async (projectId: number, data: CreateBoardRequest): Promise<Board> => {
    const res = await client.post<Board>(`/projects/${projectId}/boards`, data)
    return res.data
  },

  // PUT /api/projects/:projectId/boards/:boardId
  update: async (projectId: number, boardId: number, data: UpdateBoardRequest): Promise<Board> => {
    const res = await client.put<Board>(`/projects/${projectId}/boards/${boardId}`, data)
    return res.data
  },

  // DELETE /api/projects/:projectId/boards/:boardId
  delete: async (projectId: number, boardId: number): Promise<void> => {
    await client.delete(`/projects/${projectId}/boards/${boardId}`)
  },

  // POST /api/projects/:projectId/boards/reorder
  // ids 배열 순서대로 보드 위치 재정렬
  reorder: async (projectId: number, ids: number[]): Promise<void> => {
    await client.post(`/projects/${projectId}/boards/reorder`, { ids })
  },
}
