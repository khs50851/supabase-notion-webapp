# 견적서 웹 확인 서비스

노션(Notion)에 작성한 견적서를 클라이언트가 별도 프로그램 설치 없이 웹에서 확인하고,
필요할 때 PDF로 다운로드할 수 있는 서비스입니다. 관리자는 노션 DB를 연동해 견적서
목록을 불러오고, 견적서별 공유 링크를 생성해 클라이언트에게 전달합니다.

## 기술 스택

- **Next.js 16** (App Router)
- **React 19** / **TypeScript** (strict)
- **Tailwind CSS v4** (CSS-first 설정, `tailwind.config` 파일 없음)
- **shadcn/ui** — `base-nova` 스타일. Radix가 아닌 **Base UI(`@base-ui/react`)** 기반입니다.
- **next-themes** — 라이트/다크/시스템 다크모드
- **react-hook-form + zod** — 폼 상태 관리 및 검증
- **lucide-react** — 아이콘
- **@supabase/supabase-js, @supabase/ssr** — 인증 + PostgreSQL DB
- **@notionhq/client** — 노션 API 연동
- **@react-pdf/renderer** — 견적서 PDF 생성

## 폴더 구조

```
app/
  layout.tsx             루트 레이아웃 (ThemeProvider, 헤더/푸터, Toaster)
  page.tsx                서비스 소개 랜딩 페이지
  login/                  로그인 페이지 (F010)
  signup/                 회원가입 페이지 (F010)
  dashboard/              견적서 목록 대시보드 (F002, F004) — 관리자 로그인 필수
  settings/notion/        노션 연동 설정 페이지 (F001) — 관리자 로그인 필수
  quotes/[shareToken]/    견적서 상세 페이지 (F003, F005) — 공유 링크 공개 접근
  globals.css             Tailwind v4 테마 토큰 (다크모드 포함)
components/
  auth/                   로그인/회원가입 폼, 로그아웃 버튼
  settings/               노션 연동 설정 폼 (F001)
  theme-provider.tsx      next-themes 래퍼
  theme-toggle.tsx        라이트/다크/시스템 토글 버튼
  layout/                 헤더, 푸터, 컨테이너, 모바일 내비게이션
  ui/                     shadcn/ui 컴포넌트 (npx shadcn add로 설치)
lib/
  utils.ts                cn 유틸리티 재노출
  format.ts               통화/날짜 포맷, 민감값 마스킹
  schemas/                zod 스키마 (auth, notion)
  notion/                 Notion 클라이언트 및 연결 검증 (서버 전용)
  supabase/               Supabase 클라이언트 (브라우저/서버/서비스 롤)
types/                    Account/Quote/QuoteItem, 노션 스키마, API 응답 래퍼 타입
proxy.ts                  세션 갱신 + 라우트 가드 (Next.js 16에서 middleware.ts를 대체)
supabase/migrations/      DB 스키마 및 RLS 마이그레이션 SQL
```

## 시작하기

```bash
npm install
cp .env.example .env.local   # Supabase/Notion 키 값 입력
npm run dev
```

[http://localhost:3000](http://localhost:3000) 에서 확인할 수 있습니다.

## 환경 변수

`.env.example`을 참고해 `.env.local`을 구성하세요.

- `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_SERVICE_ROLE_KEY`: Supabase 프로젝트 연결
- `NOTION_API_KEY`, `NOTION_DATABASE_ID`: 로컬 개발용 기본값. 실제 서비스에서는 관리자별
  값을 노션 연동 설정 페이지(F001)에서 입력받아 DB에 저장합니다.

## 다크모드

헤더 우측의 토글 버튼에서 라이트/다크/시스템 테마를 선택할 수 있습니다. `next-themes`가 `<html>`의 `class` 속성을 전환하고, `app/globals.css`의 `.dark` 클래스 토큰이 이를 반영합니다.

## 컴포넌트 추가하기

```bash
npx shadcn@latest add <컴포넌트명>
```

`components.json`이 `style: "base-nova"`로 설정되어 있어, CLI가 Radix가 아닌 **Base UI** 기반 코드를 생성합니다. 학습 자료나 예제가 일반적인 Radix 기반 shadcn(`asChild` prop 등)을 전제로 하는 경우가 많으니, 실제로는 Base UI의 **`render` prop** 패턴(`<DialogTrigger render={<Button />}>`)을 사용한다는 점에 유의하세요.

> 참고: 이 registry에는 `form`(react-hook-form 통합 래퍼) 컴포넌트가 제공되지 않습니다. `react-hook-form`의 `Controller`와 `register`를 shadcn UI 프리미티브에 직접 연결하는 방식을 사용합니다 (`components/auth/login-form.tsx` 참고).

## 구현 현황

진행 상태의 단일 기준은 `docs/ROADMAP.md`입니다. 2026-09-26 기준 요약:

- ✅ 구현됨: 인증(회원가입/로그인/로그아웃, Supabase Auth 실연동), `proxy.ts` 라우트 가드,
  노션 연동 설정 저장 및 실연결 검증(F001), 대시보드의 노션 연동 여부 안내 배너
- ❌ 미구현: 견적서 목록 동기화(F002), 공유 링크 생성(F004), 견적서 상세 조회(F003),
  PDF 다운로드(F005) — 해당 페이지에는 `TODO` 주석으로 남은 범위를 표시해 두었습니다
- ⚠️ Supabase 프로젝트가 아직 생성되지 않아 인증·노션 저장 로직의 end-to-end 검증은 대기 중입니다

## 스크립트

```bash
npm run dev     # 개발 서버
npm run build   # 프로덕션 빌드
npm run lint    # ESLint 검사
```
