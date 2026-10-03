# Task 007: Supabase Auth 인증 및 라우트 가드 구현

## 개요

- 기능 ID: F010
- 목적: 로그인 세션을 실제로 발급/검증해 F001(노션 설정 저장)이 "로그인한 계정 기준"으로
  동작할 수 있게 함

## 관련 파일

- `components/auth/signup-form.tsx`, `login-form.tsx`, `logout-button.tsx`
- `lib/supabase/auth-errors.ts`
- `proxy.ts`
- `components/layout/nav-links.ts`, `site-header.tsx`, `mobile-nav.tsx`

## 수락 기준

- [ ] 회원가입 → 로그인 → 대시보드 진입 전체 플로우 성공 (Supabase 프로젝트 연결 후 검증 필요)
- [x] `npx tsc --noEmit` / `npm run lint` 통과

## 구현 단계

- [x] `signup-form.tsx` 목업 제거 → `supabase.auth.signUp` 연동
- [x] `login-form.tsx` 목업 제거 → `supabase.auth.signInWithPassword` 연동
- [x] `lib/supabase/auth-errors.ts` — Supabase Auth 에러 코드 → 한국어 메시지 매핑
- [x] `logout-button.tsx` + `supabase.auth.signOut` 후 `/login` 리디렉션
- [x] `proxy.ts` — `@supabase/ssr` 세션 갱신 및 라우트 가드
      (`/dashboard`, `/settings/**` 보호, `/login`·`/signup` 로그인 시 리디렉션)
- [x] `nav-links.ts`를 `getNavLinks(isAuthenticated)`로 변경, `site-header.tsx`를 async 서버
      컴포넌트로 전환해 인증 상태별 메뉴 분기

## 테스트 체크리스트 (Playwright MCP)

> Supabase 프로젝트가 없어 아직 실행 불가 — Task 006 완료 후 진행

- [ ] 회원가입 → 로그인 → 대시보드 진입 전체 플로우 성공
- [ ] 잘못된 비밀번호 입력 시 한국어 에러 메시지 노출 및 리디렉션 미발생
- [ ] 비로그인 상태로 `/dashboard`, `/settings/notion` 직접 접근 시 `/login`으로 리디렉션
- [ ] 로그인 상태로 `/login`, `/signup` 접근 시 `/dashboard`로 리디렉션
- [ ] 로그아웃 후 뒤로가기로 대시보드 복귀 불가 확인
- [ ] 새로고침 후에도 세션 유지(쿠키 기반) 확인

## 변경 사항 요약

인증 관련 코드는 모두 실제 Supabase Auth 호출로 교체 완료. `proxy.ts`는 `getUser()`로 매
요청 세션을 검증(만료 미검증 위험이 있는 `getSession()`은 사용하지 않음). Supabase 프로젝트가
없어 위 테스트 체크리스트는 아직 실행하지 못함.

## 2026-09-26 점검 보완

Task 003~005 재점검 중 데스크톱 헤더(`site-header.tsx`)에만 로그아웃 버튼이 있고 모바일
`mobile-nav.tsx`의 `Sheet` 메뉴에는 로그아웃 수단이 없어 모바일에서 로그아웃이 불가능했던
문제를 발견해 수정했다. `isAuthenticated`일 때 `Sheet` 메뉴 하단에 `LogoutButton`을 렌더링하고,
클릭 시 시트가 닫히도록 처리(`onClick`으로 `setOpen(false)` 호출).
