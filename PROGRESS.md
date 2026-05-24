# TaskFlow 프로젝트 진행 메모

> 마지막 업데이트: 2026-05-23

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

## 🔜 할 일 전체 목록

### Docker 환경
- [ ] `docker-compose.yml` 작성
  - `taskflow_app` — PHP 8.3-fpm (Laravel)
  - `taskflow_nginx` — nginx (포트 8000)
  - `taskflow_mysql` — MySQL 8.0 (포트 3306)
  - `taskflow_frontend` — Node 20 Alpine (포트 5173)
- [ ] `docker/php/Dockerfile` 작성 (PHP 8.3 + Composer)
- [ ] `docker/nginx/default.conf` 작성

---

### 백엔드 (Laravel)

#### 0단계 — 초기 세팅
- [ ] `composer create-project laravel/laravel backend`
- [ ] `laravel/sanctum` 설치 (`composer require laravel/sanctum`)
- [ ] `.env` 설정
  - `APP_NAME=TaskFlow`
  - `APP_URL=http://localhost:8000`
  - `FRONTEND_URL=http://localhost:5173`
  - DB → MySQL (host: mysql, db: taskflow, user: taskflow, pw: secret)
  - `SANCTUM_STATEFUL_DOMAINS=localhost:5173`
  - `SESSION_DRIVER=cookie`
- [ ] `bootstrap/app.php` 수정
  - API 라우트 (`routes/api.php`) 등록
  - `$middleware->statefulApi()` 추가

#### 1단계 — DB / 마이그레이션
- [ ] `create_projects_table` — id, owner_id, name, description, color
- [ ] `create_project_members_table` — project_id, user_id, role(admin/member/viewer)
- [ ] `create_boards_table` — id, project_id, name, position
- [ ] `create_cards_table` — id, board_id, assignee_id, title, description, priority, due_date, position
- [ ] `cards` 테이블에 `labels` (JSON) 컬럼 추가 고려

#### 2단계 — Eloquent 모델
- [ ] `Project` (hasMany boards, belongsToMany users)
- [ ] `ProjectMember` (pivot)
- [ ] `Board` (hasMany cards, belongsTo project)
- [ ] `Card` (belongsTo board, belongsTo assignee)

#### 3단계 — 마이그레이션 실행
- [ ] `docker compose up -d`
- [ ] `docker compose exec app php artisan migrate`

#### 4단계 — 인증 API
- [ ] `routes/api.php` 작성
- [ ] `AuthController` — register, login, logout, me
- [ ] Sanctum 쿠키 기반 SPA 인증

#### 5단계 — 비즈니스 로직 API
- [ ] `ProjectController` — index, store, show, update, destroy
- [ ] `ProjectMemberController` — invite(store), updateRole, remove
- [ ] `BoardController` — index, store, update, destroy, reorder
- [ ] `CardController` — index, store, show, update, destroy, move, reorder

#### 6단계 — 정책 / 권한
- [ ] `ProjectPolicy` — 오너/어드민만 삭제·초대 가능
- [ ] `CardPolicy` — 프로젝트 멤버만 접근

#### 7단계 — 알림
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

## 📁 목표 폴더 구조

```
taskflow/
├── docker-compose.yml
├── PROGRESS.md
├── docker/
│   ├── nginx/
│   │   └── default.conf
│   └── php/
│       └── Dockerfile
├── backend/             ← Laravel 11
│   ├── .env
│   ├── bootstrap/app.php
│   ├── routes/
│   │   ├── api.php
│   │   └── web.php
│   ├── app/
│   │   ├── Http/Controllers/
│   │   │   ├── AuthController.php
│   │   │   ├── ProjectController.php
│   │   │   ├── BoardController.php
│   │   │   └── CardController.php
│   │   ├── Models/
│   │   │   ├── Project.php
│   │   │   ├── Board.php
│   │   │   └── Card.php
│   │   └── Policies/
│   └── database/migrations/
└── frontend/            ← Vue 3
    ├── src/
    │   ├── pages/
    │   ├── components/
    │   └── stores/
    └── package.json
```
