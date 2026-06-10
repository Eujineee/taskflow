import { useEffect, useRef, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { Plus, Trash2, Pencil, Check, X, GripVertical, Settings, Users } from 'lucide-react'
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
  useDroppable,
  type DragStartEvent,
  type DragOverEvent,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  useSortable,
  arrayMove,
  horizontalListSortingStrategy,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

import { boardsApi, cardsApi, projectsApi } from '@/api'
import { useBoardStore } from '@/store/boardStore'
import { useProjectStore } from '@/store/projectStore'
import { useShallow } from 'zustand/react/shallow'
import type { Board, Card } from '@/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import SortableCard, { CardContent } from '@/components/SortableCard'
import CardDetailModal from '@/components/CardDetailModal'
import ProjectSettingsModal from '@/components/ProjectSettingsModal'
import ProjectMembersModal from '@/components/ProjectMembersModal'

// ── 컬럼 카드 영역: 빈 컬럼에도 드롭 가능하게 ─────────────
function CardDropZone({ boardId }: { boardId: number }) {
  const { setNodeRef, isOver } = useDroppable({
    id: `zone-${boardId}`,
    data: { type: 'zone', boardId },
  })
  return (
    <div
      ref={setNodeRef}
      className={`min-h-2 rounded-lg transition-colors ${isOver ? 'bg-blue-100/60' : ''}`}
    />
  )
}

// ── 정렬 가능한 컬럼 ─────────────────────────────────────
function SortableColumn({
  board,
  children,
  onRename,
  onDelete,
}: {
  board: Board
  children: React.ReactNode
  onRename: () => void
  onDelete: () => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: `board-${board.id}`,
    data: { type: 'board', boardId: board.id },
  })

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={`w-72 flex-shrink-0 bg-gray-100 rounded-xl flex flex-col ${isDragging ? 'opacity-50' : ''}`}
    >
      <div className="flex items-center gap-1 px-3 py-3">
        {/* 컬럼 드래그 핸들 */}
        <button
          {...attributes}
          {...listeners}
          className="text-gray-300 hover:text-gray-500 cursor-grab active:cursor-grabbing flex-shrink-0"
        >
          <GripVertical size={14} />
        </button>
        <span className="font-medium text-sm text-gray-800 flex-1 truncate">{board.name}</span>
        <span className="text-xs text-muted-foreground bg-white rounded-full px-2 py-0.5 flex-shrink-0">
          {board.cards?.length ?? 0}
        </span>
        <button onClick={onRename} className="text-gray-400 hover:text-gray-600">
          <Pencil size={13} />
        </button>
        <button onClick={onDelete} className="text-gray-400 hover:text-red-500 transition-colors">
          <Trash2 size={13} />
        </button>
      </div>
      {children}
    </div>
  )
}

export default function BoardPage() {
  const { projectId } = useParams<{ projectId: string }>()
  const navigate = useNavigate()

  const {
    boards, isLoading,
    setBoards, setCards, setLoading,
    addBoard, updateBoard, removeBoard,
    addCard, moveCard,
  } = useBoardStore(
    useShallow((s) => ({
      boards: s.boards,
      isLoading: s.isLoading,
      setBoards: s.setBoards,
      setCards: s.setCards,
      setLoading: s.setLoading,
      addBoard: s.addBoard,
      updateBoard: s.updateBoard,
      removeBoard: s.removeBoard,
      addCard: s.addCard,
      moveCard: s.moveCard,
    }))
  )

  const { currentProject, setCurrentProject } = useProjectStore(
    useShallow((s) => ({ currentProject: s.currentProject, setCurrentProject: s.setCurrentProject }))
  )

  // ── 컬럼 편집 상태 ───────────────────────────────────
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editingName, setEditingName] = useState('')
  const editInputRef = useRef<HTMLInputElement>(null)

  const [isAddingBoard, setIsAddingBoard] = useState(false)
  const [newBoardName, setNewBoardName] = useState('')
  const addBoardInputRef = useRef<HTMLInputElement>(null)

  // ── 카드 추가 상태 ───────────────────────────────────
  const [addingCardBoardId, setAddingCardBoardId] = useState<number | null>(null)
  const [newCardTitle, setNewCardTitle] = useState('')
  const addCardInputRef = useRef<HTMLInputElement>(null)

  // ── 카드 상세 모달 상태 ──────────────────────────────
  const [selectedCard, setSelectedCard] = useState<{ card: Card; boardId: number } | null>(null)

  // ── 프로젝트 모달 상태 ──────────────────────────────
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [isMembersOpen, setIsMembersOpen] = useState(false)

  // ── 드래그 상태 ──────────────────────────────────────
  const [activeCard, setActiveCard] = useState<Card | null>(null)
  const dragOriginBoardId = useRef<number | null>(null)
  const dragCurrentBoardId = useRef<number | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  )

  useEffect(() => { if (editingId !== null) editInputRef.current?.focus() }, [editingId])
  useEffect(() => { if (isAddingBoard) addBoardInputRef.current?.focus() }, [isAddingBoard])
  useEffect(() => { if (addingCardBoardId !== null) addCardInputRef.current?.focus() }, [addingCardBoardId])

  // ── 초기 데이터 로드 ─────────────────────────────────
  useEffect(() => {
    if (!projectId) return
    const id = Number(projectId)
    if (isNaN(id)) { navigate('/dashboard'); return }

    const load = async () => {
      setLoading(true)
      try {
        const [project, boardList] = await Promise.all([
          projectsApi.get(id),
          boardsApi.list(id),
        ])
        setCurrentProject(project)
        setBoards(boardList)
        await Promise.all(boardList.map(async (board) => {
          const cards = await cardsApi.list(board.id)
          setCards(board.id, cards)
        }))
      } catch {
        toast.error('보드를 불러오지 못했습니다.')
        navigate('/dashboard')
      } finally {
        setLoading(false)
      }
    }

    load()
    return () => setCurrentProject(null)
  }, [projectId]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── 컬럼 이름 저장 ───────────────────────────────────
  const saveEdit = async () => {
    if (!editingId || !editingName.trim()) { setEditingId(null); return }
    try {
      const updated = await boardsApi.update(Number(projectId), editingId, { name: editingName.trim() })
      updateBoard(updated)
    } catch {
      toast.error('컬럼 이름 수정에 실패했습니다.')
    } finally {
      setEditingId(null)
    }
  }

  const handleDeleteBoard = async (boardId: number) => {
    try {
      await boardsApi.delete(Number(projectId), boardId)
      removeBoard(boardId)
      toast.success('컬럼이 삭제됐습니다.')
    } catch {
      toast.error('컬럼 삭제에 실패했습니다.')
    }
  }

  const handleAddBoard = async () => {
    if (!newBoardName.trim()) { setIsAddingBoard(false); return }
    try {
      const board = await boardsApi.create(Number(projectId), { name: newBoardName.trim() })
      addBoard(board)
      setNewBoardName('')
      setIsAddingBoard(false)
    } catch {
      toast.error('컬럼 추가에 실패했습니다.')
    }
  }

  const handleAddCard = async (boardId: number) => {
    if (!newCardTitle.trim()) { setAddingCardBoardId(null); return }
    try {
      const card = await cardsApi.create(boardId, { title: newCardTitle.trim() })
      addCard(boardId, card)
      setNewCardTitle('')
      addCardInputRef.current?.focus()
    } catch {
      toast.error('카드 추가에 실패했습니다.')
    }
  }

  // ── DnD 핸들러 ───────────────────────────────────────
  const handleDragStart = ({ active }: DragStartEvent) => {
    const data = active.data.current
    if (data?.type === 'card') {
      const board = boards.find((b) => b.id === data.boardId)
      const card = board?.cards?.find((c) => c.id === data.cardId) ?? null
      setActiveCard(card)
      dragOriginBoardId.current = data.boardId
      dragCurrentBoardId.current = data.boardId
    }
  }

  const handleDragOver = ({ active, over }: DragOverEvent) => {
    if (!over) return
    const activeData = active.data.current
    if (activeData?.type !== 'card') return

    const fromBoardId = dragCurrentBoardId.current!

    // over가 카드인지 zone인지 파악해서 목표 boardId 결정
    let toBoardId: number
    if (over.data.current?.type === 'card') {
      toBoardId = over.data.current.boardId
    } else if (over.data.current?.type === 'zone') {
      toBoardId = over.data.current.boardId
    } else {
      return
    }

    if (fromBoardId === toBoardId) return  // 같은 컬럼 → sortable이 알아서 처리

    // 다른 컬럼으로 이동: 스토어에서 낙관적 업데이트
    const cardId = activeData.cardId
    const toCards = boards.find((b) => b.id === toBoardId)?.cards ?? []

    let insertAt = toCards.length
    if (over.data.current?.type === 'card') {
      const idx = toCards.findIndex((c) => c.id === over.data.current!.cardId)
      if (idx !== -1) insertAt = idx
    }

    moveCard(cardId, fromBoardId, toBoardId, insertAt)
    dragCurrentBoardId.current = toBoardId
  }

  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    setActiveCard(null)

    if (!over) {
      dragOriginBoardId.current = null
      dragCurrentBoardId.current = null
      return
    }

    const activeData = active.data.current

    // ── 컬럼 순서 변경 ──────────────────────────────
    if (activeData?.type === 'board') {
      const oldIdx = boards.findIndex((b) => `board-${b.id}` === active.id)
      const newIdx = boards.findIndex((b) => `board-${b.id}` === over.id)
      if (oldIdx !== -1 && newIdx !== -1 && oldIdx !== newIdx) {
        const newBoards = arrayMove(boards, oldIdx, newIdx)
        setBoards(newBoards)
        boardsApi.reorder(Number(projectId), newBoards.map((b) => b.id)).catch(() => {
          setBoards(boards)
          toast.error('컬럼 순서 저장에 실패했습니다.')
        })
      }
      return
    }

    // ── 카드 이동/순서 변경 ──────────────────────────
    if (activeData?.type === 'card') {
      const cardId = activeData.cardId
      const originBoardId = dragOriginBoardId.current!
      const finalBoardId = dragCurrentBoardId.current!

      if (originBoardId === finalBoardId) {
        // 같은 컬럼 내 순서 변경
        const cards = boards.find((b) => b.id === finalBoardId)?.cards ?? []
        const overCardId = over.data.current?.cardId
        if (!overCardId || overCardId === cardId) {
          dragOriginBoardId.current = null
          dragCurrentBoardId.current = null
          return
        }
        const oldIdx = cards.findIndex((c) => c.id === cardId)
        const newIdx = cards.findIndex((c) => c.id === overCardId)
        if (oldIdx !== -1 && newIdx !== -1 && oldIdx !== newIdx) {
          const newCards = arrayMove(cards, oldIdx, newIdx)
          setCards(finalBoardId, newCards)
          cardsApi.reorder(finalBoardId, newCards.map((c) => c.id)).catch(() => {
            setCards(finalBoardId, cards)
            toast.error('카드 순서 저장에 실패했습니다.')
          })
        }
      } else {
        // 다른 컬럼으로 이동 (스토어는 onDragOver에서 이미 업데이트)
        const finalCards = boards.find((b) => b.id === finalBoardId)?.cards ?? []
        const position = finalCards.findIndex((c) => c.id === cardId)
        cardsApi.move(originBoardId, cardId, {
          target_board_id: finalBoardId,
          position: position === -1 ? finalCards.length : position,
        }).catch(() => {
          toast.error('카드 이동 저장에 실패했습니다.')
        })
      }
    }

    dragOriginBoardId.current = null
    dragCurrentBoardId.current = null
  }

  // ── 로딩 스켈레톤 ────────────────────────────────────
  if (isLoading) {
    return (
      <div className="flex gap-4 p-6 overflow-x-auto h-full">
        {[1, 2, 3].map((i) => (
          <div key={i} className="w-72 flex-shrink-0 bg-gray-100 rounded-xl p-4 animate-pulse">
            <div className="h-5 bg-gray-200 rounded w-24 mb-4" />
            <div className="space-y-2">
              {[1, 2, 3].map((j) => <div key={j} className="h-16 bg-gray-200 rounded-lg" />)}
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <>
      <div className="flex flex-col h-full">
        {/* 헤더 */}
        <div className="px-6 py-4 border-b bg-white flex items-center gap-3 flex-shrink-0">
          {currentProject?.color && (
            <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: currentProject.color }} />
          )}
          <h1 className="text-lg font-semibold text-gray-900">{currentProject?.name ?? '...'}</h1>
          <span className="text-sm text-muted-foreground">{boards.length}개 컬럼</span>

          <div className="ml-auto flex items-center gap-1">
            <button
              onClick={() => setIsMembersOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm text-muted-foreground hover:text-gray-700 hover:bg-gray-100 transition-colors"
            >
              <Users size={15} />
              멤버
            </button>
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm text-muted-foreground hover:text-gray-700 hover:bg-gray-100 transition-colors"
            >
              <Settings size={15} />
              설정
            </button>
          </div>
        </div>

        {/* 칸반 영역 */}
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
        >
          <SortableContext items={boards.map((b) => `board-${b.id}`)} strategy={horizontalListSortingStrategy}>
            <div className="flex gap-4 p-6 overflow-x-auto flex-1 items-start">

              {boards.map((board) => (
                <SortableColumn
                  key={board.id}
                  board={board}
                  onRename={() => { setEditingId(board.id); setEditingName(board.name) }}
                  onDelete={() => handleDeleteBoard(board.id)}
                >
                  {/* 컬럼 이름 편집 */}
                  {editingId === board.id && (
                    <div className="flex items-center gap-2 px-3 pb-2">
                      <Input
                        ref={editInputRef}
                        value={editingName}
                        onChange={(e) => setEditingName(e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter') saveEdit(); if (e.key === 'Escape') setEditingId(null) }}
                        className="h-7 text-sm flex-1 bg-white"
                      />
                      <button onClick={saveEdit} className="text-green-600 hover:text-green-700"><Check size={15} /></button>
                      <button onClick={() => setEditingId(null)} className="text-gray-400"><X size={15} /></button>
                    </div>
                  )}

                  {/* 카드 목록 */}
                  <SortableContext
                    items={(board.cards ?? []).map((c) => `card-${c.id}`)}
                    strategy={verticalListSortingStrategy}
                  >
                    <div className="flex flex-col gap-2 px-3 pb-2 min-h-[2rem]">
                      {(board.cards ?? []).map((card) => (
                        <SortableCard
                          key={card.id}
                          card={card}
                          boardId={board.id}
                          onClick={() => setSelectedCard({ card, boardId: board.id })}
                        />
                      ))}
                      <CardDropZone boardId={board.id} />
                    </div>
                  </SortableContext>

                  {/* 카드 빠른 추가 */}
                  <div className="px-3 pb-3">
                    {addingCardBoardId === board.id ? (
                      <div className="flex flex-col gap-2 mt-1">
                        <Input
                          ref={addCardInputRef}
                          placeholder="카드 제목 입력"
                          value={newCardTitle}
                          onChange={(e) => setNewCardTitle(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleAddCard(board.id)
                            if (e.key === 'Escape') { setAddingCardBoardId(null); setNewCardTitle('') }
                          }}
                          className="h-8 text-sm bg-white"
                        />
                        <div className="flex gap-2">
                          <Button size="sm" className="h-7 text-xs flex-1" onClick={() => handleAddCard(board.id)}>추가</Button>
                          <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => { setAddingCardBoardId(null); setNewCardTitle('') }}>
                            <X size={14} />
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => { setAddingCardBoardId(board.id); setNewCardTitle('') }}
                        className="w-full flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-xs text-muted-foreground hover:text-gray-700 hover:bg-white transition-colors mt-1"
                      >
                        <Plus size={13} />
                        카드 추가
                      </button>
                    )}
                  </div>
                </SortableColumn>
              ))}

              {/* 컬럼 추가 */}
              <div className="w-72 flex-shrink-0">
                {isAddingBoard ? (
                  <div className="bg-gray-100 rounded-xl p-3 flex flex-col gap-2">
                    <Input
                      ref={addBoardInputRef}
                      placeholder="컬럼 이름 입력"
                      value={newBoardName}
                      onChange={(e) => setNewBoardName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleAddBoard()
                        if (e.key === 'Escape') { setIsAddingBoard(false); setNewBoardName('') }
                      }}
                      className="h-8 text-sm bg-white"
                    />
                    <div className="flex gap-2">
                      <Button size="sm" className="h-7 text-xs flex-1" onClick={handleAddBoard}>추가</Button>
                      <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => { setIsAddingBoard(false); setNewBoardName('') }}>
                        <X size={14} />
                      </Button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setIsAddingBoard(true)}
                    className="w-full flex items-center gap-2 px-4 py-3 rounded-xl bg-gray-100/60 hover:bg-gray-100 text-sm text-muted-foreground hover:text-gray-700 transition-colors"
                  >
                    <Plus size={15} />
                    컬럼 추가
                  </button>
                )}
              </div>

            </div>
          </SortableContext>

          {/* 드래그 중 커서를 따라다니는 카드 오버레이 */}
          <DragOverlay>
            {activeCard && (
              <div className="bg-white rounded-lg p-3 shadow-xl ring-2 ring-blue-400/40 rotate-1 w-72">
                <CardContent card={activeCard} />
              </div>
            )}
          </DragOverlay>
        </DndContext>
      </div>

      {/* 카드 상세 모달 */}
      {selectedCard && (
        <CardDetailModal
          card={selectedCard.card}
          boardId={selectedCard.boardId}
          members={currentProject?.members ?? []}
          onClose={() => setSelectedCard(null)}
          onUpdate={(updated) => setSelectedCard((prev) => prev ? { ...prev, card: updated } : null)}
        />
      )}

      {/* 프로젝트 설정 모달 */}
      {isSettingsOpen && currentProject && (
        <ProjectSettingsModal
          project={currentProject}
          onClose={() => setIsSettingsOpen(false)}
        />
      )}

      {/* 프로젝트 멤버 모달 */}
      {isMembersOpen && currentProject && (
        <ProjectMembersModal
          project={currentProject}
          onClose={() => setIsMembersOpen(false)}
        />
      )}
    </>
  )
}
