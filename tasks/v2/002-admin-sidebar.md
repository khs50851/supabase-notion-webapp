# Task v2-002: `AdminSidebar` 관리자 사이드바 신설

## 개요

- 기능 ID: F001·F002·F004 공통 UI 기반 (관리자 영역 셸)
- 목적: `(admin)` 라우트 그룹에 공개 영역과 구분되는 사이드바 내비게이션을 제공해 관리자 화면임을
  시각적으로 명확히 하고, 대시보드↔노션 설정 이동을 한 손에 모은다.

## 관련 파일

- `components/layout/admin-sidebar.tsx` (신규)
- `app/(admin)/layout.tsx` (적용)
- 재사용: `components/layout/nav-links.ts`(`AUTHED_NAV_LINKS`),
  `components/auth/logout-button.tsx`, `components/theme-toggle.tsx`,
  `components/ui/sheet.tsx`, `components/layout/container.tsx`

## 수락 기준

- [x] 데스크톱(`md` 이상): 좌측 고정 사이드바(w-60) + 우측 콘텐츠, 서비스명은 `/dashboard` 링크
- [x] 하단에 `ThemeToggle` + `LogoutButton` 배치
- [x] 모바일: 상단 바 + 햄버거 → `Sheet` 드로어로 동일 링크·로그아웃·테마 토글 제공
- [x] 활성 링크에 `aria-current="page"` 및 배경 강조 (`usePathname()` 기준)
- [x] 색상은 `app/globals.css`의 OKLCH 토큰 유틸리티만 사용 (하드코딩 색상/임의 `dark:` 오버라이드 없음)
- [x] `function AdminSidebar() {}` + `export { AdminSidebar }` (default export 없음),
      Base UI `render` prop 패턴 사용
- [x] `npx tsc --noEmit` / `npm run lint` / `npm run build` 통과

## 구현 단계

- [x] 1단계: `site-header.tsx` / `mobile-nav.tsx` / `theme-toggle.tsx`의 기존 패턴과
      `globals.css`의 `sidebar` 계열 토큰 확인
- [x] 2단계: 링크 렌더링을 담당하는 내부 `AdminNav`(활성 판별 + `onNavigate`) 작성
- [x] 3단계: 데스크톱 `aside` + 모바일 상단 바/`Sheet` 드로어 조합으로 `AdminSidebar` 완성
- [x] 4단계: `(admin)/layout.tsx`에 적용하고 `Container`로 콘텐츠 여백 유지
- [x] 5단계: `tsc` / `lint` / `build` 검증

## 변경 사항 요약

- `AdminSidebar` 하나가 데스크톱 사이드바와 모바일 상단 바/드로어를 모두 담당한다(`hidden md:flex`
  ↔ `md:hidden`). 링크 목록은 내부 `AdminNav`로 추출해 데스크톱/드로어가 동일 마크업을 공유한다.
- `AUTHED_NAV_LINKS`를 그대로 재사용하고 인증 상태를 다시 조회하지 않는다. `/dashboard`,
  `/settings/**`는 `proxy.ts`가 이미 가드하므로 항상 로그인 상태로 가정한다.
- 활성 판별은 `pathname === href || pathname.startsWith(href + "/")` — 하위 경로에서도 상위 메뉴가
  활성으로 보이도록 했다.
- 색상은 `bg-sidebar` / `text-sidebar-foreground` / `bg-sidebar-accent` /
  `text-sidebar-accent-foreground` / `border` / `bg-background` 토큰만 사용해 다크모드가 자동 반영된다.
- `SheetTrigger`는 `render={<Button ... />}`(Base UI 패턴)으로 구성했고, 공개 헤더용
  `MobileNav`는 손대지 않았다.
