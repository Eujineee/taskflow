import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from '@/components/ui/sonner'
import { useAuthStore } from '@/store/authStore'

// 페이지 컴포넌트들 (곧 만들 파일들)
import LoginPage from '@/pages/LoginPage'
import RegisterPage from '@/pages/RegisterPage'
import DashboardPage from '@/pages/DashboardPage'
import BoardPage from '@/pages/BoardPage'
import Layout from '@/components/layout/Layout'

// 로그인 안 했으면 /login으로 튕겨내는 보호 라우트
// Laravel의 auth 미들웨어랑 같은 개념
function PrivateRoute({ children }: { children: React.ReactNode }) {
  const token = useAuthStore((state) => state.token)
  return token ? <>{children}</> : <Navigate to="/login" replace />
}

// 이미 로그인했는데 /login 가면 대시보드로 보내는 라우트
function PublicRoute({ children }: { children: React.ReactNode }) {
  const token = useAuthStore((state) => state.token)
  return token ? <Navigate to="/dashboard" replace /> : <>{children}</>
}

export default function App() {
  return (
    // BrowserRouter: URL 변경을 감지하는 최상위 컴포넌트
    // Laravel의 Route::group() 같은 것
    <BrowserRouter>
      <Routes>
        {/* 루트 접속 시 대시보드로 리다이렉트 */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />

        {/* 비로그인 전용 페이지 */}
        <Route path="/login"    element={<PublicRoute><LoginPage /></PublicRoute>} />
        <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />

        {/* 로그인 필요한 페이지들 → Layout(사이드바+헤더) 안에 렌더링 */}
        <Route element={<PrivateRoute><Layout /></PrivateRoute>}>
          <Route path="/dashboard"               element={<DashboardPage />} />
          <Route path="/projects/:projectId"     element={<BoardPage />} />
        </Route>
      </Routes>

      {/* 알림 토스트: 어느 페이지에서든 표시 가능 */}
      <Toaster richColors position="top-right" />
    </BrowserRouter>
  )
}
