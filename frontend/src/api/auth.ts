import client from './client'
import type { AuthResponse, LoginRequest, RegisterRequest, User } from '@/types'

export const authApi = {
  // 회원가입
  register: async (data: RegisterRequest): Promise<AuthResponse> => {
    const res = await client.post<AuthResponse>('/register', data)
    return res.data
  },

  // 로그인
  login: async (data: LoginRequest): Promise<AuthResponse> => {
    const res = await client.post<AuthResponse>('/login', data)
    return res.data
  },

  // 로그아웃
  logout: async (): Promise<void> => {
    await client.post('/logout')
  },

  // 내 정보
  me: async (): Promise<User> => {
    const res = await client.get<User>('/me')
    return res.data
  },
}