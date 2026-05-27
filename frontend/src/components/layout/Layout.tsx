import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'

export default function Layout() {
  return (
    // 전체 화면을 가로로 나눔: 왼쪽 사이드바 + 오른쪽 메인 콘텐츠
    <div className="flex h-screen bg-gray-50 overflow-hidden">

      {/* 왼쪽 사이드바 */}
      <Sidebar />

      {/* 오른쪽 메인 영역 */}
      <main className="flex-1 overflow-auto">
        {/* Outlet: 현재 URL에 맞는 페이지 컴포넌트가 여기 들어옴
            /dashboard → DashboardPage
            /projects/1 → BoardPage
            Laravel의 @yield('content') 와 동일한 개념 */}
        <Outlet />
      </main>
    </div>
  )
}
