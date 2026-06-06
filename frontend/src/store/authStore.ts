import { create } from 'zustand'
import type { User } from '@/types'

interface AuthStore {
  user: User | null
  token: string | null
  isLoading: boolean
  isInitialized: boolean

  setAuth: (user: User, token: string) => void
  setUser: (user: User) => void
  logout: () => void
  setLoading: (loading: boolean) => void
  setInitialized: () => void
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  token: localStorage.getItem('token'),
  isLoading: false,
  isInitialized: false,

  setAuth: (user, token) => {
    localStorage.setItem('token', token)
    set({ user, token })
  },

  setUser: (user) => set({ user }),

  logout: () => {
    localStorage.removeItem('token')
    set({ user: null, token: null })
  },

  setLoading: (loading) => set({ isLoading: loading }),

  setInitialized: () => set({ isInitialized: true }),
}))
