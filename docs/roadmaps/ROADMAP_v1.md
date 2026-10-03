# 견적서 웹 확인 서비스 개발 로드맵

노션에 작성한 견적서를 클라이언트가 설치 없이 웹에서 바로 확인하고 PDF로 받아볼 수 있게 한다.

## 개요

견적서 웹 확인 서비스는 **노션으로 견적서를 작성해 클라이언트에게 전달하는 1인 프리랜서·소상공인**을 위한 **"노션 → 공유 링크 → 웹 확인 → PDF"** 파이프라인으로 다음 기능을 제공합니다:

- **노션 연동 설정 (F001)**: Notion API 키·데이터베이스 ID를 입력해 견적서 데이터 소스를 연결
- **견적서 목록 동기화 (F002)**: 연동된 노션 DB의 견적서를 불러와 대시보드에 목록으로 표시
- **견적서 상세 조회 (F003)**: 클라이언트가 로그인 없이 항목·수량·단가·합계·발행일 확인
- **공유 링크 생성 (F004)**: 견적서별 고유 공개 링크(`share_token`) 발급 및 클립보드 복사
- **PDF 다운로드 (F005)**: 상세 페이지에서 견적서를 PDF 파일로 즉시 다운로드
- **기본 인증 (F010)**: 관리자 회원가입/로그인/로그아웃 및 보호 라우트 가드

### 기술 스택 (실제 설치 기준)

| 영역          | 스택                                                                                                 |
| ------------- | ---------------------------------------------------------------------------------------------------- |
| 프레임워크    | Next.js 16.3.5 (App Router), React 19.2.8, TypeScript 5 strict                                       |
| 스타일        | Tailwind CSS v4 (config 파일 없음, `app/globals.css`의 `@theme inline`에서 토큰 관리)                |
| UI            | shadcn/ui `base-nova` 스타일 (**Base UI 기반** — `asChild` 대신 `render` prop), lucide-react, sonner |
| 폼            | react-hook-form + zod (`zodResolver`), 에러 메시지 한국어                                            |
| 데이터        | Supabase (Auth + PostgreSQL), `@supabase/ssr`                                                        |
| 외부 연동     | `@notionhq/client` (Notion API)                                                                      |
| 문서 생성     | `@react-pdf/renderer`                                                                                |
| 배포 / 패키지 | Vercel / npm                                                                                         |

> ⚠️ PRD 원문에는 "Next.js 15"로 표기되어 있으나 실제 설치 버전은 **16.3.5**입니다. 다운그레이드하지 않습니다.
> ⚠️ 테스트 프레임워크(jest/vitest/playwright-test)는 미설정입니다. 검증은 `npm run lint` + `npx tsc --noEmit` + **Playwright MCP 수동 E2E**로 수행합니다.

---

## 개발 워크플로우

1. **작업 계획**
   - 기존 코드베이스를 학습하고 현재 상태를 파악
   - 새로운 작업을 포함하도록 `docs/ROADMAP.md` 업데이트
   - 우선순위 작업은 마지막 완료된 작업 다음에 삽입

2. **작업 생성**
   - 기존 코드베이스를 학습하고 현재 상태를 파악
   - `/tasks` 디렉토리에 새 작업 파일 생성
   - 명명 형식: `XXX-description.md` (예: `002-type-definitions.md`)
   - 고수준 명세서, 관련 파일, 수락 기준, 구현 단계 포함
   - **API/비즈니스 로직 작업 시 "## 테스트 체크리스트" 섹션 필수 포함 (Playwright MCP 테스트 시나리오 작성)**
   - 예시를 위해 `/tasks` 디렉토리의 마지막 완료된 작업 참조. 예를 들어, 현재 작업이 `009`라면 `008`과 `007`을 예시로 참조
   - 이러한 예시들은 완료된 작업이므로 내용이 완료된 작업의 최종 상태를 반영함(체크된 박스와 변경 사항 요약). 새 작업의 경우 문서에는 빈 박스와 변경 사항 요약이 없어야 함. 초기 상태의 샘플로 `000-sample.md` 참조

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

## 현재 코드베이스 상태 (2026-09-26 갱신 — Task 009~012-1 완료 후)

| 구분                                                                                                                                     | 상태                                                                                                                                                              |
| ---------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 의존성 (`@notionhq/client`, `@react-pdf/renderer`, `@supabase/supabase-js`, `@supabase/ssr`, `server-only`)                              | ✅ 설치 완료                                                                                                                                                      |
| 라우트 6종 + PDF 라우트 (`/`, `/login`, `/signup`, `/dashboard`, `/settings/notion`, `/quotes/[shareToken]`, `/quotes/[shareToken]/pdf`) | ✅ 전부 실동작 완료                                                                                                                                               |
| 루트 레이아웃 (헤더·푸터·컨테이너·테마·Toaster·Tooltip)                                                                                  | ✅ 완료, `SiteHeader` 인증 상태 분기 추가                                                                                                                         |
| `components/ui/` shadcn 컴포넌트 27종                                                                                                    | ✅ 완료                                                                                                                                                           |
| 로그인/회원가입/로그아웃                                                                                                                 | ✅ `supabase.auth` 실연동 완료 (Supabase 프로젝트 연결 후 검증 필요)                                                                                              |
| `lib/supabase/client.ts` / `server.ts` / `admin.ts`                                                                                      | ✅ 완료 (`admin.ts`는 F003 공개 조회용, Supabase 연결 후 사용 예정)                                                                                               |
| `.env.example`                                                                                                                           | ✅ 변수 자리만 존재 (값 없음). 단, 실행 중인 환경의 `.env.local`에는 유효한 Notion 자격증명이 이미 설정되어 있어 Task 009~012를 실제 워크스페이스 데이터로 검증함 |
| **타입 정의 (`types/`, Account/Quote/QuoteItem)**                                                                                        | ✅ 완료 (Task 002)                                                                                                                                                |
| **`proxy.ts` (세션 갱신·라우트 가드)**                                                                                                   | ✅ 완료, 실동작 검증은 Supabase 프로젝트 연결 후 필요                                                                                                             |
| **대시보드 목록 테이블 / 상세 항목 테이블**                                                                                              | ✅ 완료 (Task 009/011) — 실제 노션 데이터로 렌더링 확인. `lib/dummy/quotes.ts`는 미연동/조회 실패 시 폴백용으로 유지                                              |
| **노션 설정 폼 (RHF+zod, 저장/해제 로직)**                                                                                               | ✅ 완료 (Task 008), Supabase 미연동 분기에도 실연결 검증이 항상 실행되도록 수정 완료                                                                              |
| **공유 링크 발급 (F004)**                                                                                                                | ✅ 완료 (Task 010) — Supabase 미연동 상태에서는 `globalThis` 기반 인메모리 저장소로 발급/재발급                                                                   |
| **견적서 상세 공개 조회 (F003)**                                                                                                         | ✅ 완료 (Task 011) — `lib/quotes-source.ts`의 `getPublicQuoteByShareToken`으로 일원화, noindex/동적 렌더링 적용                                                   |
| **PDF 생성/다운로드 (F005)**                                                                                                             | ✅ 완료 (Task 012) — 한글 폰트(NanumGothic) 임베딩, curl/grep으로 응답·폰트 구조 검증 (시각적 확인은 미완료, 아래 참고)                                           |
| **Supabase 프로젝트·테이블·RLS 마이그레이션**                                                                                            | ⚠️ SQL 작성 완료(`supabase/migrations/0001_init.sql`), **실제 프로젝트 생성/적용은 미완료 — 사용자 액션 필요 (이번 라운드 범위 제외)**                            |
| **`/tasks` 디렉토리**                                                                                                                    | ✅ 완료 (`000-sample.md`, `002`, `006`~`012-1`)                                                                                                                   |
| **git 저장소**                                                                                                                           | ✅ `git init` 완료 (커밋은 아직 안 함)                                                                                                                            |

> ⚠️ **F010(Auth)과 Task 006(Supabase 스키마)은 실제 Supabase 프로젝트가 없어 이번 라운드
> 검증에서 제외**했습니다. 대신 F001~F005는 Supabase 미연동 상태에서 `.env.local`의 Notion
> 자격증명으로 실제 워크스페이스를 사용해 Task 009~012-1까지 end-to-end로 검증했습니다.
> Supabase 프로젝트를 만들고 `.env.local`을 채운 뒤 `supabase/migrations/0001_init.sql`을
> 적용하면 Task 006~007 테스트 체크리스트와 F010, 그리고 각 기능의 Supabase 연동 분기(TODO로
> 남겨둔 부분)를 마저 진행할 수 있습니다.
>
> ⚠️ **PDF(Task 012)의 한글 렌더링은 시각적으로 직접 확인하지 못했습니다.** 이 환경에 PDF→이미지
> 변환 도구가 없어 `curl` 응답과 PDF 내부 폰트 구조(`grep`)로만 검증했습니다. 실제로 다운로드해
> 열어보고 한글이 정상적으로 보이는지 확인해주세요 (`tasks/012-pdf-download.md` 참고).

---

## 개발 단계

### Phase 1: 애플리케이션 골격 구축

- **Task 001: 프로젝트 구조 및 라우팅 설정** ✅ - 완료
  - 기능 ID: 전 기능 공통 기반
  - ✅ Next.js 16 App Router 기반 전체 라우트 구조 생성 (`/`, `/login`, `/signup`, `/dashboard`, `/settings/notion`, `/quotes/[shareToken]`)
  - ✅ 모든 주요 페이지의 껍데기 파일 생성 (내부 로직은 TODO 주석으로 명시)
  - ✅ 공통 레이아웃 (`app/layout.tsx`) — `SiteHeader` / `Container` / `SiteFooter` / `ThemeProvider` / `Toaster` / `TooltipProvider` 구성
  - ✅ 공개 동적 라우트 `app/quotes/[shareToken]/page.tsx`에서 Next.js 16 비동기 `params` 패턴 적용
  - ✅ Supabase 클라이언트 뼈대 (`lib/supabase/client.ts`, `lib/supabase/server.ts`) 및 `.env.example` 변수 정의
  - ✅ 필수 의존성 설치 (`@notionhq/client`, `@react-pdf/renderer`, `@supabase/supabase-js`, `@supabase/ssr`)

- **Task 002: 타입 정의 및 개발 기반 정비** ✅ - 완료
  - 기능 ID: 전 기능 공통 기반 (F001~F005, F010)
  - `types/database.ts` — `Account` / `Quote` / `QuoteItem` 인터페이스 정의 (PRD 데이터 모델 1:1 매핑)
    - `Account`: `id`, `email`, `notion_api_key`, `notion_database_id`, `created_at` (`password_hash`는 Supabase Auth가 관리하므로 앱 타입에서 제외)
    - `Quote`: `id`, `account_id`, `notion_page_id`, `quote_number`, `client_name`, `issued_date`, `valid_until`, `status`, `total_amount`, `share_token`
    - `QuoteItem`: `id`, `quote_id`, `item_name`, `quantity`, `unit_price`
  - `types/notion.ts` — 노션 페이지 프로퍼티 → 앱 도메인 모델 매핑 타입 정의 (`title`/`number`/`date`/`rich_text`/`select`/`relation`/`formula` 프로퍼티 대응)
  - 🔁 **2026-09-26 재작업**: 실제 노션 CSV 확인 결과 스키마 가정이 틀려 수정 (`tasks/002-type-definitions.md` 참고)
    - 견적서/항목이 relation으로 연결된 **2개 데이터베이스**(invoice / Items) 구조임을 반영 — `NotionInvoiceDatabaseSchema` / `NotionItemDatabaseSchema`로 재정의
    - 프로퍼티 이름 상수(`NOTION_REQUIRED_INVOICE_PROPERTIES` 등)를 `types/notion.ts`로 단일화 (`lib/notion/schema.ts`와 중복 정의 제거)
    - `Quote`에 `quote_number` / `status` / `valid_until` 선택 필드 추가 (`supabase/migrations/0001_init.sql`에도 nullable 컬럼 반영)
  - `types/api.ts` — API 응답 공통 래퍼 타입 (`ApiSuccess<T>` / `ApiError`) 및 에러 코드 enum 정의
  - `lib/schemas/` — zod 스키마 모듈화 (`auth.ts`: 로그인/회원가입, `notion.ts`: API 키·DB ID 검증)
  - `lib/format.ts` — 통화(원화) 및 날짜 포맷 유틸 (`formatCurrency`, `formatDate`) 작성
  - `git init` 및 초기 커밋 수행 (`.gitignore`에 `.env.local` 포함 여부 확인)
  - `/tasks` 디렉토리 생성 및 `000-sample.md` 템플릿 작성
  - 검증: `npx tsc --noEmit` 통과, 기존 폼의 인라인 zod 스키마가 `lib/schemas/auth.ts`로 이관되어도 동작 동일

---

### Phase 2: UI/UX 완성 (더미 데이터 활용)

- **Task 003: 공통 컴포넌트 라이브러리 및 레이아웃 구축** ✅ - 완료
  - 기능 ID: 전 기능 공통 기반
  - ✅ shadcn/ui `base-nova` 기반 컴포넌트 27종 도입 (`button`, `card`, `input`, `label`, `table`, `dialog`, `badge`, `skeleton`, `sonner` 등)
  - ✅ 레이아웃 컴포넌트 구현 (`components/layout/container.tsx`, `site-header.tsx`, `site-footer.tsx`, `mobile-nav.tsx`, `nav-links.ts`)
    - 🔁 `nav-links.ts` / `site-header.tsx` / `mobile-nav.tsx`는 **Task 007에서 인증 상태 분기로 확장됨**
      (정적 `NAV_LINKS` → `getNavLinks(isAuthenticated)`, `SiteHeader`는 async 서버 컴포넌트로 전환)
  - ✅ 다크모드 지원 (`next-themes` + `components/theme-toggle.tsx`, Base UI `render` prop 패턴 적용)
  - ✅ Tailwind v4 CSS-first 디자인 토큰 (`app/globals.css`의 `@theme inline` / `:root` / `.dark`)
  - ✅ 토스트 알림 기반 구축 (`sonner`의 `Toaster` 루트 마운트)

- **Task 004: 인증·랜딩 페이지 UI 구현** ✅ - 완료
  - 기능 ID: F010
  - ✅ 서비스 소개 랜딩 페이지 (`app/page.tsx`) — 가치 제안 카피 + 로그인/회원가입 CTA
  - ✅ 로그인 폼 (`components/auth/login-form.tsx`) — 이메일/비밀번호 입력, 회원가입 이동 링크
  - ✅ 회원가입 폼 (`components/auth/signup-form.tsx`) — 이메일/비밀번호/비밀번호 확인, 로그인 이동 링크
  - ✅ react-hook-form + zod 검증 및 한국어 에러 메시지 적용 (비밀번호 8자 이상, 비밀번호 일치 `refine`)
    - 스키마는 Task 002에서 `lib/schemas/auth.ts`로 이관됨 (`loginFormSchema` / `signupFormSchema`) —
      두 폼 모두 인라인 정의 없이 이 모듈을 import
  - ✅ 제출 중 로딩 상태(`isSubmitting`) 및 성공/실패 토스트 처리
    - 🔁 초기 구현의 `setTimeout` 목업은 **Task 007에서 제거되어 `supabase.auth.signInWithPassword` /
      `signUp` 실연동으로 교체 완료** (에러 메시지는 `lib/supabase/auth-errors.ts`에서 한국어 매핑)

- **Task 005: 대시보드·노션 설정·견적서 상세 UI 완성** ✅ - 완료
  - 기능 ID: F001, F002, F003, F004, F005 (UI 레이어)
  - > 📌 2026-09-26: 노션 설정 폼·대시보드 배너는 Task 007·008에서, 나머지(목록 테이블·
    > 공유 링크 UI·상세 페이지)는 Task 009~012에서 실데이터 기반으로 완성되어 이 Task가
    > 별도로 남겨둔 "더미 데이터 UI" 단계 없이 곧바로 실제 데이터로 마무리되었다.

  - **✅ 완료된 항목**
    - 노션 연동 설정 폼(`components/settings/notion-settings-form.tsx`) — Task 008
    - 대시보드 노션 미연동 안내 배너 — Task 007/008
    - 대시보드 견적서 목록 `Table`(`components/dashboard/quotes-table.tsx`, 발행일/클라이언트명/
      상태/총 금액/공유 링크 액션) — Task 009, 실제 노션 데이터로 렌더링 확인
    - 행별 공유 링크 생성·복사 버튼(`components/dashboard/share-link-cell.tsx`) — Task 010
    - 견적서 상세 페이지(항목 테이블/총 금액/발행일/유효기간, PDF 다운로드 버튼) — Task 011/012
    - 토큰 미존재 시 `not-found.tsx` — 기존 구현 유지, Task 011에서 재검증
  - **의도적으로 만들지 않은 것**: 목록 로딩 `Skeleton`, 모바일 카드 뷰 전환은 Phase 4(Task 013)로
    미룸 — 현재 데이터량(1~수 건)에서는 체감 이득이 없어 이번 라운드 스코프에서 제외
  - 검증: `npm run lint` + `npx tsc --noEmit` + `npm run build` 통과, 실제 노션 워크스페이스
    데이터로 전체 사용자 플로우(Playwright MCP) 확인

---

### Phase 3: 핵심 기능 구현

> 📌 2026-09-26: Task 006(Supabase 프로젝트/스키마)과 Task 007(Auth) 검증은 실제 Supabase
> 프로젝트가 없어 이번 라운드에서 제외했다(사용자 지시). Task 008~012-1은 Supabase 미연동
> 상태(`.env.local`의 Notion 자격증명 + 인메모리 더미 저장소)로 완료·검증했다.

- **Task 006: Supabase 프로젝트 및 데이터베이스 스키마 구축** ⚠️ - 코드 작성 완료 / 프로젝트 생성 대기
  - 기능 ID: F001~F005, F010 데이터 기반
  - 상세: `tasks/006-supabase-schema.md` — 마이그레이션 SQL·RLS·트리거·`admin.ts` 작성 완료.
    **Supabase 프로젝트 생성과 마이그레이션 적용은 Claude가 대신할 수 없어 사용자 액션 필요**
  - Supabase 프로젝트 생성 및 `.env.local` 구성 (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`)
  - `supabase/migrations/0001_init.sql` 작성 — `accounts` / `quotes` / `quote_items` 테이블 생성
    - `accounts.id`는 `auth.users.id`를 참조(FK)하고, 비밀번호는 Supabase Auth가 관리 (`password_hash` 컬럼 미사용)
    - `quotes.share_token`에 `unique` 제약 + 인덱스, `quotes(account_id, notion_page_id)` 복합 unique 제약(업서트 키)
    - `quote_items.quote_id`에 `on delete cascade` FK 및 인덱스
  - RLS 정책 정의
    - `accounts`: 본인 행만 `select`/`update` (`auth.uid() = id`)
    - `quotes` / `quote_items`: 소유 관리자만 CRUD, **공개 조회(F003)는 RLS를 우회하지 않고 서버 전용 클라이언트에서 `share_token` 조건으로 조회**
  - `auth.users` 신규 가입 시 `accounts` 행을 생성하는 트리거 함수 작성
  - `notion_api_key` 보호 정책 수립 — 서버 전용 접근(클라이언트 번들 노출 금지) 및 응답 시 마스킹 규칙 명문화
  - `lib/supabase/admin.ts` — 서비스 롤 키 기반 서버 전용 클라이언트 추가 (공개 견적서 조회 전용)
  - **## 테스트 체크리스트 (Playwright MCP)**
    - [ ] 마이그레이션 적용 후 `npm run dev` 기동, 콘솔에 Supabase 연결 에러 없음 확인
    - [ ] 임의 계정 2개로 교차 데이터 접근 시 RLS에 의해 차단되는지 네트워크 응답 검증
    - [ ] `notion_api_key`가 클라이언트로 내려오는 응답에 포함되지 않는지 `browser_network_requests`로 확인

- **Task 007: Supabase Auth 인증 및 라우트 가드 구현** ⚠️ - 코드 작성 완료 / 검증 대기
  - 기능 ID: **F010**
  - 상세: `tasks/007-auth-middleware.md` — Supabase 프로젝트 연결 후 아래 테스트 체크리스트 실행 필요
  - `components/auth/signup-form.tsx` 목업 제거 → `supabase.auth.signUp` 연동, 성공 시 로그인 페이지 또는 대시보드 이동
  - `components/auth/login-form.tsx` 목업 제거 → `supabase.auth.signInWithPassword` 연동, 성공 시 `/dashboard` 이동
  - Supabase Auth 에러 코드 → 한국어 메시지 매핑 (`invalid_credentials`, `user_already_exists`, `weak_password` 등)
  - 로그아웃 구현 — `components/auth/logout-button.tsx` + `supabase.auth.signOut` 후 `/login` 리디렉션
  - `proxy.ts` 신규 작성 — `@supabase/ssr` 세션 갱신 및 라우트 가드
    - 보호 라우트(`/dashboard`, `/settings/**`): 미인증 시 `/login` 리디렉션
    - 비로그인 전용 라우트(`/login`, `/signup`): 인증 상태면 `/dashboard` 리디렉션
    - 공개 라우트(`/`, `/quotes/**`): 가드 제외 (`matcher` 설정)
  - `components/layout/nav-links.ts` 및 `site-header.tsx` — 인증 상태별 메뉴 분기 (비로그인: 로그인·회원가입 / 로그인: 대시보드·노션 연동 설정·로그아웃)
    - 🔁 **2026-09-26 점검 보완**: 데스크톱 헤더에만 로그아웃 버튼이 있어 모바일(`mobile-nav.tsx`
      `Sheet` 메뉴)에서는 로그아웃 수단이 없던 문제를 수정
  - **## 테스트 체크리스트 (Playwright MCP)**
    - [ ] 회원가입 → 로그인 → 대시보드 진입 전체 플로우 성공
    - [ ] 잘못된 비밀번호 입력 시 한국어 에러 메시지 노출 및 리디렉션 미발생
    - [ ] 비로그인 상태로 `/dashboard`, `/settings/notion` 직접 접근 시 `/login`으로 리디렉션
    - [ ] 로그인 상태로 `/login`, `/signup` 접근 시 `/dashboard`로 리디렉션
    - [ ] 로그아웃 후 뒤로가기(`browser_navigate_back`)로 대시보드 복귀 불가 확인
    - [ ] 새로고침 후에도 세션 유지(쿠키 기반) 확인

- **Task 008: 노션 연동 설정 저장 및 연결 검증 구현** ✅ - 완료
  - 기능 ID: **F001**
  - 상세: `tasks/008-notion-settings.md`
  - 서버 액션 `app/settings/notion/actions.ts` — `notion_api_key` / `notion_database_id` 저장
  - 저장 전 Notion API 실연결 검증 — invoice → Items 2단계, 각 단계 실패를 구분한 한국어 에러
  - 🔁 **2026-09-26 재작업 2**: **Supabase 미연동 분기가 실연결 검증을 건너뛰던 버그를 수정** —
    `verifyNotionConnection`을 두 분기 이전으로 끌어올려 항상 실행되도록 함
    (`mapConnectionErrorToApiError` 헬퍼로 에러 매핑 중복 제거). `tasks/008-notion-settings.md`
    "재작업 2" 참고
  - **## 테스트 체크리스트 (Playwright MCP)** — 실행 중인 개발 서버(`.env.local`에 실제 Notion
    자격증명 존재)로 간접 확인. Supabase 연동 후 계정별 저장/에러 분기 재검증 필요
    - [x] `npx tsc --noEmit` / `npm run lint` 통과
    - [x] 저장 전 실연결 검증이 Supabase 연동 여부와 무관하게 항상 실행됨 (코드 경로 확인)
    - [ ] 잘못된 키/DB ID에 대한 에러 메시지 분기 — 의도적으로 잘못된 값을 입력해보는 시나리오는
          실행하지 않음 (기존 유효 자격증명을 건드리지 않기 위해)

- **Task 009: 견적서 목록 동기화 구현** ✅ - 완료
  - 기능 ID: **F002**
  - 상세: `tasks/009-quote-sync.md`
  - `lib/notion/quotes.ts` — invoice 데이터소스 쿼리로 견적서를 가져와 `항목` relation의 Items
    페이지를 조회해 `Quote`/`QuoteItem`으로 매핑, `has_more`/`next_cursor` 루프로 전량 수집
  - Supabase 미연동 상태에서는 매 요청마다 노션을 직접 조회하는 구조라 별도 "동기화" 버튼/캐시
    무효화는 만들지 않음 — Supabase 업서트는 Task 006 완료 후로 미룸(사용자 지시로 이번 라운드 제외)
  - **## 테스트 체크리스트 (Playwright MCP)** — `tasks/009-quote-sync.md`에 상세 기록
    - [x] 연동 계정: 실제 노션 데이터(발행일/클라이언트명/총 금액)가 정확히 표시됨을 확인
    - [x] 총 금액 원화 포맷(`₩5,000,000`) 렌더링 확인
    - [ ] 100건 초과 페이지네이션 — 테스트 데이터 부족으로 코드 리뷰로만 확인

- **Task 010: 공유 링크 생성 및 복사 구현** ✅ - 완료
  - 기능 ID: **F004**
  - 상세: `tasks/010-share-link.md`
  - `lib/dummy/share-tokens.ts`(신규) — `globalThis` 기반 인메모리 토큰 저장소(발급/조회/재발급)
  - `app/dashboard/actions.ts`(신규) — `generateShareLink` 서버 액션, Supabase 연동 분기는 TODO
  - `components/dashboard/share-link-cell.tsx`(신규) — 미발급 시 생성 버튼, 발급 후 링크 보기+복사
  - 🐛 **버그 수정**: 처음엔 평범한 모듈 스코프 `Map`으로 구현했다가, Next.js가 페이지/서버
    액션(RSC 레이어)과 라우트 핸들러(route 레이어)를 별도 모듈로 컴파일해 상태가 공유되지 않는
    문제를 실제로 재현(PDF 라우트 404) — `globalThis`로 수정
  - **## 테스트 체크리스트 (Playwright MCP)**
    - [x] 생성 버튼 클릭 → "링크 보기"+복사로 전환, 콘솔 에러 없음
    - [x] 발급된 토큰이 상세 페이지·PDF 라우트 양쪽에서 정상 조회됨 (globalThis 수정 후)
    - [x] 존재하지 않는 토큰은 페이지·PDF 모두 404
    - [ ] 타 계정 권한 경계 — Supabase/계정 개념이 아직 없어 미실행

- **Task 011: 견적서 상세 공개 조회 구현** ✅ - 완료
  - 기능 ID: **F003**
  - 상세: `tasks/011-quote-detail.md`
  - `lib/quotes-source.ts`에 `getPublicQuoteByShareToken` 추가 — 상세 페이지·PDF 라우트 공용
    진입점으로 Supabase 연동 여부 분기를 한 곳에만 둠
  - `app/quotes/[shareToken]/page.tsx` — `robots: noindex` 메타데이터, `dynamic = "force-dynamic"`
  - **## 테스트 체크리스트 (Playwright MCP)**
    - [x] 비로그인 상태 공유 링크 접근 시 실제 데이터(항목 3건, 합계 ₩5,000,000) 정확히 표시
    - [x] 발행일 한국어 포맷 확인, 항목 0건 엣지 케이스 정상 표시
    - [x] 존재하지 않는 토큰 404 확인
    - [ ] 모바일 뷰포트 시각 확인 — 미실행

- **Task 012: PDF 생성 및 다운로드 구현** ✅ - 완료
  - 기능 ID: **F005**
  - 상세: `tasks/012-pdf-download.md`
  - `components/pdf/quote-document.tsx`(신규) — 헤더/클라이언트 정보/항목 테이블/총 금액
  - 한글 폰트(NanumGothic)를 Google Fonts 공식 저장소 URL에서 요청 시점에 로드 (바이너리 미커밋 —
    트레이드오프는 `tasks/012-pdf-download.md` 참고)
  - `app/quotes/[shareToken]/pdf/route.tsx`(신규) — `renderToStream` → `Readable.toWeb`으로 스트림 응답
  - **## 테스트 체크리스트 (Playwright MCP / curl)**
    - [x] `curl`로 `200 OK`, `application/pdf`, 한글 파일명 RFC 5987 인코딩 확인
    - [x] PDF magic bytes 및 `/Type0`+`/CIDFontType2`+`/FontFile2` 임베딩 구조 확인
    - [x] 항목 0건 엣지 케이스, 잘못된 토큰 404 확인
    - [ ] **시각적 렌더링 미확인** — 이 환경에 PDF 뷰어/변환 도구가 없어 실제로 눈으로 확인하지
          못함. 사용자가 직접 다운로드해 한글이 정상 표시되는지 확인 권장

- **Task 012-1: 핵심 기능 통합 테스트** ✅ - 완료 (범위 조정)
  - 기능 ID: F001~F005 (F010은 Supabase 미연결로 이번 라운드 제외)
  - 상세: `tasks/012-1-integration-test.md`
  - Playwright MCP + curl로 F002→F004→F003→F005 전체 플로우를 실제 노션 워크스페이스 데이터로
    검증 (대시보드 목록 → 공유 링크 생성 → 비로그인 상세 조회 → PDF 다운로드)
  - 검증 중 실제 버그 2건 발견 및 즉시 수정 (Task 008 검증 누락, Task 010/012의 Next.js 레이어
    간 상태 미공유)
  - `npx tsc --noEmit` / `npm run lint` / `npm run build` 최종 통과
  - **미실행 항목**: 타 계정 권한 경계(F010 의존), Notion API 장애 주입, 대량 데이터 페이지네이션

---

### Phase 4: 고급 기능 및 최적화

- **Task 013: 사용자 경험 및 에러 핸들링 고도화**
  - 기능 ID: F002, F003, F005 보강
  - App Router `loading.tsx` / `error.tsx` / `not-found.tsx` 전 구간 배치 및 재시도 UX 제공
  - 동기화 진행 상태 표시 개선 (진행률 또는 단계별 피드백) 및 낙관적 UI 적용
  - 대시보드 목록 검색·정렬(발행일/클라이언트명/금액) 및 페이지네이션 추가
  - 접근성 보강 — 폼 레이블·`aria-live` 토스트 알림·키보드 내비게이션·포커스 트랩 점검
  - 공유 링크 QR 코드 및 견적서 미리보기 모달 (선택 기능)

- **Task 014: 성능 최적화 및 보안 강화**
  - 기능 ID: 전 기능 공통
  - Notion 동기화 결과 캐싱 및 `revalidateTag` 기반 무효화 전략 적용
  - `notion_api_key` 암호화 저장(Supabase Vault 또는 앱 레벨 암복호화) 전환 검토 및 적용
  - 공개 견적서 라우트 및 PDF 라우트 레이트리밋 적용 (토큰 브루트포스 방어)
  - 보안 헤더 설정 (`next.config.ts`의 CSP / `X-Content-Type-Options` / `Referrer-Policy`)
  - 번들 분석 및 `@react-pdf/renderer` 서버 전용 격리로 클라이언트 번들 경량화
  - 이미지/폰트 최적화 및 Lighthouse 성능·접근성 점수 측정

- **Task 015: 배포 및 운영 환경 구성**
  - 기능 ID: 전 기능 공통
  - Vercel 프로젝트 연결 및 환경변수 등록 (Preview / Production 분리)
  - Supabase 마이그레이션 배포 파이프라인 정리 및 프로덕션 RLS 정책 재검증
  - GitHub Actions CI 구성 — `npm run lint` + `npx tsc --noEmit` + `next build` 게이트
  - 에러 모니터링 및 로깅 연동 (Sentry 또는 Vercel Observability)
  - 운영 문서화 — `README.md` 환경 설정 가이드, 노션 DB 프로퍼티 요구 스펙 문서화
  - 프로덕션 스모크 테스트 (Playwright MCP로 배포 URL 대상 핵심 플로우 재확인)

---

## 기능 ID ↔ Task 매핑

| 기능 ID | 기능명             | 담당 Task                                                                                           |
| ------- | ------------------ | --------------------------------------------------------------------------------------------------- |
| F001    | 노션 연동 설정     | Task 005(UI) ✅, **Task 008(로직) ✅ 완료** — Supabase 미연동 분기 검증 누락 버그 수정 포함         |
| F002    | 견적서 목록 동기화 | Task 005(UI) ✅, **Task 009(로직) ✅ 완료** — 실제 노션 데이터로 검증                               |
| F003    | 견적서 상세 조회   | Task 005(UI) ✅, **Task 011(로직) ✅ 완료**                                                         |
| F004    | 공유 링크 생성     | Task 005(UI) ✅, **Task 010(로직) ✅ 완료** — globalThis 상태공유 버그 수정 포함                    |
| F005    | PDF 다운로드       | Task 005(UI) ✅, **Task 012(로직) ✅ 완료** — 시각적 렌더링만 미확인                                |
| F010    | 기본 인증          | Task 004(UI), **Task 007(로직) ⚠️ 코드 완료/검증 대기 — Supabase 프로젝트 필요 (이번 라운드 제외)** |
| 공통    | 구조·타입·DB       | Task 001 ✅, Task 002 ✅, Task 003 ✅, Task 006 ⚠️ 코드 완료/프로젝트 생성 대기 (이번 라운드 제외)  |

---

## 진행 현황 요약

| Phase                           | 상태          | 비고                                                                                                         |
| ------------------------------- | ------------- | ------------------------------------------------------------------------------------------------------------ |
| Phase 1: 애플리케이션 골격 구축 | ✅ 완료 (2/2) | Task 001·002 완료                                                                                            |
| Phase 2: UI/UX 완성             | ✅ 완료 (3/3) | Task 003·004·005 모두 완료 (Task 005는 더미 단계 없이 실데이터로 직접 완성)                                  |
| Phase 3: 핵심 기능 구현         | 진행 중 (5/7) | Task 008·009·010·011·012·012-1 **완료**, Task 006·007은 Supabase 프로젝트 부재로 이번 라운드 제외(검증 대기) |
| Phase 4: 고급 기능 및 최적화    | 대기          | Task 013~015                                                                                                 |

**다음 착수 작업**:

1. **(사용자 액션)** Supabase 프로젝트 생성 → `.env.local`에 `NEXT_PUBLIC_SUPABASE_URL` /
   `NEXT_PUBLIC_SUPABASE_ANON_KEY` / `SUPABASE_SERVICE_ROLE_KEY` 입력 → SQL Editor에서
   `supabase/migrations/0001_init.sql` 실행
2. 위 설정 완료 후 Task 006·007 테스트 체크리스트를 Playwright MCP로 실행해 F010(Auth)과
   RLS/트리거가 실제로 동작하는지 검증
3. Task 008~012 곳곳에 남겨둔 "Supabase 연동 후 TODO" 분기(계정별 저장, 업서트 캐시, 소유권
   검증, `admin.ts` 기반 공개 조회)를 실제 Supabase로 교체
4. Task 012의 PDF 한글 렌더링을 실제로 다운로드해 시각적으로 확인 (이 환경에서는 도구 제약으로
   미확인 — `tasks/012-pdf-download.md` 참고)
5. Phase 4(Task 013~015) 착수 — 로딩/에러 UX, 성능·보안, 배포
