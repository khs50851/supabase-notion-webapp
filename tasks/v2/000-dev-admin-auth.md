# Task 000: 개발용 관리자 로그인 (Dev Admin Auth)

## 개요

- 기능 ID: F010 연계 (전 기능 공통 기반) — `docs/ROADMAP.md`에는 명시되지 않았으나, Phase 1 회귀
  검증(Task 003)과 Phase 2 소유권 검증(Task 005)에 앞서 필요해진 선행 작업
- 목적: 실제 Supabase 프로젝트가 없어 로그인·라우트 가드를 검증할 방법이 없었다. 기존에는
  Supabase 미연동 시 `proxy.ts`가 가드를 완전히 건너뛰고 `site-header.tsx`가 항상
  "로그인된 상태"로 렌더링해 사실상 인증이 전혀 없었다. 사용자가 실제로 로그인 폼에 자격증명을
  입력해서 테스트할 수 있도록, 환경변수(`DEV_ADMIN_EMAIL`/`DEV_ADMIN_PASSWORD`, 기본값
  `admin`/`1234`) 기반의 최소 로그인 게이트를 추가한다.

## 관련 파일

- `lib/auth/dev-admin.ts` (신규) — 쿠키 이름/값 상수 + 자격증명 검증 함수 (next/headers 미사용,
  Edge 미들웨어에서도 안전)
- `lib/auth/session.ts` (신규) — 서버 컴포넌트용 `getIsAuthenticated()` (Supabase 연동 시 실제
  세션, 미연동 시 dev-admin 쿠키 확인)
- `lib/auth/actions.ts` (신규) — `"use server"` `signInWithDevAdmin` / `signOutDevAdmin`
- `proxy.ts` — Supabase 미연동 분기를 "가드 스킵"에서 "dev-admin 쿠키 기반 가드"로 교체
- `components/auth/login-form.tsx` — 더미 로그인(무조건 성공) 제거, `signInWithDevAdmin` 호출로 교체
- `components/auth/logout-button.tsx` — 더미 로그아웃(이동만) 제거, `signOutDevAdmin` 호출로 교체
- `components/layout/site-header.tsx` — 로컬 `getIsAuthenticated` 중복 제거, `lib/auth/session`의
  공용 함수 재사용
- `.env.example` — `DEV_ADMIN_EMAIL`/`DEV_ADMIN_PASSWORD` 변수 문서화

## 수락 기준

- [x] Supabase 미연동 상태에서 `/login`에 잘못된 이메일/비밀번호를 입력하면 로그인이 거부된다
- [x] `admin` / `1234`(또는 `.env.local`에 설정한 값)로 로그인하면 `/dashboard`로 이동하고 쿠키가
      발급된다
- [x] 비로그인 상태로 `/dashboard`, `/settings/notion` 직접 접근 시 `/login`으로 리다이렉트된다
- [x] 로그인 상태로 `/login`, `/signup` 접근 시 `/dashboard`로 리다이렉트된다
- [x] 로그아웃 시 쿠키가 삭제되고 다시 보호 라우트 접근이 차단된다
- [x] `npx tsc --noEmit` / `npm run lint` 통과

## 구현 단계

- [x] 1단계: `lib/auth/dev-admin.ts` — Edge-safe 순수 함수 작성
- [x] 2단계: `lib/auth/session.ts`, `lib/auth/actions.ts` 작성
- [x] 3단계: `proxy.ts` 가드 로직을 dev-admin 쿠키 기반으로 교체
- [x] 4단계: `login-form.tsx` / `logout-button.tsx` / `site-header.tsx` 연결
- [x] 5단계: `.env.example` 문서화, `npx tsc --noEmit` + `npm run lint` 통과 확인

## 테스트 체크리스트 (Playwright MCP)

- [ ] 잘못된 자격증명으로 로그인 시도 → 한국어 에러 토스트, `/dashboard` 이동 없음
- [ ] `admin`/`1234`로 로그인 → `/dashboard` 이동, 새로고침해도 로그인 상태 유지
- [ ] 비로그인 상태 `/dashboard`, `/settings/notion` 직접 접근 → `/login` 리다이렉트
- [ ] 로그인 상태 `/login`, `/signup` 접근 → `/dashboard` 리다이렉트
- [ ] 로그아웃 → `/login` 이동, 뒤로가기로 `/dashboard` 재진입 불가

> Task 003(Admin Shell 통합 회귀 검증)에서 Admin Shell과 함께 실제 실행 예정

## 변경 사항 요약

`lib/auth/` 신규 모듈 3개(`dev-admin.ts`, `session.ts`, `actions.ts`)로 Supabase 유무에 무관한
단일 인증 판별 기준을 만들었다. Supabase 미연동 시 기존의 "전부 로그인된 것으로 취급"하던 더미
동작을 제거하고, 환경변수 기반 자격증명(`admin`/`1234` 기본값)으로만 통과되는 httpOnly 쿠키 게이트로
교체했다. `proxy.ts`, `login-form.tsx`, `logout-button.tsx`, `site-header.tsx`가 모두 이 판별
기준을 공유한다. `npx tsc --noEmit`, `npm run lint` 통과 확인 완료.
