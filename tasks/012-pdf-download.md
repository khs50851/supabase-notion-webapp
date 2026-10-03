# Task 012: PDF 생성 및 다운로드 구현

## 개요

- 기능 ID: F005
- 목적: 견적서 상세 페이지에서 견적서를 PDF 파일로 다운로드

## 관련 파일

- `components/pdf/quote-document.tsx` — 신규, `@react-pdf/renderer` 문서 템플릿
- `app/quotes/[shareToken]/pdf/route.tsx` — 신규, PDF 스트림 응답 라우트 핸들러
- `app/quotes/[shareToken]/page.tsx` — 다운로드 버튼 연결

## 수락 기준

- [x] PDF 다운로드 버튼 클릭 시 `Content-Type: application/pdf`로 파일 다운로드
- [x] 파일명에 한글 포함, RFC 5987 인코딩(`filename*=UTF-8''...`) 적용
- [x] PDF 내 항목·수량·단가·소계·총 금액·발행일이 웹 화면과 일치
- [x] 잘못된 토큰으로 라우트 직접 호출 시 404
- [x] `npx tsc --noEmit` / `npm run lint` / `npm run build` 통과

## 구현 단계

- [x] `components/pdf/quote-document.tsx` — `Document`/`Page`/`View`/`Text`/`StyleSheet`로
      헤더·클라이언트 정보·항목 테이블·총 금액 영역 구성
- [x] 한글 폰트 등록 — `Font.register`로 NanumGothic Regular/Bold를 Google Fonts 공식 저장소
      (OFL 라이선스) URL에서 요청 시점에 로드. 저장소에 폰트 바이너리를 커밋하지 않음
- [x] `app/quotes/[shareToken]/pdf/route.tsx` — `renderToStream` → `Readable.toWeb`으로
      Node 스트림을 웹 `ReadableStream`으로 변환해 `Response`로 반환
- [x] 라우트에서도 `getPublicQuoteByShareToken`으로 토큰 재검증 (Task 011과 동일 진입점 재사용)
- [x] 상세 페이지의 `disabled` PDF 버튼을 `<a href="/quotes/{token}/pdf">`로 교체
      (파일 다운로드는 일반 네비게이션이라 클라이언트 컴포넌트 전환 없이 `render` prop으로 처리)

## 기술적 트레이드오프 — 폰트를 원격 URL로 로드

`@react-pdf/renderer` 기본 폰트(Helvetica 등)는 한글을 지원하지 않는다. 폰트 바이너리를
리포지토리에 커밋하는 대신, PDF 생성 시점에 서버가 Google Fonts 공식 GitHub 저장소에서
직접 내려받아 임베딩하는 방식을 택했다(다수의 react-pdf 한글 예제에서 쓰이는 방식). 장점은
저장소에 바이너리를 두지 않아도 된다는 것, 단점은 **PDF 생성마다 외부 네트워크 요청이 필요해
해당 요청이 느려지거나 실패하면 다운로드도 함께 실패**한다는 것이다. 운영 안정성이 중요해지면
`public/fonts/`에 자체 호스팅하는 방식으로 교체할 것을 권장한다.

## 테스트 체크리스트 (Playwright MCP / curl)

- [x] 실제 노션 데이터 기준 PDF 다운로드 — `curl`로 응답 확인: `200 OK`,
      `content-type: application/pdf`, `content-disposition`에 URL 인코딩된 한글 파일명
      (`견적서_ABC회사_2026-09-26.pdf`) 정상 포함
- [x] PDF magic bytes(`%PDF-1.3`) 및 파일 크기(24KB)로 유효한 PDF임을 확인
- [x] `grep`으로 PDF 내부 폰트 리소스 확인 — `/Type0` + `/CIDFontType2` + `/FontFile2` 2개
      (Regular/Bold) 임베딩 구조 확인. Helvetica 폴백이 아니라 한글 폰트가 실제로 로드되어
      사용되었음을 뒷받침
- [x] 항목 0건 엣지 케이스(더미 `dummy-token-015`) PDF도 200 OK로 정상 생성
- [x] 잘못된 토큰으로 PDF 라우트 직접 호출 시 404 확인
- [ ] **시각적 확인 미완료** — 이 환경에 PDF→이미지 변환 도구(`pdftoppm`, ImageMagick 등)가
      없어 실제로 눈으로 렌더링을 볼 수 없었다. `pdftotext`로 텍스트 추출을 시도했을 때 일부
      한글이 추출되지 않았는데, 이는 subset 폰트의 ToUnicode CMap 누락으로 흔히 발생하는
      추출 전용 이슈로 보이며(글리프는 유니코드가 아니라 글리프 ID로 직접 참조되므로 시각적
      렌더링과는 별개), 폰트 임베딩 구조(CIDFontType2)로 볼 때 시각적으로는 정상 렌더링될
      가능성이 높다고 판단했다. **사용자가 실제로 다운로드해 열어보고 한글이 정상적으로
      보이는지 확인해줄 것을 권장.**
- [ ] 항목 20건 이상 페이지 분할 — 테스트 데이터에 그만큼 많은 항목이 없어 실측하지 않음

## 변경 사항 요약

`@react-pdf/renderer`로 견적서 PDF를 생성하는 라우트를 신규 구현했다. curl/grep 기반으로
응답 헤더·파일 유효성·폰트 임베딩 구조까지 확인했으나, 실제 화면 렌더링에 대한 시각적 확인은
이 환경의 도구 제약으로 완료하지 못했다.
