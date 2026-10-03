# Task 011: 견적서 상세 공개 조회 구현

## 개요

- 기능 ID: F003
- 목적: 클라이언트가 로그인 없이 공유 링크로 견적서 항목·합계·발행일을 확인

## 관련 파일

- `lib/quotes-source.ts` — `getPublicQuoteByShareToken` (신규, 상세 페이지·PDF 라우트 공용 진입점)
- `app/quotes/[shareToken]/page.tsx`
- `app/quotes/[shareToken]/not-found.tsx` (기존 구현 유지)

## 수락 기준

- [x] 비로그인 상태에서 공유 링크로 접근 시 항목·수량·단가·소계·총 금액·발행일 표시
- [x] 유효하지 않은 토큰은 존재 여부를 추측할 수 없는 동일한 404 화면
- [x] 검색엔진 색인 차단 (`robots: noindex`)
- [x] `npx tsc --noEmit` / `npm run lint` 통과

## 구현 단계

- [x] `lib/quotes-source.ts`에 `getPublicQuoteByShareToken` 추가 — Supabase 연동 여부 분기를
      이 한 곳에만 두어 상세 페이지와 PDF 라우트가 동일한 진입점을 공유하도록 정리
      (이전에는 페이지 컴포넌트 안에 로컬 `getQuote` 헬퍼가 있어 PDF 라우트 추가 시 중복될 뻔했음)
- [x] `app/quotes/[shareToken]/page.tsx` — `export const metadata`로 `robots: { index: false, follow: false }`
      추가, `export const dynamic = "force-dynamic"`로 캐싱 없이 매 요청 최신 데이터 반영
- [x] PDF 다운로드 버튼을 `disabled` 자리표시자에서 실제 라우트로 연결 (Task 012와 함께 완료)

## 범위 밖으로 남긴 것 (의도적)

- "총 금액 검증(항목 소계 합과 불일치 시 처리)"은 다루지 않았다. PRD상 `total_amount`는 노션의
  `총 금액` 프로퍼티에서 그대로 가져오는 권위 있는 값이라 항목 합계와의 재검증 로직을 추가하는
  것은 이번 MVP 스코프를 벗어난다고 판단했다.

## 테스트 체크리스트 (Playwright MCP)

- [x] 비로그인 상태에서 공유 링크 접근 시 실제 노션 데이터(항목 3건, 합계 ₩5,000,000)가
      정확히 표시됨을 확인
- [x] 발행일이 한국어 날짜 포맷("2026년 9월 26일")으로 표시됨을 확인
- [x] 존재하지 않는 토큰 접근 시 404(페이지) 확인
- [x] 항목 0건 엣지 케이스(더미 `dummy-token-015`) — 200 OK, "등록된 항목이 없습니다." 정상 표시
- [ ] 모바일 뷰포트(390x844) 가독성 — 실측하지 않음 (기존 `Table` 컴포넌트가 가로 스크롤
      컨테이너를 기본 포함하므로 구조적으로는 처리되나 시각 확인은 생략)

## 변경 사항 요약

상세 페이지가 Supabase 미연동 상태에서 실제 노션 데이터를 정상적으로 공개 조회하는 것을
확인했다. 공개 조회 진입점을 `lib/quotes-source.ts`로 일원화해 Task 012(PDF)에서 동일한
로직을 재사용할 수 있게 했고, noindex/동적 렌더링 설정을 추가했다.
