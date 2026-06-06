// ===== 사용자 =====
export interface User {
  id: number
  name: string
  email: string
  created_at: string
  updated_at: string
}

// ===== 프로젝트 멤버 =====
export type MemberRole = 'admin' | 'member' | 'viewer'

export interface ProjectMember extends User {
  pivot: {
    role: MemberRole
  }
}

// ===== 프로젝트 =====
export interface Project {
  id: number
  owner_id: number
  name: string
  description: string | null
  color: string | null
  created_at: string
  updated_at: string
  owner?: User
  members?: ProjectMember[]
}

// ===== 보드 (컬럼) =====
export interface Board {
  id: number
  project_id: number
  name: string
  position: number
  created_at: string
  updated_at: string
  cards?: Card[]
}

// ===== 카드 =====
export type Priority = 'low' | 'medium' | 'high' | 'urgent'

export interface Card {
  id: number
  board_id: number
  assignee_id: number | null
  title: string
  description: string | null
  priority: Priority | null
  due_date: string | null
  position: number
  labels: string[] | null
  created_at: string
  updated_at: string
  assignee?: User
}

// ===== API 응답 =====
export interface AuthResponse {
  user: User
  token: string
}

export interface ApiError {
  message: string
  errors?: Record<string, string[]>
}

// ===== 요청 타입 =====
export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  name: string
  email: string
  password: string
  password_confirmation: string
}

export interface CreateProjectRequest {
  name: string
  description?: string
  color?: string
}

export interface UpdateProjectRequest {
  name?: string
  description?: string
  color?: string
}

export interface CreateBoardRequest {
  name: string
}

export interface UpdateBoardRequest {
  name: string
}

export interface CreateCardRequest {
  title: string
  description?: string
  priority?: Priority
  due_date?: string
  assignee_id?: number
  labels?: string[]
}

export interface UpdateCardRequest {
  title?: string
  description?: string
  priority?: Priority
  due_date?: string
  assignee_id?: number | null
  labels?: string[]
}

export interface MoveCardRequest {
  target_board_id: number
  position: number
}
