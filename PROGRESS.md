# TaskFlow 프로젝트 진행 메모

> 마지막 업데이트: 2026-05-22

---

## 📌 프로젝트 개요

**목표:** 이직 포트폴리오용 칸반 태스크 관리 앱  
**스택:** Laravel 11 (API) + Vue 3 (SPA) + MySQL + Docker  
**기능 범위:**
- 로그인 / 회원가입 (Sanctum 인증)
- 프로젝트 단위 칸반 보드
- 카드 드래그앤드롭 (컬럼간 이동)
- 팀원 초대 / 권한 관리 (admin / member / viewer)
- 마감일 알림 (Laravel Notification)

---

## ✅ 완료된 것

### Docker 환경
- [x] `docker-compose.yml` 작성
  - `taskflow_app` — PHP 8.3-fpm (Laravel)
  - `taskflow_nginx` — nginx (포트 8000)
  - `taskflow_mysql` — MySQL 8.0 (포트 3306)
  - `taskflow_frontend` — Node 20 Alpine (포트 5173)
- [x] `docker/php/Dockerfile` 작성 (PHP 8.3 + Composer)
- [x] `docker/nginx/default.conf` 작성

### Laravel 백엔드 (`backend/`)
- [x] `composer create-project laravel/laravel` 완료
- [x] `laravel/sanctum` 설치 완료
- [x] `.env` 설정
  - DB → MySQL (host: mysql, db: taskflow)
  - `SANCTUM_STATEFUL_DOMAINS=localhost:5173`
  - `SESSION_DRIVER=cookie`
  - `FRONTEND_URL=http://localhost:5173`
- [x] `bootstrap/app.php` 수정
  - API 라우트 (`routes/api.php`) 등록
  - `$middleware->statefulApi()` 추가 (Sanctum SPA 인증용)

### DB 마이그레이션 파일 (작성 중)
- [x] `create_projects_table` — id, owner_id, name, description, color
- [x] `create_project_members_table` — project_id, user_id, role(admin/member/viewer)
- [x] `create_boards_table` — id, project_id, name, position
- [ ] `create_cards_table` — id, board_id, assignee_id, title, description, priority, due_date, position ← **여기서 중단**

---

## 🔜 남은 작업 순서

### 백엔드 (Laravel)

#### 1단계 — DB / 모델
- [ ] `create_cards_table` 마이그레이션 완성
- [ ] `cards` 테이블에 `labels` (JSON) 컬럼 추가 고려
- [ ] Eloquent 모델 4개 작성
  - `Project` (hasMany boards, belongsToMany users)
  - `ProjectMember` (pivot)
  - `Board` (hasMany cards, belongsTo project)
  - `Card` (belongsTo board, belongsTo assignee)
- [ ] `docker compose up -d` 후 `php artisan migrate` 실행

#### 2단계 — 인증 API
- [ ] `routes/api.php` 작성
- [ ] `AuthController` — register, login, logout, me
- [ ] Sanctum 토큰 방식 (SPA용 cookie 기반)

#### 3단계 — 비즈니스 로직 API
- [ ] `ProjectController` — index, store, show, update, destroy
- [ ] `ProjectMemberController` — invite(store), updateRole, remove
- [ ] `BoardController` — index, store, update, destroy, reorder
- [ ] `CardController` — index, store, show, update, destroy, move(보드 간 이동), reorder

#### 4단계 — 정책 / 권한
- [ ] `ProjectPolicy` — 오너/어드민만 삭제·초대 가능
- [ ] `CardPolicy` — 프로젝트 멤버만 접근

#### 5단계 — 알림
- [ ] `DueDateNotification` (Laravel Notification) — 마감 1일 전 알림
- [ ] `routes/console.php`에 스케줄 등록 (하루 1회 체크)

---

### 프론트엔드 (Vue 3)

#### 셋업
- [ ] `frontend/` 디렉토리에 Vue 3 프로젝트 생성
  ```bash
  npm create vue@latest frontend
  # Pinia ✓, Vue Router ✓, TypeScript 선택
  ```
- [ ] 패키지 설치: `axios`, `@vueuse/core`, `vuedraggable`, `tailwindcss`

#### 페이지 구성
- [ ] `/login` — 로그인
- [ ] `/register` — 회원가입
- [ ] `/projects` — 프로젝트 목록
- [ ] `/projects/:id` — 칸반 보드 (메인 화면)
- [ ] `/projects/:id/settings` — 멤버 관리

#### 핵심 컴포넌트
- [ ] `KanbanBoard.vue` — 보드 전체 레이아웃
- [ ] `KanbanColumn.vue` — 컬럼 (드롭 대상)
- [ ] `KanbanCard.vue` — 카드 (드래그 대상)
- [ ] `CardModal.vue` — 카드 상세 / 수정
- [ ] `InviteMemberModal.vue` — 멤버 초대

---

## 📁 현재 폴더 구조

```
taskflow/
├── docker-compose.yml
├── PROGRESS.md          ← 이 파일
├── docker/
│   ├── nginx/
│   │   └── default.conf
│   └── php/
│       └── Dockerfile
├── backend/             ← Laravel 11 (생성 완료)
│   ├── .env             (수정 완료)
│   ├── bootstrap/app.php (수정 완료)
│   └── database/migrations/
│       ├── ...laravel 기본 마이그레이션
│       ├── 2026_05_22_000001_create_projects_table.php ✅
│       ├── 2026_05_22_000002_create_project_members_table.php ✅
│       ├── 2026_05_22_000003_create_boards_table.php ✅
│       └── 2026_05_22_000004_create_cards_table.php ← 미완성
└── frontend/            ← 아직 생성 안 함
```

---

## 🚀 다시 시작할 때

```bash
cd C:\Users\919ji\Desktop\study\dev\taskflow

# 1. cards 마이그레이션 완성
# 2. 모델 작성
# 3. Docker 컨테이너 올리기
docker compose up -d

# 4. 마이그레이션 실행
docker compose exec app php artisan migrate

# 5. Vue 프로젝트 생성
npm create vue@latest frontend
```
