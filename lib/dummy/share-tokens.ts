import "server-only"

import { generateShareTokenValue } from "@/lib/share-token"

// Supabase 미연동 상태에서 F004(공유 링크 생성)를 시연하기 위한 인메모리 토큰 저장소.
// 개발 서버 프로세스가 살아있는 동안만 유지된다 — 실제 영속 저장은 Task 006(Supabase 연결)
// 완료 후 quotes.share_token 컬럼이 담당한다.
//
// Next.js는 페이지/서버 액션(RSC 레이어)과 라우트 핸들러(route 레이어)를 별도 모듈 그래프로
// 컴파일한다. 같은 Node 프로세스라도 각 레이어가 이 파일을 독립적으로 인스턴스화하므로,
// 평범한 모듈 스코프 변수는 레이어 간에 공유되지 않는다(PDF 라우트에서 방금 발급한 토큰을
// 찾지 못하는 404가 실제로 발생했다). globalThis에 저장해 레이어를 넘어 공유되게 한다.
declare global {
  var __shareTokenStore:
    | { pageIdToToken: Map<string, string>; tokenToPageId: Map<string, string> }
    | undefined
}

const store = (globalThis.__shareTokenStore ??= {
  pageIdToToken: new Map<string, string>(),
  tokenToPageId: new Map<string, string>(),
})
const { pageIdToToken, tokenToPageId } = store

function getShareToken(notionPageId: string): string | null {
  return pageIdToToken.get(notionPageId) ?? null
}

// 재발급 시 이전 토큰의 역방향 매핑을 지워 즉시 무효화한다
function issueShareToken(notionPageId: string): string {
  const previousToken = pageIdToToken.get(notionPageId)
  if (previousToken) {
    tokenToPageId.delete(previousToken)
  }

  const token = generateShareTokenValue()
  pageIdToToken.set(notionPageId, token)
  tokenToPageId.set(token, notionPageId)
  return token
}

function findPageIdByShareToken(shareToken: string): string | null {
  return tokenToPageId.get(shareToken) ?? null
}

export { getShareToken, issueShareToken, findPageIdByShareToken }
