# Task v2-001: `(public)` / `(admin)` Route Group 분리

## 개요

- 기능 ID: 전 기능 공통 기반
- 목적: 공개 영역(랜딩·인증·견적서 공유)과 관리자 영역(대시보드·노션 설정)이 동일한 헤더/푸터
  레이아웃을 공유해 시각적 구분이 없던 문제를 Route Group으로 구조적으로 분리한다. URL은 그대로 유지.

## 관련 파일

- `app/layout.tsx` (슬림화)
- `app/(public)/layout.tsx` (신규)
- `app/(admin)/layout.tsx` (신규)
- `app/(public)/page.tsx`, `app/(public)/login/page.tsx`, `app/(public)/signup/page.tsx` (이동)
- `app/(public)/quotes/[shareToken]/{page.tsx,not-found.tsx,pdf/route.tsx}` (이동)
- `app/(admin)/dashboard/{page.tsx,actions.ts}` (이동)
- `app/(admin)/settings/notion/{page.tsx,actions.ts}` (이동)
- `components/dashboard/share-link-cell.tsx`, `components/settings/notion-settings-form.tsx`
  (서버 액션 import 경로 갱신)

## 수락 기준

- [x] 루트 레이아웃에는 `html`/`body`/`ThemeProvider`/`TooltipProvider`/`Toaster`/전역 `metadata`만 남음
- [x] `(public)` 레이아웃이 기존 `SiteHeader` + `Container` + `SiteFooter` 조합을 동작 변경 없이 인수
- [x] `(admin)` 레이아웃이 `AdminSidebar` + 콘텐츠(`Container className="py-10"`) 2단 구성
- [x] `/`, `/login`, `/signup`, `/dashboard`, `/settings/notion`, `/quotes/[shareToken]`,
      `/quotes/[shareToken]/pdf` URL이 전부 그대로 유지됨 (`npm run build` 라우트 트리 확인)
- [x] `proxy.ts`의 `matcher` 무수정
- [x] `npx tsc --noEmit` / `npm run lint` / `npm run build` 통과

## 구현 단계

- [x] 1단계: 기존 레이아웃/헤더/내비/토큰/`proxy.ts` 구조 파악, `app/` 내 상대경로 import 부재 확인
- [x] 2단계: `app/(public)`, `app/(admin)` 생성 후 라우트 폴더 이동 (`mv`)
- [x] 3단계: 루트 레이아웃에서 헤더/푸터 제거 → `(public)/layout.tsx`로 이전
- [x] 4단계: `(admin)/layout.tsx` 작성 (Task v2-002의 `AdminSidebar` 사용)
- [x] 5단계: `@/app/dashboard/actions`, `@/app/settings/notion/actions` import 경로를 그룹 포함
      경로로 갱신
- [x] 6단계: `tsc` / `lint` / `build` 검증 및 라우트 트리 대조

## 변경 사항 요약

- 라우트 파일은 **이동만** 했고 페이지·서버 액션 로직은 수정하지 않았다. `app/` 내부에 상대경로
  import이 없어 이동으로 깨진 참조는 없었고, 외부에서 서버 액션을 참조하던 두 컴포넌트의
  `@/app/(admin)/...` 경로만 갱신했다.
- 루트 레이아웃은 `html`/`body`/`ThemeProvider`/`TooltipProvider`/`Toaster`만 담당한다.
  `TooltipProvider`/`Toaster`는 양쪽 영역에서 모두 필요해 루트에 남겼다.
- `(admin)/layout.tsx`에 `export const dynamic = "force-dynamic"`을 추가했다. 이전에는 루트
  레이아웃의 `SiteHeader`가 쿠키를 읽어 모든 라우트가 자동으로 동적 렌더링됐는데, 관리자 영역이
  헤더 의존을 잃으면서 `/dashboard`·`/settings/notion`이 빌드 타임 프리렌더(정적)로 바뀌는
  회귀가 발생했다. 명시적으로 고정해 이전 동작(요청마다 렌더링)을 복원했다.
- 최종 빌드 라우트 트리가 변경 전과 동일함(`/` 외 전부 `ƒ`, `/_not-found`만 `○`)을 확인했고
  deprecated 경고는 없었다.
