import "server-only"

import { getDummyQuoteByShareToken, getDummyQuotes } from "@/lib/dummy/quotes"
import { findPageIdByShareToken, getShareToken } from "@/lib/dummy/share-tokens"
import {
  fetchQuoteFromNotion,
  fetchQuotesFromNotion,
} from "@/lib/notion/quotes"
import { getQuoteByShareTokenAdmin } from "@/lib/supabase/quotes"
import { isSupabaseConfigured } from "@/lib/supabase/is-configured"
import type { QuoteWithItems } from "@/types/database"

// Supabase 미연동 상태에서 대시보드·상세 페이지가 사용할 견적서 데이터 소스.
// .env.local의 NOTION_API_KEY / NOTION_DATABASE_ID가 있으면 실제 노션 데이터를 보여주고,
// 값이 없거나 조회가 실패하면 정적 더미로 폴백한다 (Supabase 연결 후에는 캐시 조회로 교체됨).
function getNotionEnvCredentials(): {
  apiKey: string
  databaseId: string
} | null {
  const apiKey = process.env.NOTION_API_KEY
  const databaseId = process.env.NOTION_DATABASE_ID

  return apiKey && databaseId ? { apiKey, databaseId } : null
}

async function getLiveOrDummyQuotes(): Promise<QuoteWithItems[]> {
  const credentials = getNotionEnvCredentials()

  if (credentials) {
    try {
      const quotes = await fetchQuotesFromNotion(
        credentials.apiKey,
        credentials.databaseId,
      )
      // lib/notion/quotes.ts는 저장소 방식에 중립적이라 share_token을 항상 null로 반환 — 더미
      // 스토어에 발급된 토큰이 있으면 여기서 덧씌운다
      return quotes.map((quote) => ({
        ...quote,
        share_token: getShareToken(quote.notion_page_id),
      }))
    } catch (error) {
      // 노션 조회 실패로 데모 전체가 죽지 않도록 정적 더미로 폴백한다
      console.error(
        "[quotes-source] 노션 견적서 목록 조회 실패 — 더미 데이터로 폴백",
        error,
      )
    }
  }

  return getDummyQuotes()
}

async function getLiveOrDummyQuoteByShareToken(
  shareToken: string,
): Promise<QuoteWithItems | null> {
  const credentials = getNotionEnvCredentials()

  if (credentials) {
    // 발급된 토큰이면 노션 페이지 ID를 바로 알 수 있어 목록 전체를 조회하지 않는다
    const notionPageId = findPageIdByShareToken(shareToken)

    if (notionPageId) {
      try {
        const quote = await fetchQuoteFromNotion(
          credentials.apiKey,
          notionPageId,
        )
        if (quote) {
          return { ...quote, share_token: shareToken }
        }
      } catch (error) {
        console.error(
          "[quotes-source] 노션 견적서 상세 조회 실패 — 더미 데이터로 폴백",
          error,
        )
      }
    }
  }

  return getDummyQuoteByShareToken(shareToken) ?? null
}

// 상세 페이지(F003)와 PDF 라우트(F005)가 공통으로 쓰는 공개 조회 진입점.
// Supabase 연동 여부 분기를 이 한 곳에만 두어 두 호출부가 중복 판단하지 않게 한다.
async function getPublicQuoteByShareToken(
  shareToken: string,
): Promise<QuoteWithItems | null> {
  if (!isSupabaseConfigured()) {
    return getLiveOrDummyQuoteByShareToken(shareToken)
  }

  return getQuoteByShareTokenAdmin(shareToken)
}

export {
  getLiveOrDummyQuotes,
  getLiveOrDummyQuoteByShareToken,
  getPublicQuoteByShareToken,
}
