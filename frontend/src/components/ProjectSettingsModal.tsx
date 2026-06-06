import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'

import { projectsApi } from '@/api'
import { useProjectStore } from '@/store/projectStore'
import type { Project } from '@/types'

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

const PROJECT_COLORS = [
  '#ef4444', '#f97316', '#eab308', '#22c55e',
  '#14b8a6', '#3b82f6', '#8b5cf6', '#ec4899',
]

interface Props {
  project: Project
  onClose: () => void
}

export default function ProjectSettingsModal({ project, onClose }: Props) {
  const navigate = useNavigate()
  const { updateProject, removeProject } = useProjectStore((s) => ({
    updateProject: s.updateProject,
    removeProject: s.removeProject,
  }))

  const [name, setName] = useState(project.name)
  const [description, setDescription] = useState(project.description ?? '')
  const [color, setColor] = useState(project.color ?? PROJECT_COLORS[5])
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    setIsSaving(true)
    try {
      const updated = await projectsApi.update(project.id, {
        name: name.trim(),
        description: description || undefined,
        color,
      })
      updateProject(updated)
      toast.success('프로젝트 설정이 저장됐습니다.')
      onClose()
    } catch {
      toast.error('저장에 실패했습니다.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      await projectsApi.delete(project.id)
      removeProject(project.id)
      toast.success(`"${project.name}" 프로젝트가 삭제됐습니다.`)
      navigate('/dashboard')
    } catch {
      toast.error('삭제에 실패했습니다.')
      setIsDeleting(false)
    }
  }

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>프로젝트 설정</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSave} className="space-y-4">
          <div className="space-y-1">
            <Label htmlFor="settings-name">프로젝트 이름 *</Label>
            <Input
              id="settings-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              autoFocus
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor="settings-desc">설명</Label>
            <Textarea
              id="settings-desc"
              placeholder="프로젝트에 대한 간단한 설명"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>

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
                  {color === c && (
                    <span className="flex items-center justify-center text-white text-xs font-bold">✓</span>
                  )}
                </button>
              ))}
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>취소</Button>
            <Button type="submit" disabled={isSaving || !name.trim()}>
              {isSaving ? '저장 중...' : '저장'}
            </Button>
          </DialogFooter>
        </form>

        {/* 위험 구역 */}
        <div className="border-t pt-4 mt-2">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">위험 구역</p>
          {!confirmDelete ? (
            <Button
              variant="outline"
              size="sm"
              className="text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300"
              onClick={() => setConfirmDelete(true)}
            >
              프로젝트 삭제
            </Button>
          ) : (
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm text-red-600">정말 삭제하시겠습니까?</span>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleDelete}
                disabled={isDeleting}
              >
                {isDeleting ? '삭제 중...' : '삭제'}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setConfirmDelete(false)}
              >
                취소
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
