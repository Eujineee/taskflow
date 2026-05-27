import { create } from 'zustand'
import type { User } from '@/types'

// 이 스토어가 가질 데이터와 함수의 타입 정의
interface AuthStore {
  user: User | null        // 로그인한 유저 정보 (로그아웃 상태면 null)
  token: string | null     // 로그인 토큰
  isLoading: boolean       // 로그인 요청 중인지 여부 (로딩 스피너용)

  // 함수들
  setAuth: (user: User, token: string) => void  // 로그인 성공 시 호출
  logout: () => void                             // 로그아웃 시 호출
  setLoading: (loading: boolean) => void
}

export const useAuthStore = create<AuthStore>((set) => ({
  // ── 초기값 ──────────────────────────────────────────
  // 페이지 새로고침 해도 토큰 유지하려고 localStorage에서 읽어옴
  user: null,
  token: localStorage.getItem('token'),
  isLoading: false,

  // ── 함수 정의 ────────────────────────────────────────
  // set()은 Zustand가 주는 함수 → 스토어 값을 업데이트할 때 사용
  // PHP로 치면 $this->user = $user 같은 것

  setAuth: (user, token) => {
    localStorage.setItem('token', token)   // 새로고침 후에도 유지되게 저장
    set({ user, token })                   // 스토어 업데이트 → 화면 자동 갱신
  },

  logout: () => {
    localStorage.removeItem('token')       // 토큰 삭제
    set({ user: null, token: null })       // 스토어 초기화
  },

  setLoading: (loading) => set({ isLoading: loading }),
}))
