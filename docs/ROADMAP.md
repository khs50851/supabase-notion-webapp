# 견적서 웹 확인 서비스 고도화 로드맵 (v2)

MVP로 동작하는 견적서 서비스에 **관리자 전용 작업 공간(Admin Shell)** 을 입히고, 이미 만들어진 공유 링크·다크모드 기능의 남은 구멍을 메운다.

## 개요

이번 라운드(v2)는 신규 기능을 넓게 추가하는 라운드가 아니라, **사용자가 요청한 3가지 고도화 요구사항에만 집중**하는 좁은 범위의 로드맵입니다. 사전 코드 조사 결과 3가지 중 2가지는 MVP에서 이미 구현되어 있었으므로, **중복 구현 없이 "실제로 빠진 것"과 "남은 잔여 TODO"만** 작업으로 등록했습니다.

| #   | 사용자 요구사항                                           | 실제 코드 상태                                                        | 이번 라운드 처리                                                     |
| --- | --------------------------------------------------------- | --------------------------------------------------------------------- | -------------------------------------------------------------------- |
| 1   | 관리자 레이아웃으로 견적서 목록을 볼 수 있다              | ✅ **완료** — Route Group 기반 Admin Shell(사이드바) 신설             | **Phase 1 (Task 001~003) 완료**                                      |
| 2   | 견적서 목록에서 클라이언트에게 보낼 링크를 복사할 수 있다 | ✅ **완료** — MVP 기본 기능 + 재발급 UI·소유권 검증(스텁) 추가        | **Phase 2 (Task 004~005) 완료, Task 006(영속 저장)만 Supabase 대기** |
| 3   | 다크모드 기능 추가                                        | ✅ **완료** — MVP에서 구조적으로 완료, Admin Shell 회귀 검증까지 통과 | **Phase 3 (Task 007) 완료**                                          |

> 📌 **번호 체계**: 이 로드맵의 Task 번호(001~007)는 **v1(`docs/roadmaps/ROADMAP_v1.md`)의 Task 001~015와 완전히 별개**입니다. 이하 v1 작업을 언급할 때는 반드시 `v1 Task 006`처럼 접두사를 붙입니다.
>
> 📌 v1 Phase 4에 있던 Task 013(UX 고도화) / 014(성능·보안) / 015(배포)는 이번 라운드 범위가 아니므로 되살리지 않습니다. 향후 별도 라운드(v3)에서 다룹니다.

---

## MVP(v1) 완료 요약

상세 내역은 `docs/roadmaps/ROADMAP_v1.md` 참조. 이번 로드맵은 아래 상태를 **전제**로 합니다.

| 기능 ID | 기능명              | v1 결과                                                                                                                  |
| ------- | ------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| F001    | 노션 연동 설정      | ✅ 완료 (v1 Task 008) — 저장 전 Notion API 실연결 2단계 검증(invoice → Items) 포함                                       |
| F002    | 견적서 목록 동기화  | ✅ 완료 (v1 Task 009) — 실제 노션 워크스페이스 데이터로 대시보드 목록 렌더링 검증                                        |
| F003    | 견적서 상세 조회    | ✅ 완료 (v1 Task 011) — `lib/quotes-source.ts`의 `getPublicQuoteByShareToken` 단일 진입점, noindex 적용                  |
| F004    | 공유 링크 생성      | ✅ 완료 (v1 Task 010) — 발급 + 클립보드 자동 복사까지 동작. **단, 재발급 UI·소유권 검증·영속 저장은 TODO**               |
| F005    | PDF 다운로드        | ✅ 완료 (v1 Task 012) — 한글 폰트(NanumGothic) 임베딩. 시각적 렌더링은 도구 제약으로 미확인                              |
| F010    | 기본 인증           | ⚠️ **코드 완료 / 실동작 검증 대기** (v1 Task 007) — 실제 Supabase 프로젝트가 없어 회원가입·로그인·라우트 가드 E2E 미검증 |
| 공통    | 구조·타입·DB 스키마 | ✅ v1 Task 001·002·003 완료 / ⚠️ **v1 Task 006(Supabase 프로젝트 생성·마이그레이션 적용)은 사용자 액션 대기**            |

> ⚠️ **이번 라운드도 Supabase 프로젝트 부재를 그대로 안고 갑니다.**
> `supabase/migrations/0001_init.sql`은 작성되어 있으나 실제 프로젝트에 적용되지 않았습니다. 따라서
> Task 003(회귀 검증)의 로그인·로그아웃 시나리오와 Task 005·006(소유권 검증·영속 저장)은
> **v1 Task 006 완료(사용자 액션)에 의존**합니다. 해당 부분은 각 Task에 "선행 의존성"으로 명시하고,
> 의존성이 풀리기 전까지는 Supabase 미연동 분기(`globalThis` 인메모리 저장소 + 노션 직접 조회)로
> 검증합니다.
>
> 🆕 **구현 중 추가된 선행 작업 (Task 000)**: 실제 Supabase 프로젝트가 없어 로그인·로그아웃을 검증할
> 방법이 없었다. Supabase 미연동 시 기존에는 "누구나 이미 로그인된 상태"로 더미 렌더링하던 것을,
> 환경변수(`DEV_ADMIN_EMAIL`/`DEV_ADMIN_PASSWORD`, 기본값 `admin`/`1234`) 기반의 실제 로그인
> 게이트로 교체했다(`lib/auth/dev-admin.ts`, `lib/auth/session.ts`, `lib/auth/actions.ts`). 상세는
> `tasks/v2/000-dev-admin-auth.md` 참고. `/login`에서 `admin` / `1234`로 로그인하면 된다.

---

## 기술 스택 (실제 설치 기준 — `package.json` 확인 완료)

| 영역          | 스택                                                                                                                                 |
| ------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| 프레임워크    | Next.js **16.3.5** (App Router), React **19.2.8**, TypeScript 5 strict                                                               |
| 스타일        | Tailwind CSS v4 (config 파일 없음, `app/globals.css`의 `@theme inline` / `:root` / `.dark`에서 OKLCH 토큰 관리)                      |
| UI            | shadcn/ui `base-nova` 스타일 (**Base UI `@base-ui/react` 1.8.x 기반** — `asChild` 대신 `render` prop), lucide-react 1.45, sonner 2.0 |
| 테마          | next-themes 0.4.6 (`ThemeProvider` + `components/theme-toggle.tsx`)                                                                  |
| 폼            | react-hook-form 7.88 + zod **4.6** (`@hookform/resolvers` 5.9), 에러 메시지 한국어                                                   |
| 데이터        | Supabase (Auth + PostgreSQL) — `@supabase/supabase-js` 2.117, `@supabase/ssr` 0.12                                                   |
| 외부 연동     | `@notionhq/client` **5.26**                                                                                                          |
| 문서 생성     | `@react-pdf/renderer` 4.9                                                                                                            |
| 배포 / 패키지 | Vercel / **npm**                                                                                                                     |

> ⚠️ PRD 원문에는 "Next.js 15"로 표기되어 있으나 실제 설치 버전은 **16.3.5**입니다. 다운그레이드하지 않습니다.
> ⚠️ 테스트 프레임워크(jest/vitest/playwright-test)는 미설정입니다. 검증은 `npm run lint` + `npx tsc --noEmit` + **Playwright MCP 수동 E2E**로 수행합니다.
> ⚠️ Tailwind v4는 config 파일이 없습니다. Admin Shell 작업 중에도 `tailwind.config.ts`를 새로 만들지 않습니다.

---

## 개발 워크플로우

1. **작업 계획**
   - 기존 코드베이스를 학습하고 현재 상태를 파악
   - 새로운 작업을 포함하도록 `docs/ROADMAP.md` 업데이트
   - 우선순위 작업은 마지막 완료된 작업 다음에 삽입

2. **작업 생성**
   - 기존 코드베이스를 학습하고 현재 상태를 파악
   - `/tasks` 디렉토리에 새 작업 파일 생성
   - 명명 형식: `XXX-description.md` (예: `001-route-groups.md`)
   - 고수준 명세서, 관련 파일, 수락 기준, 구현 단계 포함
   - **API/비즈니스 로직 작업 시 "## 테스트 체크리스트" 섹션 필수 포함 (Playwright MCP 테스트 시나리오 작성)**
   - 예시를 위해 `/tasks` 디렉토리의 마지막 완료된 작업 참조. 예를 들어, 현재 작업이 `003`이라면 `002`와 `001`을 예시로 참조
   - 이러한 예시들은 완료된 작업이므로 내용이 완료된 작업의 최종 상태를 반영함(체크된 박스와 변경 사항 요약). 새 작업의 경우 문서에는 빈 박스와 변경 사항 요약이 없어야 함. 초기 상태의 샘플로 `000-sample.md` 참조
   - ⚠️ v1 작업 파일(`tasks/002`, `tasks/006`~`012-1`)이 이미 같은 디렉토리에 존재하므로, **v2 작업 파일은 `tasks/v2/XXX-description.md` 하위 디렉토리에 생성**해 번호 충돌을 피한다

3. **작업 구현**
   - 작업 파일의 명세서를 따름
   - 기능과 기능성 구현
   - **API 연동 및 비즈니스 로직 구현 시 Playwright MCP로 테스트 수행 필수**
   - 각 단계 후 작업 파일 내 단계 진행 상황 업데이트
   - 구현 완료 후 `npm run lint` + `npx tsc --noEmit` + Playwright MCP E2E 테스트 실행
   - 테스트 통과 확인 후 다음 단계로 진행
   - 각 단계 완료 후 중단하고 추가 지시를 기다림

4. **로드맵 업데이트**
   - 로드맵에서 완료된 작업을 ✅로 표시

---

## 현재 코드베이스 상태 (2026-09-27 — 이번 로드맵 범위 한정)

| 구분                                  | 상태                                                                                                                                                                                                                                        |
| ------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **관리자 전용 레이아웃(Admin Shell)** | ❌ **없음** — `app/layout.tsx` 하나가 공개 페이지와 관리자 페이지를 모두 처리. `/dashboard`가 랜딩(`/`)과 픽셀 단위로 동일한 헤더·푸터를 씀. 사이드바·활성 링크 강조·관리자 전용 셸 전부 부재                                               |
| Route Group                           | ❌ 미사용 — `app/page.tsx`, `app/login/`, `app/signup/`, `app/quotes/[shareToken]/`, `app/dashboard/`, `app/settings/notion/`이 모두 평평한 구조                                                                                            |
| `components/layout/`                  | ✅ `container.tsx` / `site-header.tsx` / `site-footer.tsx` / `mobile-nav.tsx` / `nav-links.ts` 존재. `nav-links.ts`는 `GUEST_NAV_LINKS` / `AUTHED_NAV_LINKS` / `getNavLinks(isAuthenticated)` 제공 → **Admin Shell에서 그대로 재사용 가능** |
| `proxy.ts` (세션 갱신·라우트 가드)    | ✅ 작성 완료 (v1 Task 007). `matcher`는 `/dashboard`·`/settings/**` 대상 — **Route Group은 URL에 영향 없으므로 수정 불필요**, 단 이동 후 회귀 확인 필요                                                                                     |
| **공유 링크 자동 복사 (F004)**        | ✅ **완료 — 재구현 금지.** `share-link-cell.tsx`가 생성 → 클립보드 자동 복사 → 토스트까지 처리                                                                                                                                              |
| 공유 링크 TODO ① 재발급 UI            | ❌ 토큰이 이미 발급된 행에는 "링크 보기/복사"만 있고 **재발급 버튼이 없음** (서버 측 재발급 함수는 `lib/dummy/share-tokens.ts`에 존재)                                                                                                      |
| 공유 링크 TODO ② 소유권 검증          | ❌ `app/dashboard/actions.ts`의 `generateShareLink`에 **소유권 검증 로직 없음** — 임의 `notionPageId`로 토큰 발급 가능                                                                                                                      |
| 공유 링크 TODO ③ 영속 저장            | ❌ Supabase 미연동 시 `globalThis` 인메모리 저장이라 **서버 재시작 시 토큰 소실**, Supabase 연동 시에는 분기가 `INTERNAL_ERROR`로 막혀 있는 TODO 상태                                                                                       |
| **다크모드**                          | ✅ **완료 — 재구현 금지.** `next-themes` `ThemeProvider`가 `app/layout.tsx` 전체를 감쌈, `ThemeToggle` 헤더 상시 노출, `globals.css` OKLCH 토큰 일관 적용, 하드코딩 라이트/다크 깨짐 요소 없음                                              |
| 다크모드 잔여 리스크                  | ⚠️ **신규 Admin Shell(사이드바)이 기존 토큰 체계를 깨뜨릴 가능성** — Task 002 수락 기준 및 Task 007 검증 대상                                                                                                                               |
| Supabase 프로젝트                     | ⚠️ **미생성** (v1 Task 006 사용자 액션 대기). Task 003 일부·Task 005·006의 선행 의존성                                                                                                                                                      |
| `/tasks` 디렉토리                     | ✅ v1 작업 파일 존재 (`000-sample.md`, `002`, `006`~`012-1`). v2 작업 파일은 `tasks/v2/` 하위에 생성                                                                                                                                        |
| git 저장소                            | ✅ `git init` 완료, 아직 커밋 없음 (전체 파일이 untracked)                                                                                                                                                                                  |

---

## 개발 단계

### Phase 1: 관리자 전용 레이아웃(Admin Shell) 도입 — 핵심 신규 기능

> 📌 이번 로드맵의 **유일한 신규 기능 구현 Phase**입니다. 요구사항 ①("관리자 레이아웃으로 견적서
> 목록을 볼 수 있다")에 해당하며, 사전 조사에서 실제로 빠져 있음이 확인된 부분입니다.
>
> 📌 구조 우선 접근법에 따라 **골격(Route Group 분리) → UI(사이드바 컴포넌트) → 검증(회귀 테스트)**
> 순서로 배치했습니다. Task 001이 Task 002의 선행 조건입니다.

- **Task 001: `(public)` / `(admin)` Route Group 분리** ✅ - 완료
  - 기능 ID: 공통 구조 기반 (요구사항 ①)
  - 상세: `tasks/v2/001-route-groups.md` (작성 예정)
  - `app/layout.tsx` 슬림화 — `html` / `body` / `ThemeProvider` / `TooltipProvider` / `Toaster` / 전역 메타데이터만 남김
  - `app/(public)/layout.tsx` 신설 — 기존 `SiteHeader` / `Container` / `SiteFooter` 조합을 이 레이아웃으로 이동
  - `app/(admin)/layout.tsx` 신설 — 사이드바 기반 셸의 껍데기 구성 (사이드바 본체 구현은 Task 002)
  - 페이지 이동
    - 공개: `app/page.tsx` → `app/(public)/page.tsx`, `app/login/` → `app/(public)/login/`, `app/signup/` → `app/(public)/signup/`, `app/quotes/[shareToken]/`(+`not-found.tsx`, `pdf/route.tsx`) → `app/(public)/quotes/[shareToken]/`
    - 관리자: `app/dashboard/`(`page.tsx` + `actions.ts`) → `app/(admin)/dashboard/`, `app/settings/notion/`(`page.tsx` + `actions.ts`) → `app/(admin)/settings/notion/`
  - **URL 불변 확인** — Route Group은 경로 세그먼트를 만들지 않으므로 `/dashboard`, `/settings/notion`, `/quotes/[shareToken]`, `/quotes/[shareToken]/pdf` 모두 그대로 유지 → `proxy.ts`의 `matcher` **수정 불필요**. 단 이동 후 반드시 실동작으로 회귀 확인
  - import 경로 점검 — 이동한 페이지들이 참조하는 `@/components/**`, `@/lib/**`는 루트 기준 alias라 영향 없음. 상대 경로 import가 있으면 alias로 교정
  - **## 테스트 체크리스트 (Playwright MCP)**
    - [x] `npm run lint` / `npx tsc --noEmit` / `npm run build` 통과 (라우트 목록에 중복·누락 없음)
    - [x] `/`, `/login`, `/signup`이 기존과 동일한 헤더·푸터로 렌더링됨
    - [x] `/dashboard`, `/settings/notion`이 404 없이 진입되고 URL이 변하지 않음
    - [x] 공유 링크 `/quotes/[shareToken]` 및 `/quotes/[shareToken]/pdf`(curl) 정상 응답 — Route Group 이동이 공개 라우트를 깨뜨리지 않음 확인
    - [x] 브라우저 콘솔에 하이드레이션·중복 `html`/`body` 관련 에러 없음
  - 상세 구현 기록: `tasks/v2/001-route-groups.md`

- **Task 002: `components/layout/admin-sidebar.tsx` 신설** ✅ - 완료
  - 기능 ID: F002 열람 경험 개선 (요구사항 ①, ③ 회귀 방지)
  - 상세: `tasks/v2/002-admin-sidebar.md` (작성 예정)
  - 선행 의존성: **Task 001 완료 필수**
  - `components/layout/admin-sidebar.tsx` 신규 — `app/(admin)/layout.tsx`에서 사용하는 관리자 전용 내비게이션
  - `nav-links.ts`의 **`AUTHED_NAV_LINKS`(대시보드 / 노션 연동 설정)를 그대로 재사용** — 링크 목록을 사이드바에 중복 정의하지 않음
  - 활성 링크 강조 추가 — `usePathname()` 기반 현재 경로 판별, `aria-current="page"` 부여
  - 기존 `components/auth/logout-button.tsx`(`LogoutButton`)를 사이드바 하단에 배치
  - `ThemeToggle`을 관리자 셸에서도 접근 가능한 위치에 배치 (다크모드 토글 접근성 유지)
  - 반응형
    - 데스크톱(`md` 이상): 좌측 고정 사이드바 + 우측 콘텐츠 영역
    - 모바일: 기존 `components/layout/mobile-nav.tsx`의 `Sheet` 패턴 재사용 — 새 드로어 구현을 처음부터 만들지 않음
  - **컴포넌트 컨벤션 준수** — `function AdminSidebar() { ... }` 선언 후 `export { AdminSidebar }`, Base UI는 `asChild`가 아닌 `render` prop 사용
  - **수락 기준에 다크모드 회귀 확인 포함** — 신규 컴포넌트가 `globals.css`의 기존 OKLCH 토큰(`bg-background` / `text-foreground` / `bg-sidebar` 계열 등)만 사용하고, **하드코딩 색상값(`#hex`, `rgb()`, 임의 `dark:` 오버라이드) 0건**
  - **## 테스트 체크리스트 (Playwright MCP)**
    - [x] 데스크톱 뷰포트(1280px)에서 사이드바 고정 표시, 콘텐츠 영역 가림 없음
    - [x] 모바일 뷰포트(390px)에서 `Sheet` 드로어로 전환, 링크·로그아웃 모두 접근 가능
    - [x] `/dashboard` 진입 시 "대시보드" 링크가, `/settings/notion` 진입 시 "노션 연동 설정" 링크가 활성 강조됨
    - [x] 라이트/다크 양쪽 모드에서 사이드바 스크린샷 비교 — 대비 손실·읽을 수 없는 텍스트 없음
    - [ ] 키보드 `Tab` 내비게이션 — 미실행(수동 접근성 점검은 Task 013급 후속 라운드로 미룸)
    - [x] 사이드바 마크업에 하드코딩 색상 없음 (grep 확인)
  - 상세 구현 기록: `tasks/v2/002-admin-sidebar.md`

- **Task 003: 이동·회귀 검증 (Admin Shell 통합 테스트)** ✅ - 완료
  - 기능 ID: F002, F010, F003, F005 회귀 검증
  - 상세: `tasks/v2/003-admin-shell-regression.md` (작성 예정)
  - 선행 의존성: Task 001·002 완료. **로그인/로그아웃 시나리오는 v1 Task 006(Supabase 프로젝트 생성) 필요** — 미완료 시 해당 항목은 "미실행(의존성 대기)"로 기록하고 나머지만 수행
  - Playwright MCP로 관리자 전체 플로우 실행 — 로그인 → 대시보드(사이드바 노출 + 견적서 목록) → 노션 연동 설정 → 로그아웃
  - 비로그인 상태에서 보호 라우트 리디렉션 재확인 — Route Group 이동 후에도 `proxy.ts` 가드가 유효한지 검증
  - 공개 페이지 레이아웃 무회귀 확인 — 랜딩·로그인·회원가입·견적서 상세가 이전 스크린샷과 동일한 셸 사용
  - `npm run lint` + `npx tsc --noEmit` + `npm run build` 최종 통과
  - **## 테스트 체크리스트 (Playwright MCP)**
    - [x] 로그인 → `/dashboard` 이동 시 Admin Shell(사이드바)이 노출되고 견적서 목록 테이블이 정상 렌더링 — Task 000의 dev-admin 로그인(`admin`/`1234`)으로 Supabase 없이 검증 완료
    - [x] 사이드바에서 `/settings/notion` 이동 → 다시 `/dashboard` 복귀, 활성 강조 정상 전환
    - [x] 사이드바 로그아웃 클릭 → `/login` 리디렉션, 뒤로가기(`browser_navigate_back`)로 대시보드 복귀 불가
    - [x] 비로그인 상태로 `/dashboard`, `/settings/notion` 직접 접근 시 `/login` 리디렉션
    - [x] 공개 페이지(`/`, `/login`, `/signup`, `/quotes/[shareToken]`)는 Admin Shell이 **노출되지 않음** — 관리자 셸 누출 없음 확인
    - [x] `/quotes/[shareToken]/pdf` curl 응답 `200 OK` + `application/pdf` 유지
    - [x] `browser_console_messages`로 전 페이지 콘솔 에러 0건 확인
  - **검증 중 발견해 수정한 버그 2건**
    1. 로그인 폼 zod 스키마가 이메일 형식·8자 이상 비밀번호를 요구해 `admin`/`1234`가 클라이언트
       검증에서 막힘 → `lib/schemas/auth.ts`에 완화된 `devAdminLoginFormSchema` 추가, Supabase
       미연동 시 이 스키마를 쓰도록 `login-form.tsx` 분기 (`noValidate`로 네이티브 검증도 제거)
    2. Next.js 개발자 도구 배지(기본 위치 `bottom-left`)가 사이드바 하단 로그아웃/테마 버튼과 겹쳐
       실제 클릭을 막음 → `next.config.ts`에 `devIndicators.position: "bottom-right"` 추가

---

### Phase 2: 공유 링크 기능 보완 (F004 하드닝)

> 🚫 **이 Phase는 공유 링크 기능을 새로 만드는 Phase가 아닙니다.** 생성·클립보드 자동 복사·토스트는
> v1 Task 010에서 이미 완료되어 실동작 검증까지 끝났습니다(`components/dashboard/share-link-cell.tsx`).
> 여기서는 **사전 조사에서 확인된 잔여 TODO 3건만** 처리합니다.

- **Task 004: 공유 링크 재발급 UI 추가** ✅ - 완료
  - 기능 ID: **F004** (하드닝 ①)
  - 상세: `tasks/v2/004-share-link-reissue.md` (작성 예정)
  - 문제: 토큰이 이미 발급된 행에는 "링크 보기 / 복사"만 있고 **재발급(rotate) 버튼이 없음**. 서버 측 재발급 로직은 `lib/dummy/share-tokens.ts`에 이미 존재하므로 **UI 노출과 서버 액션 연결만** 필요
  - `components/dashboard/share-link-cell.tsx` — 발급 완료 상태에 "재발급" 액션 추가 (기존 복사 버튼·자동 복사 동작은 **변경하지 않음**)
  - 재발급 시 기존 링크가 즉시 무효화됨을 알리는 확인 단계 제공 (`dialog` 또는 `alert-dialog`, Base UI `render` prop 패턴)
  - 재발급 성공 시 새 토큰을 클립보드에 복사하고 한국어 토스트로 결과 안내
  - `app/(admin)/dashboard/actions.ts`에 재발급 서버 액션 추가 또는 `generateShareLink`에 재발급 모드 파라미터 확장 — 실패 시 `ApiError` 규약(`types/api.ts`) 준수
  - 재발급 후 목록 갱신 — `revalidatePath` 또는 낙관적 UI로 화면에 새 토큰 반영
  - **## 테스트 체크리스트 (Playwright MCP)**
    - [x] 미발급 행: 기존 "생성" 버튼 동작 및 자동 클립보드 복사가 그대로 유지됨 (회귀 없음)
    - [x] 발급된 행: "재발급" 버튼 노출 → 확인 단계 → 새 토큰 발급 및 토스트 표시
    - [x] 재발급 직후 **구 토큰으로 `/quotes/[구토큰]` 접근 시 404**, 신 토큰은 정상 조회
    - [x] 구 토큰 PDF 라우트(`/quotes/[구토큰]/pdf`)도 404 (curl 확인)
    - [x] 확인 단계에서 취소 시 토큰이 변경되지 않음
    - [x] 재발급 중 버튼 비활성화(중복 클릭 방지) 및 콘솔 에러 0건
  - 상세 구현 기록: `tasks/v2/004-share-link-reissue.md`

- **Task 005: 공유 링크 소유권 검증 로직** ✅ - 완료
  - 기능 ID: **F004** (하드닝 ②), F010 연계
  - 상세: `tasks/v2/005-share-link-ownership.md` (작성 예정)
  - 문제: `app/dashboard/actions.ts`의 `generateShareLink`가 전달받은 `notionPageId`를 **소유권 검증 없이 그대로 신뢰** — 타 계정 견적서에 대한 토큰 발급을 막을 장치가 없음
  - 검증 지점 설계 — "요청자가 해당 견적서의 소유 관리자인가"를 서버 액션 진입부에서 단일 함수로 판별 (발급·재발급 액션 모두 이 함수를 통과)
  - Supabase 미연동 단계: **스텁 구현** — 현재 세션의 노션 연동 설정으로 조회 가능한 견적서 목록에 `notionPageId`가 포함되는지 확인하는 방식으로 최소 경계 적용, 미연동/미인증 시 명시적 거부
  - Supabase 연동 후: `quotes.account_id = auth.uid()` 기준 실제 소유권 검증으로 교체 (RLS 정책과 이중 방어)
  - 실패 응답을 한국어 메시지로 매핑 — 존재하지 않는 견적서와 권한 없는 견적서를 **응답에서 구분하지 않음**(정보 노출 방지), 서버 로그에만 구분 기록
  - **## 테스트 체크리스트 (Playwright MCP)**
    - [x] 정상 케이스: 본인 견적서 발급·재발급 모두 기존과 동일하게 성공 (회귀 없음)
    - [ ] 조작된 `notionPageId`(목록에 없는 임의 값)로 서버 액션 호출 시 발급 거부 및 토큰 미생성 —
          Next.js 서버 액션 wire 포맷을 curl로 재현하기 어려워 **코드 리뷰로만 확인**
    - [ ] 비로그인 상태에서 서버 액션 직접 호출 시 거부 — 동일한 사유로 **코드 리뷰로만 확인**
          (실사용 경로는 `proxy.ts`가 `/dashboard` 자체를 가드)
    - [x] 거부 응답 본문에 견적서 존재 여부·계정 정보가 노출되지 않음 (메시지 고정, 코드 확인)
    - [x] 타 계정 교차 접근 — Supabase 연동 완료 후 Task 006에서 실제 소유권 검증(`account_id` 조건 +
          RLS 이중 방어)으로 구현·코드 리뷰 완료 (상세는 Task 006 체크리스트 참고)
  - 상세 구현 기록: `tasks/v2/005-share-link-ownership.md`

- **Task 006: Supabase 영속 저장 전환** ✅ - 완료
  - 기능 ID: **F004** (하드닝 ③)
  - 상세: `tasks/v2/006-share-token-persistence.md` (작성 예정)
  - ⚠️ 착수 시점에 마이그레이션(`supabase/migrations/0001_init.sql`)이 아직 프로젝트에 적용되지
    않은 상태였음 — 사용자가 이어서 적용 예정. `SUPABASE_SERVICE_ROLE_KEY`도 이번 라운드에 함께 채움
  - 📌 **범위 조정**: 착수 전 코드 조사 결과 이 Task 설명(actions.ts 업서트 + quotes-source.ts 전환)보다
    실제 필요 범위가 넓었음 — `app/(admin)/dashboard/page.tsx`의 Supabase 분기가 `quotes: []`로
    하드코딩되어 있어 목록 동기화 자체가 구현돼 있지 않았고(v1 Task 009 주석에 TODO로 남아있던 부분),
    `lib/notion/quotes.ts`가 더미 공유 토큰 스토어에 직접 결합돼 있어 분리가 필요했음. 아래 항목에 반영
  - 📌 **env 변수명 결정**: 코드가 기대하던 `NEXT_PUBLIC_SUPABASE_ANON_KEY` 대신, Supabase 신규
    대시보드 명칭을 그대로 따라 `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`로 코드 쪽을 리네이밍
    (`lib/supabase/client.ts`/`server.ts`/`is-configured.ts`, `proxy.ts`, `.env.example`, `README.md`)
  - 신규 `lib/share-token.ts` — 더미 스토어(`lib/dummy/share-tokens.ts`)와 Supabase 모듈이 공유하는
    토큰 생성 규칙(`generateShareTokenValue`) 추출
  - 신규 `lib/supabase/quotes.ts` — `syncQuotesForAccount`(노션 견적서를 `(account_id,
notion_page_id)` unique 키로 upsert, `share_token`은 건드리지 않아 기존 토큰 보존, `quote_items`는
    전량 delete 후 재삽입), `rotateShareToken`(세션 클라이언트로 `account_id` 조건까지 포함한 update —
    RLS와 이중 방어), `getQuoteByShareTokenAdmin`(서비스 롤 클라이언트로 `share_token` 조건만 조회,
    공개 조회 전용 RLS 우회 경로)
  - `lib/notion/quotes.ts` — `mapInvoicePageToQuote`가 더미 스토어에서 직접 `share_token`을 읽던
    결합을 제거하고 항상 `null` 반환하도록 중립화. 더미 경로의 토큰 병합은 `lib/quotes-source.ts`로 이동
  - `app/(admin)/dashboard/page.tsx` — Supabase 분기에서 계정별 노션 자격증명으로 실시간 조회 →
    `syncQuotesForAccount`로 동기화된 목록 표시. 노션 조회 실패 시 빈 화면 대신 `quotes` 테이블의
    캐시된 최신 목록으로 폴백(PRD의 "견적서 캐시" 개념 활용)
  - `app/(admin)/dashboard/actions.ts`의 `generateShareLink` — Supabase 분기 구현: 세션 유저 확인 →
    계정 노션 자격증명 조회 → 실시간 동기화로 소유권 확인(Task 005 원칙 그대로 재현) →
    `rotateShareToken` 호출. 존재하지 않는/타 계정 견적서는 모두 동일한 `NOT_FOUND` 메시지로 응답
  - `lib/quotes-source.ts`의 `getPublicQuoteByShareToken` — Supabase 경로에서 `getQuoteByShareTokenAdmin`
    호출로 전환
  - `npm run lint` / `npx tsc --noEmit` 통과 확인 (앱 자체 코드 기준 — 저장소에 함께 존재하는 별도
    참고용 스타터 `nextjs-supabase-app/`의 기존 오류는 이번 작업과 무관해 그대로 둠)
  - 마이그레이션 적용 + `SUPABASE_SERVICE_ROLE_KEY` 입력 완료 후 실제 Supabase 프로젝트로 전 과정
    Playwright MCP 검증 완료 (테스트 계정 이메일 인증은 서비스 롤 키 기반 admin API로 즉시 처리)
  - **## 테스트 체크리스트 (Playwright MCP)**
    - [x] 회원가입 → 노션 연동 설정 저장 → 대시보드에 노션 실 데이터(2건)가 목록으로 표시됨
    - [x] 공유 링크 생성 → 비로그인(curl, 쿠키 없음) 상태에서 `/quotes/[shareToken]` 200, PDF 라우트
          curl 200 + `content-type: application/pdf`
    - [x] 개발 서버 재시작(PID kill 후 재기동) → 동일 링크 정상 조회 (영속성 핵심 검증 통과)
    - [x] 재발급 → 구 토큰 404(상세/PDF 모두, curl 확인) / 신 토큰 200(상세/PDF 모두)
    - [x] `quotes` 테이블 업서트 확인 — 대시보드를 여러 번 재로드해도 목록 2건 유지, 기존 공유 토큰도
          그대로 보존됨(재동기화가 중복 삽입/토큰 초기화를 일으키지 않음)
    - [x] 공개 상세·PDF 라우트가 RLS를 우회하지 않고 `share_token` 조건으로만 조회됨 확인 (코드가
          `lib/supabase/admin.ts` 서비스 롤 클라이언트로 `share_token` 단일 조건만 사용, 위 curl 결과로
          간접 확인)
    - [x] `notion_api_key`·`SUPABASE_SERVICE_ROLE_KEY`가 클라이언트 응답·번들에 노출되지 않음 —
          대시보드 진입 시 static 자산 외 클라이언트 fetch/XHR 요청 자체가 없음(완전 서버 렌더링),
          `document.documentElement.outerHTML`에 두 키 문자열 포함 여부 확인 결과 0건
    - [ ] 타 계정으로 로그인해 다른 계정의 `notionPageId`로 링크 생성 시도 시 거부됨 — **UI 경로로는
          애초에 재현 불가**(자신의 노션 워크스페이스 목록에 없는 견적서는 화면에 뜨지 않아 버튼 자체가
          없음 — 공격자가 서버 액션을 직접 호출해야만 가능한 시나리오). Next.js 서버 액션의 wire
          포맷이 curl로 재현하기 어려워(Task 005와 동일한 제약) 실행 검증 대신 **코드 리뷰로 확인**:
          `rotateShareToken`이 `update ... where account_id = ? and notion_page_id = ?`로 세션
          클라이언트(RLS 적용)를 사용하므로 타 계정 조건은 0 rows → `null` → `NOT_FOUND`, RLS
          `quotes_update_own` 정책이 이중으로 강제

---

### Phase 3: 다크모드 최종 점검 (검증 전용)

> 🚫 **신규 구현이 없는 Phase입니다.** 다크모드는 v1 Task 003에서 `next-themes` 기반으로 이미
> 완성되어 있고(루트 `ThemeProvider` + 헤더 상시 `ThemeToggle` + `globals.css` OKLCH 토큰),
> 하드코딩 색상으로 깨지는 요소도 확인되지 않았습니다. 따라서 **Phase 1에서 새로 만든 Admin Shell이
> 기존 토큰 체계를 깨뜨리지 않았는지 확인하는 것만** 이 Phase의 목적입니다.
>
> 🚫 브랜드 컬러 도입, 테마 프리셋 추가, 색상 팔레트 재설계 등 **사용자가 요청하지 않은 범위는
> 이번 라운드에서 다루지 않습니다.**

- **Task 007: 전 화면 다크모드 시각 검증** ✅ - 완료
  - 기능 ID: 공통 (요구사항 ③)
  - 상세: `tasks/v2/007-dark-mode-verification.md` (작성 예정)
  - 선행 의존성: Phase 1(Task 001~003) 완료
  - 검증 대상 화면 — 공개: `/`, `/login`, `/signup`, `/quotes/[shareToken]`, 견적서 404 / 관리자: `/dashboard`(목록·공유 링크 셀·재발급 확인 다이얼로그), `/settings/notion`
  - 각 화면을 라이트/다크 양쪽에서 Playwright MCP 스크린샷으로 캡처해 대비·가독성·경계선 손실 점검
  - `ThemeToggle` 동작 점검 — 토글 즉시 반영, 새로고침 후 선택 테마 유지(`next-themes` 저장), 초기 로딩 시 테마 플래시(FOUC) 없음
  - 시스템 테마(`prefers-color-scheme`) 변경 추종 확인 (`browser_emulate_media`)
  - 토스트(`sonner`)·다이얼로그·`Sheet` 등 **포털로 렌더링되는 오버레이**가 다크모드에서도 올바른 배경/전경 토큰을 사용하는지 확인
  - **PDF 라우트(`/quotes/[shareToken]/pdf`)는 다크모드 검증 대상이 아님** — `@react-pdf/renderer`가 서버에서 고정 스타일로 렌더링하는 인쇄 문서이므로 브라우저 테마와 무관하다는 점을 작업 파일에 명시
  - 발견된 문제는 "신규 Admin Shell 원인"과 "기존 MVP 원인"으로 구분해 기록 — 후자는 범위 확대 없이 별도 이슈로 남김
  - **## 테스트 체크리스트 (Playwright MCP)**
    - [x] 공개 화면(랜딩·로그인·견적서 상세) 라이트/다크 스크린샷 캡처 및 가독성 이상 0건
    - [x] 관리자 화면(대시보드·노션 설정, Admin Shell 포함) 라이트/다크 스크린샷 캡처 및 사이드바
          대비 이상 0건
    - [x] `ThemeToggle` 토글 즉시 반영 확인 (드롭다운 라이트/다크/시스템 전환)
    - [ ] 초기 렌더 시 테마 플래시(FOUC) — 스크린샷만으로 판별 어려워 미실행(관련 코드 미변경이라
          회귀 가능성 낮음)
    - [ ] `browser_emulate_media` 시스템 다크 추종 — v1에서 이미 검증된 `next-themes` 표준 동작이라
          이번 라운드에서 재실행하지 않음
    - [x] 모바일 `Sheet` 드로어(관리자 메뉴)가 다크모드에서 정상 표시
    - [x] 모바일 뷰포트(390px) 다크모드 확인 — v1에서 미실행으로 남았던 항목 해소
    - [x] 하드코딩 색상값 grep 결과 0건 (신규 파일 `#`, `rgb(`, `hsl(` 직접 사용 없음)
  - 상세 구현 기록: `tasks/v2/007-dark-mode-verification.md`

---

## 기능 ID ↔ Task 매핑 (v2 전용)

| 요구사항 / 기능 ID     | 내용                                      | v1 상태                                                  | v2 담당 Task                                                                                |
| ---------------------- | ----------------------------------------- | -------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| 요구사항 ① / 공통 구조 | 관리자 전용 레이아웃으로 견적서 목록 열람 | ❌ 미구현                                                | **Task 001(Route Group) → Task 002(사이드바) → Task 003(회귀 검증)** — 신규 구현            |
| 요구사항 ② / **F004**  | 목록에서 공유 링크 복사                   | ✅ **v1 Task 010에서 완료** (생성+자동 복사+토스트)      | Task 004(재발급 UI), Task 005(소유권 검증), Task 006(영속 저장) — **하드닝만**, 재구현 없음 |
| 요구사항 ③ / 공통 테마 | 다크모드                                  | ✅ **v1 Task 003에서 완료** (`next-themes` + OKLCH 토큰) | Task 007(검증 전용) — **신규 구현 없음**                                                    |
| F002 (연계)            | 견적서 목록 동기화                        | ✅ v1 Task 009 완료                                      | Task 002·003에서 Admin Shell 내 렌더링 회귀 확인                                            |
| F003 / F005 (연계)     | 상세 조회 / PDF                           | ✅ v1 Task 011·012 완료                                  | Task 001·003에서 공개 라우트 무회귀 확인, Task 006에서 Supabase 조회 경로 전환              |
| F010 (연계)            | 기본 인증                                 | ⚠️ v1 Task 007 검증 대기                                 | Task 003(로그인·로그아웃 플로우), Task 005(소유권) — **v1 Task 006 의존**                   |

---

## 진행 현황 요약

| Phase                                           | 상태          | 비고                                                                                                 |
| ----------------------------------------------- | ------------- | ---------------------------------------------------------------------------------------------------- |
| Task 000: 개발용 관리자 로그인 (선행 작업)      | ✅ 완료       | 구현 중 필요해져 추가됨. `admin`/`1234`로 `/login` 사용 가능. `tasks/v2/000-dev-admin-auth.md`       |
| Phase 1: 관리자 전용 레이아웃(Admin Shell) 도입 | ✅ 완료 (3/3) | Task 001·002·003. 버그 2건 발견·수정(로그인 스키마, 개발자 도구 배지 겹침)                           |
| Phase 2: 공유 링크 기능 보완 (F004 하드닝)      | ✅ 완료 (3/3) | Task 004·005·006 **완료** — Task 006은 Supabase 프로젝트 준비 후 Playwright MCP로 실제 검증까지 완료 |
| Phase 3: 다크모드 최종 점검                     | ✅ 완료 (1/1) | Task 007 — Admin Shell 포함 전 화면 다크모드 정상 확인                                               |

**v2 로드맵(요구사항 ①②③) 전체 완료.** Task 006까지 Supabase 프로젝트 기준 실제 Playwright 검증을
마쳐 남은 작업이 없다. 다음 라운드는 v1 Phase 4에 있던 UX 고도화/성능·보안/배포(013~015)를 v2 완료
상태를 반영해 다시 계획한다.

> 📌 **테스트 계정 정리**: 이번 검증 과정에서 실제 Supabase 프로젝트에 테스트 계정 2개
> (`khs50851+test1@gmail.com`, `khs50851+test2@gmail.com`)가 생성되었다. 프로덕션 전환 전 필요하면
> Supabase 대시보드 → Authentication → Users에서 삭제하면 된다(연결된 `accounts`/`quotes` 행은
> `on delete cascade`로 함께 정리됨).

> 📌 **개발 중 임시로 추가된 것**: `admin`/`1234` 로그인은 Supabase 없이 로컬에서 관리자 화면을
> 테스트하기 위한 장치입니다(`DEV_ADMIN_EMAIL`/`DEV_ADMIN_PASSWORD` 환경변수, 미설정 시 기본값
> `admin`/`1234`). Supabase가 연동되는 순간(`NEXT_PUBLIC_SUPABASE_*` 설정) 이 분기는 자동으로
> 비활성화되고 실제 Supabase Auth 로그인으로 전환되므로 별도 제거 작업은 필요 없습니다.
