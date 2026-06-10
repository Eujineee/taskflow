import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from '@/components/ui/sonner'
import { useAuthStore } from '@/store/authStore'
import { useShallow } from 'zustand/react/shallow'
import { authApi } from '@/api'

import LoginPage from '@/pages/LoginPage'
import RegisterPage from '@/pages/RegisterPage'
import DashboardPage from '@/pages/DashboardPage'
import BoardPage from '@/pages/BoardPage'
import Layout from '@/components/layout/Layout'

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const token = useAuthStore((state) => state.token)
  return token ? <>{children}</> : <Navigate to="/login" replace />
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const token = useAuthStore((state) => state.token)
  return token ? <Navigate to="/dashboard" replace /> : <>{children}</>
}

export default function App() {
  const { token, isInitialized, setUser, setInitialized } = useAuthStore(
    useShallow((state) => ({
      token: state.token,
      isInitialized: state.isInitialized,
      setUser: state.setUser,
      setInitialized: state.setInitialized,
    }))
  )

  // 새로고침 시 localStorage 토큰으로 유저 정보 복원
  useEffect(() => {
    if (!token) {
      setInitialized()
      return
    }
    authApi.me()
      .then((user) => setUser(user))
      .catch(() => {}) // 401이면 interceptor가 토큰 제거 + /login 리다이렉트 처리
      .finally(() => setInitialized())
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  if (!isInitialized) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />

        <Route path="/login"    element={<PublicRoute><LoginPage /></PublicRoute>} />
        <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />

        <Route element={<PrivateRoute><Layout /></PrivateRoute>}>
          <Route path="/dashboard"               element={<DashboardPage />} />
          <Route path="/projects/:projectId"     element={<BoardPage />} />
        </Route>
      </Routes>

      <Toaster richColors position="top-right" />
    </BrowserRouter>
  )
}
