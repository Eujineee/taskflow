import { useState, useRef, useEffect } from 'react'
import { toast } from 'sonner'
import { Trash2, X, Tag } from 'lucide-react'

import { cardsApi } from '@/api'
import { useBoardStore } from '@/store/boardStore'
import type { Card, ProjectMember, Priority } from '@/types'

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface Props {
  card: Card
  boardId: number
  members: ProjectMember[]
  onClose: () => void
  onUpdate: (updated: Card) => void
}

const PRIORITIES: { value: Priority; label: string }[] = [
  { value: 'low',    label: '낮음' },
  { value: 'medium', label: '보통' },
  { value: 'high',   label: '높음' },
  { value: 'urgent', label: '긴급' },
]

const PRIORITY_COLOR: Record<Priority, string> = {
  low:    'bg-gray-100 text-gray-600 border-gray-200',
  medium: 'bg-blue-100 text-blue-700 border-blue-200',
  high:   'bg-orange-100 text-orange-700 border-orange-200',
  urgent: 'bg-red-100 text-red-700 border-red-200',
}

export default function CardDetailModal({ card, boardId, members, onClose, onUpdate }: Props) {
  const { updateCard, removeCard } = useBoardStore((s) => ({
    updateCard: s.updateCard,
    removeCard: s.removeCard,
  }))

  // 각 필드의 로컬 상태 (card를 초기값으로)
  const [title, setTitle]           = useState(card.title)
  const [description, setDescription] = useState(card.description ?? '')
  const [priority, setPriority]     = useState<Priority | ''>(card.priority ?? '')
  const [dueDate, setDueDate]       = useState(card.due_date ?? '')
  const [assigneeId, setAssigneeId] = useState<number | ''>(card.assignee_id ?? '')
  const [labels, setLabels]         = useState<string[]>(card.labels ?? [])
  const [newLabel, setNewLabel]     = useState('')
  const [isDeleting, setIsDeleting] = useState(false)

  const titleRef = useRef<HTMLInputElement>(null)

  // 모달 오픈 시 최신 카드 데이터 fetch
  useEffect(() => {
    cardsApi.get(boardId, card.id).then((fresh) => {
      setTitle(fresh.title)
      setDescription(fresh.description ?? '')
      setPriority(fresh.priority ?? '')
      setDueDate(fresh.due_date ?? '')
      setAssigneeId(fresh.assignee_id ?? '')
      setLabels(fresh.labels ?? [])
      updateCard(boardId, fresh)
      onUpdate(fresh)
    }).catch(() => {})
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // ── 공통 저장 함수 ──────────────────────────────────
  const save = async (patch: Parameters<typeof cardsApi.update>[2]) => {
    try {
      const updated = await cardsApi.update(boardId, card.id, patch)
      updateCard(boardId, updated)
      onUpdate(updated)
    } catch {
      toast.error('저장에 실패했습니다.')
    }
  }

  // ── 제목 저장 (blur / Enter) ──────────────────────
  const saveTitle = () => {
    if (!title.trim()) { setTitle(card.title); return }
    if (title.trim() === card.title) return
    save({ title: title.trim() })
  }

  // ── 설명 저장 (blur) ──────────────────────────────
  const saveDescription = () => {
    if (description === (card.description ?? '')) return
    save({ description })
  }

  // ── 우선순위 변경 ─────────────────────────────────
  const handlePriorityChange = (value: Priority | '') => {
    setPriority(value)
    save({ priority: value || undefined })
  }

  // ── 마감일 변경 ───────────────────────────────────
  const handleDueDateChange = (value: string) => {
    setDueDate(value)
    save({ due_date: value || undefined })
  }

  // ── 담당자 변경 ───────────────────────────────────
  const handleAssigneeChange = (value: string) => {
    const id = value === '' ? null : Number(value)
    setAssigneeId(value === '' ? '' : Number(value))
    save({ assignee_id: id })
  }

  // ── 라벨 추가 ─────────────────────────────────────
  const addLabel = () => {
    const trimmed = newLabel.trim()
    if (!trimmed || labels.includes(trimmed)) { setNewLabel(''); return }
    const next = [...labels, trimmed]
    setLabels(next)
    setNewLabel('')
    save({ labels: next })
  }

  // ── 라벨 삭제 ─────────────────────────────────────
  const removeLabel = (label: string) => {
    const next = labels.filter((l) => l !== label)
    setLabels(next)
    save({ labels: next })
  }

  // ── 카드 삭제 ─────────────────────────────────────
  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      await cardsApi.delete(boardId, card.id)
      removeCard(boardId, card.id)
      toast.success('카드가 삭제됐습니다.')
      onClose()
    } catch {
      toast.error('카드 삭제에 실패했습니다.')
      setIsDeleting(false)
    }
  }

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          {/* 제목 인라인 편집 */}
          <DialogTitle asChild>
            <input
              ref={titleRef}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={saveTitle}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); titleRef.current?.blur() } }}
              className="w-full text-lg font-semibold bg-transparent border-b border-transparent hover:border-gray-200 focus:border-gray-300 focus:outline-none px-0 py-0.5 transition-colors"
            />
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-2">

          {/* ── 왼쪽: 설명 ─────────────────────────────── */}
          <div className="sm:col-span-2 space-y-2">
            <Label className="text-xs text-muted-foreground uppercase tracking-wide">설명</Label>
            <Textarea
              placeholder="카드에 대한 설명을 입력하세요..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              onBlur={saveDescription}
              rows={5}
              className="resize-none text-sm"
            />
          </div>

          {/* ── 오른쪽: 속성들 ──────────────────────────── */}
          <div className="space-y-4">

            {/* 우선순위 */}
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground uppercase tracking-wide">우선순위</Label>
              <div className="flex flex-wrap gap-1.5">
                {/* 없음 버튼 */}
                <button
                  onClick={() => handlePriorityChange('')}
                  className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${
                    priority === ''
                      ? 'bg-gray-800 text-white border-gray-800'
                      : 'bg-white text-gray-500 border-gray-200 hover:border-gray-400'
                  }`}
                >
                  없음
                </button>
                {PRIORITIES.map((p) => (
                  <button
                    key={p.value}
                    onClick={() => handlePriorityChange(p.value)}
                    className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${
                      priority === p.value
                        ? PRIORITY_COLOR[p.value] + ' border-current font-medium'
                        : 'bg-white text-gray-500 border-gray-200 hover:border-gray-400'
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 마감일 */}
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground uppercase tracking-wide">마감일</Label>
              <Input
                type="date"
                value={dueDate}
                onChange={(e) => handleDueDateChange(e.target.value)}
                className="h-8 text-sm"
              />
            </div>

            {/* 담당자 */}
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground uppercase tracking-wide">담당자</Label>
              <select
                value={assigneeId}
                onChange={(e) => handleAssigneeChange(e.target.value)}
                className="w-full h-8 rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus:border-ring transition-colors"
              >
                <option value="">없음</option>
                {members.map((m) => (
                  <option key={m.id} value={m.id}>{m.name}</option>
                ))}
              </select>
            </div>

            {/* 라벨 */}
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground uppercase tracking-wide">라벨</Label>

              {/* 라벨 태그 목록 */}
              {labels.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-1.5">
                  {labels.map((label) => (
                    <span
                      key={label}
                      className="flex items-center gap-1 text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full"
                    >
                      <Tag size={9} />
                      {label}
                      <button
                        onClick={() => removeLabel(label)}
                        className="text-gray-400 hover:text-gray-600 ml-0.5"
                      >
                        <X size={10} />
                      </button>
                    </span>
                  ))}
                </div>
              )}

              {/* 라벨 추가 인풋 */}
              <div className="flex gap-1.5">
                <Input
                  placeholder="라벨 입력"
                  value={newLabel}
                  onChange={(e) => setNewLabel(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addLabel() } }}
                  className="h-7 text-xs"
                />
                <Button size="sm" variant="outline" className="h-7 text-xs px-2" onClick={addLabel}>
                  추가
                </Button>
              </div>
            </div>

          </div>
        </div>

        {/* 하단: 삭제 */}
        <div className="flex justify-end pt-4 border-t mt-4">
          <Button
            variant="destructive"
            size="sm"
            className="gap-1.5"
            onClick={handleDelete}
            disabled={isDeleting}
          >
            <Trash2 size={13} />
            {isDeleting ? '삭제 중...' : '카드 삭제'}
          </Button>
        </div>

      </DialogContent>
    </Dialog>
  )
}
