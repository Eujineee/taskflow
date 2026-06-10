import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useShallow } from 'zustand/react/shallow'
import { Plus, FolderKanban, Users } from 'lucide-react'
import { toast } from 'sonner'

import { projectsApi } from '@/api'
import { useProjectStore } from '@/store/projectStore'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent } from '@/components/ui/dialog'
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
  const { projects, addProject } = useProjectStore(
    useShallow((state) => ({ projects: state.projects, addProject: state.addProject }))
  )

  // ── 모달 상태 ────────────────────────────────────────
  // 모달 열림/닫힘, 폼 입력값들
  const [isOpen, setIsOpen] = useState(false)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [color, setColor] = useState(PROJECT_COLORS[5]) // 기본: 파란색
  const isSubmitting = useRef(false)

  const handleClose = () => {
    setIsOpen(false)
    setName('')
    setDescription('')
    setColor(PROJECT_COLORS[5])
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || isSubmitting.current) return

    isSubmitting.current = true

    // API 호출 전 즉시 닫아서 재클릭 원천 차단
    const payload = { name: name.trim(), description, color }
    handleClose()

    try {
      const newProject = await projectsApi.create(payload)
      addProject(newProject)
      toast.success(`"${newProject.name}" 프로젝트가 생성됐습니다!`)
      navigate(`/projects/${newProject.id}`)
    } catch {
      toast.error('프로젝트 생성에 실패했습니다.')
    } finally {
      isSubmitting.current = false
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

      <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
        <DialogContent className="sm:max-w-md p-0 overflow-hidden">
          {/* 컬러 헤더 */}
          <div
            className="h-24 flex items-end px-6 pb-4 transition-colors duration-200"
            style={{ backgroundColor: color }}
          >
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <FolderKanban size={20} className="text-white" />
            </div>
          </div>

          <form onSubmit={handleCreate} className="px-6 pb-6 pt-4 space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="project-name" className="text-sm font-medium">프로젝트 이름</Label>
              <Input
                id="project-name"
                placeholder="예: 쇼핑몰 리뉴얼"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                autoFocus
                className="h-10"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="project-desc" className="text-sm font-medium">설명 <span className="text-muted-foreground font-normal">(선택)</span></Label>
              <Textarea
                id="project-desc"
                placeholder="어떤 프로젝트인지 간단히 설명해주세요"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
                className="resize-none text-sm"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">색상</Label>
              <div className="flex gap-2">
                {PROJECT_COLORS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setColor(c)}
                    className="w-7 h-7 rounded-lg transition-all hover:scale-110 flex items-center justify-center"
                    style={{ backgroundColor: c, outline: color === c ? `2px solid ${c}` : 'none', outlineOffset: '2px' }}
                  >
                    {color === c && <span className="text-white text-xs font-bold">✓</span>}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-2 pt-1">
              <Button type="button" variant="outline" onClick={handleClose} className="flex-1">
                취소
              </Button>
              <Button
                type="submit"
                disabled={!name.trim()}
                className="flex-1 text-white"
                style={{ backgroundColor: color }}
              >
                프로젝트 만들기
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
