# Task 002: 타입 정의 및 개발 기반 정비

## 개요

- 기능 ID: 전 기능 공통 기반 (F001~F005, F010)
- 목적: 이후 모든 기능 구현이 의존하는 도메인 타입/zod 스키마/유틸을 먼저 정비

## 관련 파일

- `types/database.ts`, `types/notion.ts`, `types/api.ts`
- `lib/schemas/auth.ts`, `lib/schemas/notion.ts`
- `lib/format.ts`
- `tasks/000-sample.md`

## 수락 기준

- [x] `npx tsc --noEmit` 통과
- [x] 기존 폼(로그인/회원가입)의 인라인 zod 스키마가 `lib/schemas/auth.ts`로 이관되어도 동작 동일

## 구현 단계

- [x] `types/database.ts` — Account/Quote/QuoteItem 인터페이스 정의
- [x] `types/notion.ts` — 노션 프로퍼티 매핑 타입 정의
- [x] `types/api.ts` — `ApiSuccess<T>`/`ApiError`/`ApiErrorCode` 정의
- [x] `lib/schemas/auth.ts`, `lib/schemas/notion.ts` 모듈화
- [x] `lib/format.ts` — `formatCurrency`/`formatDate`/`maskSecret`
- [x] `git init` 수행 (`.gitignore`에 `.env*` 이미 포함되어 있어 별도 수정 불필요)
- [x] `/tasks` 디렉토리 및 `000-sample.md` 템플릿 작성

## 변경 사항 요약

도메인 타입 3종, zod 스키마 2종, 포맷/마스킹 유틸을 신규 작성. `components/auth/login-form.tsx`,
`signup-form.tsx`의 인라인 스키마를 `lib/schemas/auth.ts`로 이관. 레포에 git 저장소를 초기화(커밋은
아직 수행하지 않음 — 사용자 확인 후 진행).

## 2026-09-26 재작업

사용자가 실제 노션 워크스페이스에서 내보낸 CSV 2개를 제공해, 최초 구현 시 **추측으로 작성한 노션
스키마 가정이 틀렸음**이 확인되어 타입 정의를 수정했다.

### 확인된 실제 스키마 (CSV 기준)

- invoice(견적서) DB: `견적서 번호`(title) / `클라이언트명`(rich_text) / `발행일`(date) /
  `유효기간`(date) / `상태`(select) / `총 금액`(number) / `항목`(relation → Items DB)
- Items(항목) DB: `항목명` / `수량`(number) / `단가`(number) / `금액`(formula) / `invoice`(relation 역참조)
- 견적서와 항목은 **relation으로 연결된 별도의 두 데이터베이스**이며, 하나의 평평한 DB가 아니다.

### 수정 내용

- `types/notion.ts` 재작성
  - `NotionPropertyType`에 `select` / `relation` / `formula` 추가
  - `NotionQuoteDatabaseSchema` → `NotionInvoiceDatabaseSchema` (필수 `clientName`/`totalAmount`/
    `issuedDate`/`items`, 선택 `status`/`validUntil`). title(`견적서 번호`)은 이름을 고정하지 않고
    `type === "title"`로 탐지 (노션 DB는 항상 title 프로퍼티를 정확히 1개 가짐)
  - `NotionQuoteItemDatabaseSchema` → `NotionItemDatabaseSchema` (`itemName`/`quantity`/`unitPrice`).
    `금액`(formula, 앱이 직접 계산) / `invoice`(역참조)는 검증 대상에서 제외
  - `REQUIRED_QUOTE_PROPERTIES` 제거 → `NOTION_REQUIRED_INVOICE_PROPERTIES` /
    `NOTION_OPTIONAL_INVOICE_PROPERTIES` / `NOTION_REQUIRED_ITEM_PROPERTIES`로 대체.
    `lib/notion/schema.ts`에 중복 정의돼 있던 프로퍼티 이름을 이 파일로 단일화
- `types/database.ts` — `Quote`에 `quote_number` / `valid_until` / `status` 추가 (전부 nullable,
  Task 009 동기화 전까지는 항상 null)
- `supabase/migrations/0001_init.sql` — `quotes` 테이블에 `quote_number text` / `valid_until date` /
  `status text` 컬럼 추가. 이 마이그레이션은 아직 실제 프로젝트에 적용된 적이 없어 새 파일을 만들지
  않고 기존 정의를 직접 수정했다.
- `types/api.ts` — `NOTION_ITEMS_UNAUTHORIZED` / `NOTION_ITEMS_NOT_FOUND` 에러 코드 추가
