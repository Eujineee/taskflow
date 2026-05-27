import { useEffect } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'
import { LayoutDashboard, Plus, LogOut, FolderKanban } from 'lucide-react'

import { authApi, projectsApi } from '@/api'
import { useAuthStore } from '@/store/authStore'
import { useProjectStore } from '@/store/projectStore'

import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'

export default function Sidebar() {
  const navigate = useNavigate()
  // URL의 :projectId 파라미터 읽기 → 현재 어떤 프로젝트 보고 있는지
  const { projectId } = useParams()

  // 스토어에서 필요한 값/함수 꺼내오기
  const { user, logout } = useAuthStore((state) => ({
    user: state.user,
    logout: state.logout,
  }))
  const { projects, setProjects, isLoading, setLoading } = useProjectStore((state) => ({
    projects: state.projects,
    setProjects: state.setProjects,
    isLoading: state.isLoading,
    setLoading: state.setLoading,
  }))

  // ── 마운트 시 프로젝트 목록 불러오기 ────────────────
  // useEffect: 컴포넌트가 화면에 처음 나타날 때 실행
  // PHP의 __construct() 같은 느낌
  // 두 번째 인자 [] → 딱 한 번만 실행 (빈 배열 = 의존성 없음)
  useEffect(() => {
    const fetchProjects = async () => {
      setLoading(true)
      try {
        const data = await projectsApi.list()
        setProjects(data)
      } catch {
        toast.error('프로젝트 목록을 불러오지 못했습니다.')
      } finally {
        setLoading(false)
      }
    }
    fetchProjects()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // ── 로그아웃 ─────────────────────────────────────────
  const handleLogout = async () => {
    try {
      await authApi.logout()
    } catch {
      // 서버 에러여도 로컬에서 로그아웃 처리
    }
    logout()          // 스토어 초기화 + localStorage 토큰 제거
    navigate('/login')
  }

  return (
    <aside className="w-60 h-full bg-white border-r flex flex-col">

      {/* 로고 영역 */}
      <div className="p-4 border-b">
        <h1 className="text-lg font-bold text-gray-900">TaskFlow</h1>
        {/* user가 null일 수 있어서 ?. 옵셔널 체이닝 사용 */}
        <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
      </div>

      {/* 내비게이션 */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">

        {/* 대시보드 링크 */}
        <Link
          to="/dashboard"
          className="flex items-center gap-2 px-3 py-2 rounded-md text-sm hover:bg-gray-100 text-gray-700"
        >
          <LayoutDashboard size={16} />
          대시보드
        </Link>

        <Separator className="my-2" />

        {/* 프로젝트 목록 */}
        <p className="px-3 py-1 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          프로젝트
        </p>

        {isLoading ? (
          // 로딩 중 스켈레톤
          <div className="space-y-1">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-8 bg-gray-100 rounded-md animate-pulse mx-1" />
            ))}
          </div>
        ) : (
          projects.map((project) => (
            <Link
              key={project.id}
              to={`/projects/${project.id}`}
              className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm hover:bg-gray-100 truncate ${
                // 현재 보고 있는 프로젝트면 하이라이트
                projectId === String(project.id)
                  ? 'bg-gray-100 font-medium text-gray-900'
                  : 'text-gray-700'
              }`}
            >
              {/* 프로젝트 컬러 점 */}
              <span
                className="w-2 h-2 rounded-full flex-shrink-0"
                style={{ backgroundColor: project.color ?? '#94a3b8' }}
              />
              <FolderKanban size={14} className="flex-shrink-0 text-muted-foreground" />
              <span className="truncate">{project.name}</span>
            </Link>
          ))
        )}

        {/* 새 프로젝트 버튼 */}
        <Link to="/dashboard">
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start gap-2 text-muted-foreground hover:text-gray-900"
          >
            <Plus size={16} />
            새 프로젝트
          </Button>
        </Link>
      </nav>

      {/* 하단 로그아웃 */}
      <div className="p-3 border-t">
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start gap-2 text-muted-foreground"
          onClick={handleLogout}
        >
          <LogOut size={16} />
          로그아웃
        </Button>
      </div>
    </aside>
  )
}
