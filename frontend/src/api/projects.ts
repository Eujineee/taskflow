// axios 클라이언트 가져오기 (baseURL, 토큰 자동 첨부 설정된 인스턴스)
import client from './client'

// 이 파일에서 사용할 타입들을 types/index.ts에서 가져오기
import type {
  Project,
  CreateProjectRequest,
  UpdateProjectRequest,
} from '@/types'

// projectsApi: 프로젝트 관련 API 함수들을 하나의 객체로 묶음
// → 어디서든 projectsApi.list() 처럼 깔끔하게 사용 가능
export const projectsApi = {

  // ── 프로젝트 목록 가져오기 ──────────────────────────
  // GET /api/projects
  // Promise<Project[]> → 비동기 함수, 결과는 Project 배열
  list: async (): Promise<Project[]> => {
    const res = await client.get<Project[]>('/projects')
    return res.data  // axios는 응답을 res.data에 담아줌
  },

  // ── 프로젝트 1개 가져오기 ──────────────────────────
  // GET /api/projects/:id
  get: async (id: number): Promise<Project> => {
    const res = await client.get<Project>(`/projects/${id}`)
    return res.data
  },

  // ── 프로젝트 생성 ──────────────────────────────────
  // POST /api/projects
  // data: 보낼 내용 { name, description?, color? }
  create: async (data: CreateProjectRequest): Promise<Project> => {
    const res = await client.post<Project>('/projects', data)
    return res.data
  },

  // ── 프로젝트 수정 ──────────────────────────────────
  // PUT /api/projects/:id
  update: async (id: number, data: UpdateProjectRequest): Promise<Project> => {
    const res = await client.put<Project>(`/projects/${id}`, data)
    return res.data
  },

  // ── 프로젝트 삭제 ──────────────────────────────────
  // DELETE /api/projects/:id
  // void → 반환값 없음
  delete: async (id: number): Promise<void> => {
    await client.delete(`/projects/${id}`)
  },

  // ── 프로젝트 멤버 추가 ────────────────────────────
  // POST /api/projects/:projectId/members
  addMember: async (projectId: number, email: string, role: string): Promise<void> => {
    await client.post(`/projects/${projectId}/members`, { email, role })
  },

  // ── 멤버 권한 수정 ────────────────────────────────
  // PUT /api/projects/:projectId/members/:userId
  updateMember: async (projectId: number, userId: number, role: string): Promise<void> => {
    await client.put(`/projects/${projectId}/members/${userId}`, { role })
  },

  // ── 멤버 제거 ─────────────────────────────────────
  // DELETE /api/projects/:projectId/members/:userId
  removeMember: async (projectId: number, userId: number): Promise<void> => {
    await client.delete(`/projects/${projectId}/members/${userId}`)
  },
}
