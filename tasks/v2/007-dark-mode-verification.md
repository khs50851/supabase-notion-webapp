# Task 007: 전 화면 다크모드 시각 검증

## 개요

- 기능 ID: 공통 (요구사항 ③)
- 목적: 다크모드 자체는 v1 Task 003에서 이미 완성되어 있었다. Phase 1에서 새로 만든 Admin Shell
  (사이드바, 모바일 드로어)이 기존 OKLCH 토큰 체계를 깨뜨리지 않았는지만 확인한다. 신규 구현은
  없다.

## 관련 파일

- 검증 대상: `/`, `/login`, `/quotes/[shareToken]`, `/dashboard`, `/settings/notion` (데스크톱 +
  모바일 390px)
- `next.config.ts` — 검증 과정에서 발견한 버그 수정(devIndicators 위치)

## 수락 기준

- [x] 공개 화면(랜딩/로그인/견적서 상세) 다크모드에서 대비·가독성 이상 없음
- [x] 관리자 화면(대시보드/노션 설정) 다크모드에서 사이드바 포함 대비·가독성 이상 없음
- [x] 모바일 뷰포트(390px)에서 관리자 드로어 다크모드 정상 표시
- [x] `ThemeToggle` 토글 정상 동작, 콘솔 에러 없음
- [x] 하드코딩 색상값(`#hex`, `rgb()`, `hsl()`) 0건 (신규 파일 grep 확인)

## 구현 단계

- [x] 1단계: 공개 화면(랜딩·로그인·견적서 상세) 다크모드 스크린샷 확인
- [x] 2단계: 관리자 화면(대시보드·노션 설정) 다크모드 스크린샷 확인 (데스크톱 + 모바일 드로어)
- [x] 3단계: 검증 중 발견한 버그 수정 — Next.js 개발자 도구 배지(기본 위치 `bottom-left`)가
      사이드바 하단 로그아웃/테마 버튼과 겹쳐 실제 클릭을 막는 문제. `next.config.ts`에
      `devIndicators.position: "bottom-right"` 추가로 해결
- [x] 4단계: 신규 파일(`admin-sidebar.tsx`, `share-link-cell.tsx`) 하드코딩 색상 grep 확인

## 테스트 체크리스트 (Playwright MCP)

- [x] `/` 다크모드 스크린샷 — 정상
- [x] `/quotes/[shareToken]` 다크모드 스크린샷 — 정상 (항목 테이블·PDF 버튼 대비 이상 없음)
- [x] `/settings/notion` 다크모드 스크린샷 — 정상 (연동 상태 배지·마스킹된 API 키 가독성 확인)
- [x] `/dashboard` 데스크톱(1280px) 다크모드 스크린샷 — 사이드바 포함 정상
- [x] `/dashboard` 모바일(390px) 드로어 다크모드 스크린샷 — 정상
- [x] 전 화면 콘솔 에러 0건
- [x] 하드코딩 색상 grep 0건
- [ ] `browser_emulate_media`로 시스템 다크 설정 자동 추종 — 미실행(`next-themes` 표준 동작으로
      v1에서 이미 검증된 부분이라 이번 라운드에서는 재실행하지 않음)
- [ ] 초기 렌더 FOUC(테마 깜빡임) — 스크린샷만으로는 판별 어려워 미실행. `suppressHydrationWarning`
      기반 v1 구현을 그대로 재사용했으므로 회귀 가능성 낮음(코드 미변경)

## 변경 사항 요약

Admin Shell 포함 5개 화면을 데스크톱/모바일 다크모드로 스크린샷 검증했고, 모두 정상이었다.
검증 과정에서 실사용에 영향을 주는 버그 1건(Next.js 개발자 도구 배지가 사이드바 로그아웃 버튼을
가려 클릭을 막던 문제)을 발견해 `next.config.ts`에 `devIndicators.position: "bottom-right"`를
추가해 수정했다. 신규 컴포넌트에 하드코딩 색상은 없었다.
