# TaskFlow 개발 진행 현황

> 마지막 업데이트: 2026-06-05

---

## 기술 스택

| 레이어 | 기술 |
|--------|------|
| 백엔드 | Laravel (PHP) + Sanctum 인증 |
| 프론트엔드 | React + TypeScript + Vite |
| UI | Tailwind CSS + shadcn/ui (base-ui 기반) |
| 상태관리 | Zustand |
| HTTP | Axios |
| 라우팅 | React Router |
| 드래그앤드롭 | @dnd-kit/core + @dnd-kit/sortable |
| 인프라 | Docker Compose + MySQL |

---

## 완료된 작업

### 백엔드 (Laravel) ✅ 거의 완성
- 인증: 회원가입 / 로그인 / 로그아웃 (Sanctum)
- 프로젝트 CRUD + 멤버 초대/역할변경/제거 API
- 보드(컬럼) CRUD + 순서변경 API
- 카드 CRUD + 컬럼 간 이동 + 순서변경 API
- Policy (권한 체크), DueDateNotification
- Docker 환경 설정, DB 마이그레이션

### 프론트엔드 (React) ✅ 약 75%
- 로그인 / 회원가입 페이지
- 대시보드: 프로젝트 목록 조회 + 생성 모달 (색상 선택 포함)
- 사이드바 + 레이아웃 (프로젝트 목록, 로그아웃)
- Zustand 스토어: authStore, projectStore, boardStore
- API 클라이언트: auth, projects, boards, cards 전부
- **BoardPage**: 칸반 보드 전체 구현
  - 보드 데이터 로드 (프로젝트 + 보드 + 카드 병렬 fetch)
  - 컬럼 추가 / 이름 수정 (인라인) / 삭제
  - 카드 빠른 추가 (컬럼 하단 인풋)
  - 카드 UI: priority 뱃지, 마감일, 담당자 아바타
  - 드래그앤드롭: 카드 순서변경, 컬럼 간 이동, 컬럼 순서변경
  - DragOverlay (드래그 중 카드 미리보기)
- **CardDetailModal**: 카드 상세 편집
  - 제목 / 설명 / 우선순위 / 마감일 / 담당자 / 라벨
  - 필드별 자동 저장 (blur 또는 onChange 즉시)
  - 카드 삭제

---

## 🔴 버그: 카드 수정 후 보드 즉시 반영 안 됨 (다음 작업 1순위)

**증상**: CardDetailModal에서 제목/우선순위 등 수정 → API 저장은 되지만 보드의 카드가 갱신 안 됨

**원인**: `BoardPage`의 `selectedCard` state가 초기 카드 객체를 들고 있어서,
`boardStore.updateCard`가 호출돼도 모달에 보이는 카드는 여전히 이전 값.

**해결 방법**: `CardDetailModal`에 `onUpdate` 콜백 추가 → 저장 시 부모(BoardPage)로 최신 카드 전달

```tsx
// CardDetailModal.tsx
// Props에 추가
onUpdate: (updated: Card) => void

// save() 함수 수정
const save = async (patch) => {
  const updated = await cardsApi.update(boardId, card.id, patch)
  updateCard(boardId, updated)
  onUpdate(updated)  // 이 줄 추가
}

// BoardPage.tsx
<CardDetailModal
  ...
  onUpdate={(updated) =>
    setSelectedCard((prev) => prev ? { ...prev, card: updated } : null)
  }
/>
```

---

## 남은 작업 목록

### 버그 수정
- [ ] 위 버그: 카드 수정 → 보드 즉시 반영 (수정 방법 위에 있음)

### 기능 추가
- [ ] **프로젝트 멤버 관리 UI**: 멤버 초대(이메일 입력), 역할 변경, 제거 → 백엔드 API 이미 있음
- [ ] **프로젝트 설정 UI**: 이름/설명/색상 수정, 프로젝트 삭제
- [ ] **새로고침 시 로그인 유지**: authStore 토큰 localStorage 복원 동작 테스트 필요

### 안정성
- [ ] **axios interceptor**: 401 응답 시 자동 로그아웃 처리 (현재 없음)
- [ ] **카드 모달 오픈 시 최신 fetch**: 현재 store 캐시만 사용, 오래된 데이터 가능성 있음

---

## 주요 파일 위치

```
frontend/src/
├── api/
│   ├── client.ts             # axios 인스턴스
│   ├── auth.ts / projects.ts / boards.ts / cards.ts
├── store/
│   ├── authStore.ts
│   ├── projectStore.ts
│   └── boardStore.ts         # boards + cards 같이 관리
├── pages/
│   ├── LoginPage.tsx
│   ├── RegisterPage.tsx
│   ├── DashboardPage.tsx
│   └── BoardPage.tsx         # 칸반 보드 메인 (DnD 포함)
├── components/
│   ├── CardDetailModal.tsx   # 카드 상세/편집 모달
│   ├── SortableCard.tsx      # 드래그 가능한 카드 컴포넌트
│   └── layout/
│       ├── Layout.tsx
│       └── Sidebar.tsx
└── types/index.ts            # 전체 타입 정의
```
