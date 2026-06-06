import { useState } from 'react'
import { toast } from 'sonner'
import { UserX } from 'lucide-react'

import { projectsApi } from '@/api'
import { useProjectStore } from '@/store/projectStore'
import { useAuthStore } from '@/store/authStore'
import type { Project, ProjectMember, MemberRole } from '@/types'

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const ROLE_OPTIONS: { value: MemberRole; label: string }[] = [
  { value: 'admin',  label: '관리자' },
  { value: 'member', label: '멤버' },
  { value: 'viewer', label: '뷰어' },
]

interface Props {
  project: Project
  onClose: () => void
}

export default function ProjectMembersModal({ project, onClose }: Props) {
  const [members, setMembers] = useState<ProjectMember[]>(project.members ?? [])
  const [email, setEmail] = useState('')
  const [role, setRole] = useState<MemberRole>('member')
  const [isInviting, setIsInviting] = useState(false)

  const updateProject = useProjectStore((s) => s.updateProject)
  const currentUser = useAuthStore((s) => s.user)

  const refresh = async () => {
    try {
      const updated = await projectsApi.get(project.id)
      updateProject(updated)
      setMembers(updated.members ?? [])
    } catch {
      toast.error('멤버 목록을 불러오지 못했습니다.')
    }
  }

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) return
    setIsInviting(true)
    try {
      await projectsApi.addMember(project.id, email.trim(), role)
      toast.success(`${email} 님을 초대했습니다.`)
      setEmail('')
      await refresh()
    } catch (err: any) {
      toast.error(err.response?.data?.message ?? '초대에 실패했습니다.')
    } finally {
      setIsInviting(false)
    }
  }

  const handleRoleChange = async (userId: number, newRole: string) => {
    try {
      await projectsApi.updateMember(project.id, userId, newRole)
      setMembers((prev) =>
        prev.map((m) =>
          m.id === userId ? { ...m, pivot: { ...m.pivot, role: newRole as MemberRole } } : m
        )
      )
    } catch {
      toast.error('역할 변경에 실패했습니다.')
    }
  }

  const handleRemove = async (userId: number, name: string) => {
    try {
      await projectsApi.removeMember(project.id, userId)
      setMembers((prev) => prev.filter((m) => m.id !== userId))
      toast.success(`${name} 님을 멤버에서 제거했습니다.`)
    } catch {
      toast.error('멤버 제거에 실패했습니다.')
    }
  }

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>프로젝트 멤버 ({members.length}명)</DialogTitle>
        </DialogHeader>

        {/* 멤버 목록 */}
        <div className="space-y-1 mt-2 max-h-72 overflow-y-auto">
          {members.map((member) => {
            const isOwner = member.id === project.owner_id
            const isSelf = member.id === currentUser?.id
            return (
              <div
                key={member.id}
                className="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-gray-50"
              >
                {/* 아바타 이니셜 */}
                <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-semibold text-gray-600 flex-shrink-0">
                  {member.name.charAt(0).toUpperCase()}
                </div>

                {/* 이름/이메일 */}
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">
                    {member.name}
                    {isSelf && (
                      <span className="ml-1 text-xs text-muted-foreground">(나)</span>
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground truncate">{member.email}</div>
                </div>

                {/* 역할 */}
                {isOwner ? (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 flex-shrink-0">
                    소유자
                  </span>
                ) : (
                  <select
                    value={member.pivot.role}
                    onChange={(e) => handleRoleChange(member.id, e.target.value)}
                    disabled={isSelf}
                    className="text-xs border rounded-md px-1.5 py-1 bg-white outline-none focus:ring-1 focus:ring-blue-300 flex-shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {ROLE_OPTIONS.map((r) => (
                      <option key={r.value} value={r.value}>{r.label}</option>
                    ))}
                  </select>
                )}

                {/* 제거 버튼 */}
                {!isOwner && !isSelf && (
                  <button
                    onClick={() => handleRemove(member.id, member.name)}
                    className="text-gray-300 hover:text-red-500 transition-colors flex-shrink-0"
                    title={`${member.name} 제거`}
                  >
                    <UserX size={15} />
                  </button>
                )}
              </div>
            )
          })}
        </div>

        {/* 초대 섹션 */}
        <div className="border-t pt-4 mt-2">
          <Label className="text-sm font-medium mb-3 block">멤버 초대</Label>
          <form onSubmit={handleInvite} className="flex gap-2">
            <Input
              type="email"
              placeholder="이메일 주소"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1 h-8 text-sm"
            />
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as MemberRole)}
              className="border rounded-md px-2 text-sm outline-none focus:ring-1 focus:ring-blue-300 h-8 bg-white"
            >
              {ROLE_OPTIONS.map((r) => (
                <option key={r.value} value={r.value}>{r.label}</option>
              ))}
            </select>
            <Button
              type="submit"
              size="sm"
              className="h-8 text-xs flex-shrink-0"
              disabled={isInviting || !email.trim()}
            >
              {isInviting ? '초대 중...' : '초대'}
            </Button>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  )
}
