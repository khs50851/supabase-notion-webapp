# Task 008: 노션 연동 설정 저장 및 연결 검증 구현

## 개요

- 기능 ID: F001
- 목적: 관리자가 Notion API 키/데이터베이스 ID를 입력하면 실연결 검증 후 계정에 저장

## 관련 파일

- `app/settings/notion/actions.ts` — 서버 액션(`saveNotionSettings`, `disconnectNotionSettings`)
- `lib/notion/client.ts` — 계정별 Notion 클라이언트 팩토리 (`server-only`)
- `lib/notion/schema.ts` — 필수 프로퍼티(`클라이언트명`/`총 금액`/`발행일`/`항목`) 검증 및 Items 데이터소스 ID 탐지
- `lib/notion/verify-connection.ts` — `databases.retrieve` → `dataSources.retrieve` 검증 흐름
- `components/settings/notion-settings-form.tsx`
- `app/settings/notion/page.tsx`

## 수락 기준

- [ ] 유효한 키·DB ID 저장 시 성공 및 대시보드 리디렉션 (Supabase 프로젝트 연결 후 검증 필요)
- [x] `npx tsc --noEmit` / `npm run lint` 통과

## 구현 단계

- [x] `lib/notion/client.ts` — 계정별 API 키로 Notion 클라이언트 생성, `server-only` 가드
- [x] `lib/notion/schema.ts` — 필수 프로퍼티 이름 상수화 및 누락분 검사 함수
- [x] `lib/notion/verify-connection.ts` — 저장 전 실연결 검증
      (`unauthorized`/`object_not_found`/`schema_mismatch` 구분 처리)
- [x] `app/settings/notion/actions.ts` — 세션 사용자 기준으로 `accounts`에 저장/해제
- [x] `notion-settings-form.tsx` — RHF+zod, API 키 `type="password"`, 연동 상태 `Badge`,
      저장된 키 마스킹 노출, 연동 해제 버튼
- [x] `app/settings/notion/page.tsx` — 현재 계정의 연동 상태를 서버에서 조회해 폼에 전달

## 주의: 노션 API 5.x(데이터소스 모델) 대응

`@notionhq/client` 5.26.0부터 `databases.retrieve()`는 `properties`를 직접 반환하지 않고
`data_sources` 참조 배열만 제공한다. 실제 프로퍼티 스키마는 `dataSources.retrieve()`로 다시
조회해야 하므로 `verify-connection.ts`에서 두 단계로 처리했다. (Task 009 구현 시 견적 데이터도
`dataSources.query()`를 사용해야 함 — 기존 `databases.query()`는 이 버전에서 사용 불가)

## 테스트 체크리스트 (Playwright MCP)

> Supabase 프로젝트가 없어 아직 실행 불가. 추가로 테스트용 노션 통합(integration)과
> `클라이언트명`/`총 금액`/`발행일`/`항목`(relation) 프로퍼티를 가진 invoice 테스트 데이터베이스,
> 그리고 여기에 연결된 Items 데이터베이스(`항목명`/`수량`/`단가`)도 필요

- [ ] 유효한 키·DB ID 저장 시 성공 토스트 및 대시보드 리디렉션 확인
- [ ] 잘못된 API 키 저장 시도 시 "API 키가 올바르지 않습니다" 계열 에러 노출, DB 저장 미발생
- [ ] 잘못된 DB ID 저장 시도 시 구분된 에러 메시지 노출
- [ ] 재방문 시 저장된 값이 마스킹되어 표시되고 원문 키가 네트워크 응답에 없음 확인
- [ ] 빈 값/공백 제출 시 zod 검증 메시지 노출 및 요청 미발생

## 변경 사항 요약

F001 저장 로직을 서버 액션으로 구현. 노션 실연결 검증(권한/존재/스키마 3단계)과 에러별 한국어
메시지 매핑을 완료했고, 저장된 키는 마스킹된 형태로만 클라이언트에 내려가도록 처리(원문은
`accounts.notion_api_key`에만 저장, `select` 응답도 서버 컴포넌트에서만 사용 후 마스킹해 전달).
Supabase 프로젝트 부재로 실제 저장/검증 테스트는 아직 수행하지 못함.

## 2026-09-26 재작업

사용자가 제공한 실제 노션 CSV로 최초 구현의 스키마 가정 오류가 확인되어 검증 로직을 재작성했다.

### 고친 오류

1. **프로퍼티 이름 오류** — 금액 프로퍼티 이름을 `합계`+`금액` 표기로 잘못 가정했으나 실제 이름은
   **`총 금액`**. 저장소 전체(`lib/notion/schema.ts`, `app/dashboard/page.tsx` 주석, `docs/PRD.md`,
   `docs/ROADMAP.md`, 이 문서)에 퍼져 있던 잘못된 문자열을 전부 수정했고, 최종 Grep으로 옛 이름이
   한 곳도 남지 않았음을 확인했다.
2. **1개 DB 가정 오류** — 견적서와 항목은 relation으로 연결된 **2개 데이터베이스**(invoice / Items)다.
   기존 검증은 invoice DB 한 곳만 확인해서, Items DB에 통합이 공유되지 않았거나 항목 프로퍼티가
   빠져 있어도 저장이 성공해 Task 009 동기화 시점에야 실패했을 상황이었다.

### 설계 결정 (사용자 확정)

- 설정 화면은 **invoice DB ID만 입력**받는다. Items DB ID는 invoice DB `항목` relation 프로퍼티의
  `relation.data_source_id`에서 자동 탐지하므로 `accounts` 컬럼 추가도, 폼 필드 추가도 하지 않는다.
  (`lib/schemas/notion.ts`, `components/settings/notion-settings-form.tsx`,
  `app/settings/notion/page.tsx`는 변경 없음)
- 노션 프로퍼티 한글 이름은 이번 CSV 기준으로 하드코딩 고정한다. 계정별 프로퍼티 매핑 UI는 만들지 않는다.

### 변경 파일

- `lib/notion/schema.ts` — `validateNotionDatabaseSchema` / `NOTION_REQUIRED_PROPERTIES` 제거하고
  `getMissingInvoiceProperties` / `getMissingItemProperties` / `getItemsDataSourceId` 3개 함수로 재작성.
  프로퍼티 이름 상수는 `types/notion.ts`에서 import (중복 정의 제거).
  `항목`은 존재 여부뿐 아니라 `type === "relation"`인지까지 확인해 타입이 다르면 누락으로 취급.
- `lib/notion/verify-connection.ts` — invoice → Items 순차 검증으로 재작성.
  `databases.retrieve` → invoice `dataSources.retrieve` → 필수 속성 검사 →
  `항목` relation에서 Items 데이터소스 ID 추출 → Items `dataSources.retrieve` → Items 필수 속성 검사.
  통합은 DB마다 개별 공유라서 Items 조회만 따로 실패할 수 있으므로, 해당 호출을 별도 try/catch로 감싸
  `items_unauthorized` / `items_object_not_found`를 invoice 쪽 에러와 구분해 반환한다.
  에러 타입도 `schema_mismatch` → `invoice_schema_mismatch` / `items_schema_mismatch`로 분리.
- `types/api.ts` — `NOTION_ITEMS_UNAUTHORIZED` / `NOTION_ITEMS_NOT_FOUND` 추가.
  `NOTION_SCHEMA_MISMATCH`는 invoice/Items 양쪽 스키마 불일치에 공용으로 쓰고 메시지 문구로 구분.
- `app/settings/notion/actions.ts` — 새 에러 타입별 한국어 메시지 매핑 추가
  (Items DB 통합 미공유 / relation 연결 오류를 사용자가 구분할 수 있는 안내 문구).

> 참고: `@notionhq/client` 5.x의 relation 프로퍼티 응답은
> `{ type: "relation", relation: { database_id, data_source_id, type? } }` 형태이므로
> `databases.retrieve`를 추가로 호출하지 않고 `data_source_id`로 바로 Items 스키마를 조회할 수 있다.

## 2026-09-26 재작업 2 — Supabase 미연동 분기에 실연결 검증 추가

코드 점검 중 `saveNotionSettings`가 **Supabase 미연동 분기에서는 `verifyNotionConnection`을
전혀 호출하지 않고** 인메모리 더미 저장소에 곧바로 저장하는 결함을 발견해 수정했다. 수락
기준의 "저장 전 실연결 검증"이 실제로는 Supabase 연동 분기에서만 동작하고 있었다.

- `app/settings/notion/actions.ts` — `verifyNotionConnection` 호출을 두 분기가 나뉘기 **전**으로
  끌어올려 Supabase 연동 여부와 무관하게 항상 실연결 검증을 통과해야 저장되도록 수정.
  에러 매핑 로직은 `mapConnectionErrorToApiError` 헬퍼로 추출해 중복 제거.
- 검증: `npx tsc --noEmit` / `npm run lint` 통과. 실행 중인 개발 서버(`.env.local`에 실제
  Notion 자격증명 존재)에서 대시보드가 실제 워크스페이스 데이터를 보여주는 것으로 간접 확인
  (연결이 유효하지 않았다면 저장 시점에 에러가 나야 하는 경로).
