# Task 010: 공유 링크 생성 및 복사 구현

## 개요

- 기능 ID: F004
- 목적: 견적서별 고유 공개 링크를 관리자가 명시적으로 발급하고 클립보드로 복사

## 관련 파일

- `lib/dummy/share-tokens.ts` — 신규, 토큰 발급/조회용 인메모리 저장소
- `lib/notion/quotes.ts` — `share_token`을 데모용 결정론적 값 대신 실제 발급 여부로 매핑
- `lib/quotes-source.ts` — `fetchQuoteFromNotion` 호출을 페이지 ID 기반으로 단순화
- `app/dashboard/actions.ts` — 신규, `generateShareLink` 서버 액션
- `components/dashboard/share-link-cell.tsx` — 신규, 발급 전/후 UI 클라이언트 컴포넌트
- `components/dashboard/quotes-table.tsx`

## 수락 기준

- [x] "공유 링크 생성" 클릭 시 토큰 발급 및 클립보드 복사
- [x] 이미 발급된 견적서는 "링크 보기"/"복사" 상태로 표시되고 재방문해도 유지
- [x] 재발급 시 이전 토큰은 무효화됨 (역방향 맵에서 제거)
- [x] `npx tsc --noEmit` / `npm run lint` 통과

## 구현 단계

- [x] `lib/dummy/share-tokens.ts` — `randomBytes(24).toString("base64url")`로 추측 불가능한
      토큰 생성. 페이지 ID ↔ 토큰 양방향 Map으로 발급/조회/재발급을 O(1)에 처리
- [x] `mapInvoicePageToQuote`에서 `toDemoShareToken(pageId)`(페이지 ID 기반 결정론적 값 —
      모든 견적서가 항상 "발급된 것처럼" 보이는 문제가 있었음) 제거 → `getShareToken(pageId)`로
      교체해 실제 발급 여부(`null` 가능)를 반영
- [x] `app/dashboard/actions.ts` — Supabase 미연동 시 `issueShareToken` 호출 후
      `revalidatePath("/dashboard")`, Supabase 연동 시는 TODO 스텁(향후 `quotes.share_token` 갱신)
- [x] `components/dashboard/share-link-cell.tsx` — "use client", 미발급 시 생성 버튼, 발급 후
      "링크 보기" + 복사 아이콘 버튼. `window.location.origin`으로 절대 URL 구성

## 중요 버그 수정 — Next.js 레이어 간 모듈 상태 미공유

`lib/dummy/share-tokens.ts`를 평범한 모듈 스코프 `Map`으로 처음 구현했을 때, 대시보드(페이지+
서버 액션)에서 발급한 토큰을 PDF 라우트 핸들러(`app/quotes/[shareToken]/pdf/route.tsx`)가
찾지 못해 404가 발생했다. Next.js가 페이지/서버 액션(RSC 레이어)과 라우트 핸들러(route 레이어)를
별도 모듈 그래프로 컴파일해 같은 프로세스 안에서도 모듈 스코프 상태가 레이어별로 따로
인스턴스화되기 때문이다. `globalThis.__shareTokenStore`에 저장하도록 수정해 레이어 경계를
넘어 공유되게 했다. (Prisma 클라이언트 싱글턴에 흔히 쓰는 것과 동일한 패턴)

## 테스트 체크리스트 (Playwright MCP)

- [x] 대시보드에서 "공유 링크 생성" 클릭 → 버튼이 "링크 보기"+복사 아이콘으로 전환, 콘솔 에러 없음
- [x] "링크 보기" 클릭 → `/quotes/{token}` 정상 이동 및 견적 내용 표시
- [x] 재발급된 새 토큰이 상세 페이지·PDF 라우트 양쪽에서 모두 정상 조회됨 (globalThis 수정 후 확인)
- [x] 존재하지 않는 토큰(`this-token-does-not-exist`)으로 접근 시 페이지·PDF 라우트 모두 404
- [ ] 재발급 시 "이전" 토큰으로의 접근이 404가 되는지는 별도 실측하지 않음 (구조상 역방향 맵에서
      제거되므로 논리적으로는 보장되나, 실제로 이전 토큰을 재요청해보는 시나리오는 생략)
- [ ] 타 계정 견적서 ID로 서버 액션 호출 시 거부 — Supabase 미연동 상태라 "계정" 개념이 없어
      권한 경계 테스트는 Supabase 연동 후로 미룸

## 변경 사항 요약

공유 링크가 이제 실제로 "생성" 동작이 있어야 발급되도록 바뀌었다(이전에는 노션 페이지 ID로부터
파생된 값이라 항상 발급된 것처럼 보였음). 구현 중 Next.js의 RSC/route 레이어 분리로 인한
인메모리 상태 공유 버그를 발견하고 `globalThis` 기반으로 수정했다.
