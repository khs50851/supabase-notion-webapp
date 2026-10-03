# Task 006: Supabase 프로젝트 및 데이터베이스 스키마 구축

## 개요

- 기능 ID: F001~F005, F010 데이터 기반
- 목적: F001(노션 연동 저장)이 실제로 값을 저장할 수 있도록 `accounts`/`quotes`/`quote_items`
  스키마와 RLS 정책을 마련

## 관련 파일

- `supabase/migrations/0001_init.sql`
- `lib/supabase/admin.ts`

## 수락 기준

- [ ] Supabase 프로젝트에 마이그레이션 적용 완료 (**사용자 액션 필요** — Claude가 대신 만들 수 없음)
- [ ] `npm run dev` 기동 시 Supabase 연결 에러 없음
- [ ] RLS로 타 계정 데이터 접근 차단 확인

## 구현 단계

- [x] `supabase/migrations/0001_init.sql` 작성 — `accounts`/`quotes`/`quote_items` 테이블,
      `share_token` unique, `(account_id, notion_page_id)` 복합 unique, cascade FK
- [x] `auth.users` 신규 가입 시 `accounts` 행 생성 트리거(`handle_new_user`) 작성
- [x] RLS 정책 정의 (본인 행만 CRUD)
- [x] `lib/supabase/admin.ts` — 서비스 롤 키 기반 서버 전용 클라이언트(F003 공개 조회용)
- [ ] Supabase 프로젝트 생성 및 `.env.local` 구성 — **사용자가 직접 수행**
- [ ] 마이그레이션 실제 적용 — **사용자가 직접 수행** (SQL Editor에 `0001_init.sql` 붙여넣기
      또는 `supabase db push`)

## 테스트 체크리스트 (Playwright MCP)

> Supabase 프로젝트가 없어 아직 실행 불가 — 프로젝트 연결 후 진행

- [ ] 마이그레이션 적용 후 `npm run dev` 기동, 콘솔에 Supabase 연결 에러 없음 확인
- [ ] 임의 계정 2개로 교차 데이터 접근 시 RLS에 의해 차단되는지 네트워크 응답 검증
- [ ] `notion_api_key`가 클라이언트로 내려오는 응답에 포함되지 않는지 `browser_network_requests`로 확인

## 변경 사항 요약

마이그레이션 SQL과 서비스 롤 클라이언트는 작성 완료. 다만 Supabase 프로젝트 자체가 아직 생성되지
않아 적용/검증은 보류 상태. 사용자가 프로젝트를 만들고 `.env.local`에 `NEXT_PUBLIC_SUPABASE_URL`,
`NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`를 채운 뒤 마이그레이션을 적용하면
Task 007/008의 실제 동작 검증이 가능해짐.
