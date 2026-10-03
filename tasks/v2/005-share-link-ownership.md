# Task 005: 공유 링크 소유권 검증 로직

## 개요

- 기능 ID: F004 (하드닝 ②), F010 연계
- 목적: `generateShareLink`가 전달받은 `notionPageId`를 검증 없이 그대로 신뢰해, 임의의
  `notionPageId`로도 토큰을 발급할 수 있었다. Supabase가 아직 없어 계정별 소유권 개념 자체가
  없으므로, 이번 라운드는 "현재 조회 가능한 견적서 목록에 실제로 존재하는가"만 확인하는
  최소 스텁으로 경계를 세운다.

## 관련 파일

- `app/(admin)/dashboard/actions.ts` — `getIsAuthenticated()` 인증 확인 + `isNotionPageIdAccessible()`
  존재 확인을 `generateShareLink` 진입부에 추가

## 수락 기준

- [x] 비로그인 상태(dev-admin 쿠키 없음)에서 액션 호출 시 `UNAUTHORIZED`로 거부
- [x] 현재 노션 목록에 없는 `notionPageId`로 호출 시 `NOT_FOUND`로 거부(존재하지 않음/권한 없음을
      구분하지 않는 동일 메시지)
- [x] 정상 케이스(목록에 실제로 있는 견적서)는 기존과 동일하게 발급·재발급 성공 (회귀 없음)

## 구현 단계

- [x] 1단계: `getIsAuthenticated()` 호출을 `generateShareLink` 최상단에 추가
- [x] 2단계: `isNotionPageIdAccessible()` 헬퍼 작성 — `getLiveOrDummyQuotes()` 결과에서
      `notion_page_id` 일치 여부 확인
- [x] 3단계: Supabase 연동 분기에는 `quotes.account_id = auth.uid()` 기준으로 교체할 자리에 TODO
      주석만 남김 (Task 006 후속)

## 테스트 체크리스트 (Playwright MCP)

- [x] 정상 케이스: 대시보드 목록의 실제 견적서로 생성/재발급 성공 (Task 004 테스트와 동일 플로우로
      회귀 없음 확인)
- [ ] 조작된 `notionPageId`(목록에 없는 임의 값)로 서버 액션 직접 호출 — Next.js 서버 액션의 wire
      포맷(`Next-Action` 헤더 등)을 curl로 재현하기 어려워 **코드 리뷰로만 확인**
      (`isNotionPageIdAccessible`이 `.some()` 일치 검사이므로 목록에 없으면 반드시 `NOT_FOUND` 반환)
- [ ] 비로그인 상태 직접 호출 — 동일한 이유로 **코드 리뷰로만 확인** (또한 `/dashboard` 자체가
      `proxy.ts`로 가드되어 실사용 경로에서는 도달 불가)
- [x] 거부 응답 본문에 계정/존재 여부 정보가 노출되지 않음 (메시지가 "요청한 견적서를 찾을 수
      없습니다"로 고정, 코드로 확인)
- [ ] 타 계정 교차 접근 — v1 Task 006(Supabase) 완료 후 실행 (미실행, 의존성 대기)

## 변경 사항 요약

`generateShareLink` 진입부에 인증 확인(`lib/auth/session.ts`의 `getIsAuthenticated`)과 존재/접근
가능 여부 확인(`isNotionPageIdAccessible`)을 추가했다. Supabase 미연동 상태에서는 현재 노션
워크스페이스에서 조회되는 견적서 목록에 있는 `notionPageId`만 토큰 발급을 허용한다. 정상 발급·재발급
플로우는 Task 004 Playwright 테스트에서 회귀 없이 동작함을 재확인했다.
