@AGENTS.md
@docs/PRD.md
@docs/ROADMAP.md

# claude-nextjs-starterkit2

## 프로젝트 문서

- `docs/PRD.md`: 제품 요구사항 정의서 (MVP + 1차 고도화 반영된 최신 상태)
- `docs/ROADMAP.md`: 현재 진행 중인 개발 로드맵 (v2: 관리자 레이아웃, 공유 링크 하드닝, 다크모드 검증)
- `docs/roadmaps/ROADMAP_v1.md`: MVP(v1) 완료 이력 아카이브 — 더 이상 갱신하지 않음, 참고용

## 기술 스택

- Next.js 16.3.5 (App Router) / React 19.2.8 / TypeScript 5 strict
- Tailwind CSS v4 — CSS-first 방식이라 `tailwind.config.*` 파일이 없음. 디자인 토큰은 `app/globals.css`의 `@theme inline` / `:root` / `.dark`에서 관리
- shadcn/ui, `components.json`의 `style: "base-nova"` → **Radix가 아닌 Base UI 기반**. `asChild` 대신 `render` prop 패턴 사용 (`<DialogTrigger render={<Button />}>`, 예: `components/theme-toggle.tsx`)
- react-hook-form + zod (select/checkbox는 `Controller`, 일반 input은 `register`), next-themes(다크모드), lucide-react, sonner
- 패키지 매니저: **npm** (`package-lock.json` 기준). `.claude/settings.json`의 SessionStart 훅에 "bun 사용" 안내가 있으나 실제 프로젝트/문서/커맨드는 전부 npm 기준이므로 무시할 것 — 정리되지 않은 잔재로 보임

## 구조

- `src/` 디렉터리 없음 — `app/`, `components/`, `lib/`가 프로젝트 루트에 위치. path alias `@/*` → 루트 기준
- `app/(public)/`, `app/(admin)/`: Route Group으로 공개 영역(랜딩/로그인/회원가입/견적서 상세)과
  관리자 영역(대시보드/노션 연동 설정, 사이드바 셸)의 레이아웃을 분리. Route Group은 URL 세그먼트를
  만들지 않으므로 `/dashboard` 같은 경로는 그대로 유지됨 — 새 라우트 추가 시 어느 그룹에 속하는지
  먼저 판단할 것
- `components/ui/`: shadcn CLI로 생성된 컴포넌트. 직접 새로 만들기보다 `npx shadcn@latest add <name>`으로 추가
- `components/layout/`: 헤더·푸터·컨테이너·모바일 네비(공개 영역) + `admin-sidebar.tsx`(관리자 영역 전용 사이드바/모바일 드로어)
- `components/showcase/`: UI 패턴 데모 페이지 컴포넌트
- `lib/auth/`: 인증 상태 판별을 한 곳에 모은 모듈. `session.ts`의 `getIsAuthenticated()`가 서버
  컴포넌트용 단일 진입점 — Supabase가 연동돼 있으면(`NEXT_PUBLIC_SUPABASE_*`) 실제 세션을, 아니면
  환경변수 기반 개발용 로그인(`DEV_ADMIN_EMAIL`/`DEV_ADMIN_PASSWORD`, 기본값 `admin`/`1234`) 쿠키를
  확인함. `proxy.ts`의 라우트 가드도 동일 기준을 따름 — 인증 관련 코드를 고칠 때는 이 둘을 같이 볼 것
- `lib/utils.ts`: `cn`은 서드파티 `cn` 패키지 재수출 (clsx+tailwind-merge 로컬 구현 아님)
- `hooks/`는 `components.json`에 alias만 정의되어 있고 실제 디렉터리는 없음

## 코드 컨벤션

- 컴포넌트는 `function X() { ... }` 선언 후 `export { X }` (Next.js가 default export를 강제하는 `layout.tsx`/`page.tsx` 류만 예외)
- 폼은 `react-hook-form`의 `useForm` + `zodResolver` 조합, zod 에러 메시지는 한국어로 작성 (예: `components/showcase/contact-form.tsx`)

## 커밋 규칙

- 이모지 + 컨벤셔널 커밋 (`.claude/commands/commit.md` 참고)
- **커밋에 `Co-Authored-By: Claude` 같은 서명을 절대 추가하지 않음** — `/commit`을 거치지 않고 커밋을 요청받아도 동일하게 적용

## 검증 방법

- 테스트 프레임워크 없음 (jest/vitest/playwright-test 미설정). 변경 후 `npm run lint` + `npx tsc --noEmit`으로 검증

## 주의사항

- `AGENTS.md`의 `<!-- BEGIN:nextjs-agent-rules -->` ~ `<!-- END -->` 블록은 `next dev`가 자동 재생성함 — 임의로 삭제·수정하지 말 것
- shadcn 컴포넌트 작업 시 Radix 패턴(`asChild`)을 가정하지 말 것 (위 기술 스택 참고)
- Tailwind v4는 config 파일이 없으므로 `tailwind.config.ts` 등을 새로 만들지 말 것
- 로그인 폼(`components/auth/login-form.tsx`)은 Supabase 미연동 시 완화된 zod 스키마
  (`devAdminLoginFormSchema`)를 쓰고 `noValidate`로 브라우저 기본 검증도 끔 — `admin` 같은 비-이메일
  형식 로그인이 실제 이메일 검증 스키마에 막히지 않게 하려는 의도이므로 두 스키마를 하나로 합치지
  말 것
- `next.config.ts`의 `devIndicators.position: "bottom-right"`는 의도적 설정 — 기본값(`bottom-left`)이
  관리자 사이드바 하단의 로그아웃/테마 버튼과 겹쳐 클릭을 막는 문제가 있어 옮겨둔 것이므로 되돌리지 말 것

## ⚡ 자주 사용하는 명령어

```bash
# 개발
npm run dev         # 개발 서버 실행 (Turbopack)
npm run build       # 프로덕션 빌드
npm run check-all   # 모든 검사 통합 실행 (권장)

# UI 컴포넌트
npx shadcn@latest add button    # 새 컴포넌트 추가
```

## ✅ 작업 완료 체크리스트

```bash
npm run check-all   # 모든 검사 통과 확인
npm run build       # 빌드 성공 확인
```

💡 **상세 규칙은 위 개발 가이드 문서들을 참조하세요**
