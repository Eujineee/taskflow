import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, FolderKanban, Users } from 'lucide-react'
import { toast } from 'sonner'

import { projectsApi } from '@/api'
import { useProjectStore } from '@/store/projectStore'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

// 프로젝트 색상 선택지
const PROJECT_COLORS = [
  '#ef4444', '#f97316', '#eab308', '#22c55e',
  '#14b8a6', '#3b82f6', '#8b5cf6', '#ec4899',
]

export default function DashboardPage() {
  const navigate = useNavigate()

  // 스토어에서 프로젝트 목록과 추가 함수 가져오기
  const { projects, addProject } = useProjectStore((state) => ({
    projects: state.projects,
    addProject: state.addProject,
  }))

  // ── 모달 상태 ────────────────────────────────────────
  // 모달 열림/닫힘, 폼 입력값들
  const [isOpen, setIsOpen] = useState(false)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [color, setColor] = useState(PROJECT_COLORS[5]) // 기본: 파란색
  const [isLoading, setIsLoading] = useState(false)

  // ── 모달 닫기 + 초기화 ──────────────────────────────
  const handleClose = () => {
    setIsOpen(false)
    setName('')
    setDescription('')
    setColor(PROJECT_COLORS[5])
  }

  // ── 프로젝트 생성 ────────────────────────────────────
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return

    setIsLoading(true)
    try {
      const newProject = await projectsApi.create({ name, description, color })
      // 스토어에 추가 → 사이드바 + 대시보드 목록 자동 갱신
      addProject(newProject)
      toast.success(`"${newProject.name}" 프로젝트가 생성됐습니다!`)
      handleClose()
      // 만든 프로젝트 보드로 바로 이동
      navigate(`/projects/${newProject.id}`)
    } catch {
      toast.error('프로젝트 생성에 실패했습니다.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="p-8">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">내 프로젝트</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {projects.length}개의 프로젝트
          </p>
        </div>
        <Button onClick={() => setIsOpen(true)} className="gap-2">
          <Plus size={16} />
          새 프로젝트
        </Button>
      </div>

      {/* 프로젝트가 없을 때 빈 화면 */}
      {projects.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <FolderKanban size={48} className="text-muted-foreground mb-4" />
          <h2 className="text-lg font-medium text-gray-900 mb-1">프로젝트가 없어요</h2>
          <p className="text-sm text-muted-foreground mb-4">
            새 프로젝트를 만들어서 팀과 함께 작업해보세요
          </p>
          <Button onClick={() => setIsOpen(true)} variant="outline" className="gap-2">
            <Plus size={16} />
            첫 프로젝트 만들기
          </Button>
        </div>
      ) : (
        // 프로젝트 카드 그리드
        // grid-cols-3 → 한 줄에 3개. 화면 좁아지면 2개, 더 좁으면 1개
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((project) => (
            // 카드 클릭 → 해당 프로젝트 보드로 이동
            <Card
              key={project.id}
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => navigate(`/projects/${project.id}`)}
            >
              <CardHeader className="pb-2">
                <div className="flex items-center gap-3">
                  {/* 프로젝트 컬러 원형 아이콘 */}
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: project.color ?? '#3b82f6' }}
                  >
                    <FolderKanban size={18} className="text-white" />
                  </div>
                  <div className="min-w-0">
                    <CardTitle className="text-base truncate">{project.name}</CardTitle>
                    {/* members 있으면 멤버 수 표시 */}
                    {project.members && (
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Users size={11} />
                        {project.members.length}명
                      </div>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-sm line-clamp-2">
                  {project.description ?? '설명 없음'}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* ── 새 프로젝트 모달 ─────────────────────────────── */}
      {/* open: 모달 표시 여부 / onOpenChange: 닫기 버튼 클릭 시 */}
      <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>새 프로젝트 만들기</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleCreate} className="space-y-4">
            <div className="space-y-1">
              <Label htmlFor="project-name">프로젝트 이름 *</Label>
              <Input
                id="project-name"
                placeholder="예: 쇼핑몰 리뉴얼"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                autoFocus
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="project-desc">설명 (선택)</Label>
              <Textarea
                id="project-desc"
                placeholder="프로젝트에 대한 간단한 설명"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
              />
            </div>

            {/* 색상 선택 */}
            <div className="space-y-2">
              <Label>색상</Label>
              <div className="flex gap-2">
                {PROJECT_COLORS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    className="w-7 h-7 rounded-full transition-transform hover:scale-110"
                    style={{ backgroundColor: c }}
                    onClick={() => setColor(c)}
                  >
                    {/* 선택된 색상엔 흰 체크 표시 */}
                    {color === c && (
                      <span className="flex items-center justify-center text-white text-xs font-bold">✓</span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleClose}>
                취소
              </Button>
              <Button type="submit" disabled={isLoading || !name.trim()}>
                {isLoading ? '생성 중...' : '만들기'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
