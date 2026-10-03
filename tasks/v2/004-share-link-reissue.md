# Task 004: 공유 링크 재발급 UI 추가

## 개요

- 기능 ID: F004 (하드닝 ①)
- 목적: 토큰이 이미 발급된 행에는 "링크 보기 / 복사"만 있고 재발급(rotate) 버튼이 없었다. 서버
  측 재발급 로직(`issueShareToken`의 무효화 처리)은 이미 있었으므로 UI 노출과 확인 단계만
  추가한다.

## 관련 파일

- `components/dashboard/share-link-cell.tsx` — 재발급 버튼 + `AlertDialog` 확인 단계 추가
- `components/ui/alert-dialog.tsx` — 기존 컴포넌트 재사용 (신규 작성 없음)

## 수락 기준

- [x] 미발급 행의 "생성" 버튼 동작 및 자동 클립보드 복사는 그대로 유지된다 (회귀 없음)
- [x] 발급된 행에 "재발급" 아이콘 버튼이 노출된다
- [x] 재발급 클릭 시 확인 다이얼로그("재발급하면 기존 링크는 즉시 무효화됩니다")가 뜬다
- [x] 확인 시 새 토큰 발급 + 클립보드 자동 복사 + 다이얼로그 자동 닫힘
- [x] 취소 시 토큰이 변경되지 않는다
- [x] 재발급 중에는 관련 버튼이 비활성화된다

## 구현 단계

- [x] 1단계: `ShareLinkCell`에 `confirmOpen` 상태와 `AlertDialog` 추가
- [x] 2단계: `issueAndCopy` 공용 함수로 생성/재발급 로직 통합, 재발급 시 다이얼로그 닫기 처리

## 테스트 체크리스트 (Playwright MCP)

- [x] 미발급 행: "공유 링크 생성" 클릭 → 자동 복사 토스트 확인
- [x] 발급된 행: "재발급" 버튼 → 확인 다이얼로그 → "재발급" 클릭 → 새 토큰 발급, 다이얼로그 닫힘
- [x] 재발급 직후 구 토큰 페이지(`/quotes/[구토큰]`) curl → `404`
- [x] 구 토큰 PDF 라우트(`/quotes/[구토큰]/pdf`) curl → `404`
- [x] 신규 토큰 페이지 curl → `200`, PDF curl → `Content-Type: application/pdf`
- [x] 콘솔 에러 0건 (`browser_console_messages`)

## 변경 사항 요약

`ShareLinkCell`에 `RefreshCw` 아이콘의 재발급 버튼과 `AlertDialog` 확인 단계를 추가했다. 재발급은
기존 `generateShareLink` 서버 액션을 그대로 재사용(최초 발급과 동일 함수가 이미 토큰 로테이션을
처리)하고, 다이얼로그는 `confirmOpen` 상태로 제어해 액션 완료 후 자동으로 닫히게 했다. Playwright로
재발급 시 구 토큰이 페이지·PDF 라우트 양쪽에서 즉시 404가 되고 신규 토큰이 정상 조회됨을 확인했다.
