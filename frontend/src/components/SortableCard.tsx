import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { CalendarDays } from 'lucide-react'

import type { Card, Priority } from '@/types'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'

const PRIORITY_STYLE: Record<Priority, { label: string; className: string }> = {
  low:    { label: '낮음', className: 'bg-gray-100 text-gray-500' },
  medium: { label: '보통', className: 'bg-blue-100 text-blue-600' },
  high:   { label: '높음', className: 'bg-orange-100 text-orange-600' },
  urgent: { label: '긴급', className: 'bg-red-100 text-red-600' },
}

// DragOverlay에서도 재사용하기 위해 분리
export function CardContent({ card }: { card: Card }) {
  return (
    <div className="space-y-2">
      {card.priority && (
        <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${PRIORITY_STYLE[card.priority].className}`}>
          {PRIORITY_STYLE[card.priority].label}
        </span>
      )}
      <p className="text-sm text-gray-800 leading-snug">{card.title}</p>
      {(card.due_date || card.assignee) && (
        <div className="flex items-center justify-between pt-1">
          {card.due_date ? <DueDate date={card.due_date} /> : <span />}
          {card.assignee && <AssigneeAvatar name={card.assignee.name} />}
        </div>
      )}
    </div>
  )
}

function DueDate({ date }: { date: string }) {
  const due = new Date(date)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const isOverdue = due < today
  const formatted = due.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })
  return (
    <span className={`flex items-center gap-0.5 text-[10px] ${isOverdue ? 'text-red-500' : 'text-muted-foreground'}`}>
      <CalendarDays size={10} />
      {formatted}
    </span>
  )
}

function AssigneeAvatar({ name }: { name: string }) {
  const initials = name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
  return (
    <Avatar size="sm" className="w-5 h-5 text-[9px]">
      <AvatarFallback>{initials}</AvatarFallback>
    </Avatar>
  )
}

interface Props {
  card: Card
  boardId: number
  onClick: () => void
}

export default function SortableCard({ card, boardId, onClick }: Props) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: `card-${card.id}`,
    data: { type: 'card', cardId: card.id, boardId },
  })

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      {...attributes}
      {...listeners}
      onClick={onClick}
      className={`bg-white rounded-lg p-3 shadow-sm cursor-grab active:cursor-grabbing hover:shadow-md transition-shadow ${
        isDragging ? 'opacity-40 shadow-lg' : ''
      }`}
    >
      <CardContent card={card} />
    </div>
  )
}
