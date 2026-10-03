"use server"

import { revalidatePath } from "next/cache"

import { getIsAuthenticated } from "@/lib/auth/session"
import { issueShareToken } from "@/lib/dummy/share-tokens"
import { fetchQuotesFromNotion } from "@/lib/notion/quotes"
import { getLiveOrDummyQuotes } from "@/lib/quotes-source"
import { createClient } from "@/lib/supabase/server"
import { isSupabaseConfigured } from "@/lib/supabase/is-configured"
import { rotateShareToken, syncQuotesForAccount } from "@/lib/supabase/quotes"
import { ApiErrorCode, type ApiResult } from "@/types/api"
import type { Account } from "@/types/database"

// Supabase 미연동 상태의 최소 소유권 검증: 현재 세션(관리자 1명)이 조회 가능한 견적서 목록에
// notionPageId가 실제로 존재하는지만 확인한다. 존재하지 않는 견적서와 권한 없는 견적서를 응답에서
// 구분하지 않아 어느 쪽이든 같은 오류 메시지를 반환한다(정보 노출 방지).
async function isNotionPageIdAccessible(
  notionPageId: string,
): Promise<boolean> {
  const quotes = await getLiveOrDummyQuotes()
  return quotes.some((quote) => quote.notion_page_id === notionPageId)
}

const NOT_FOUND_ERROR: ApiResult<never> = {
  success: false,
  error: {
    code: ApiErrorCode.NOT_FOUND,
    message: "요청한 견적서를 찾을 수 없습니다.",
  },
}

// Supabase 연동 상태의 소유권 검증 + 발급: 현재 계정의 노션 연동 정보로 실시간 목록을 동기화한
// 뒤, notionPageId가 그 목록에 있을 때만 rotateShareToken이 성공한다(WHERE account_id 조건으로
// 이중 방어). 계정 미연동/노션 조회 실패/소유하지 않은 견적서를 모두 같은 메시지로 응답한다.
async function generateShareLinkWithSupabase(
  notionPageId: string,
): Promise<ApiResult<{ shareToken: string }>> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return {
      success: false,
      error: {
        code: ApiErrorCode.UNAUTHORIZED,
        message: "로그인이 필요합니다.",
      },
    }
  }

  const { data: account } = await supabase
    .from("accounts")
    .select("notion_api_key, notion_database_id")
    .eq("id", user.id)
    .single<Pick<Account, "notion_api_key" | "notion_database_id">>()

  if (!account?.notion_api_key || !account?.notion_database_id) {
    return NOT_FOUND_ERROR
  }

  let syncedQuotes
  try {
    const notionQuotes = await fetchQuotesFromNotion(
      account.notion_api_key,
      account.notion_database_id,
    )
    syncedQuotes = await syncQuotesForAccount(user.id, notionQuotes)
  } catch (error) {
    console.error("[generateShareLink] 노션 견적서 동기화 실패", error)
    return {
      success: false,
      error: {
        code: ApiErrorCode.INTERNAL_ERROR,
        message:
          "일시적인 오류로 견적서 정보를 가져오지 못했습니다. 잠시 후 다시 시도해주세요.",
      },
    }
  }

  if (!syncedQuotes.some((quote) => quote.notion_page_id === notionPageId)) {
    return NOT_FOUND_ERROR
  }

  const shareToken = await rotateShareToken(user.id, notionPageId)
  if (!shareToken) {
    return NOT_FOUND_ERROR
  }

  revalidatePath("/dashboard")
  return { success: true, data: { shareToken } }
}

// 견적서별 공유 링크를 발급(최초 발급 또는 재발급)한다 (F004)
// notionPageId를 키로 사용 — Supabase 미연동 상태에서는 quotes 테이블이 없어 노션 페이지 ID가
// 유일한 식별자다. 재발급 시 이전 토큰은 lib/dummy/share-tokens.ts에서 즉시 무효화된다.
export async function generateShareLink(
  notionPageId: string,
): Promise<ApiResult<{ shareToken: string }>> {
  const isAuthenticated = await getIsAuthenticated()
  if (!isAuthenticated) {
    return {
      success: false,
      error: {
        code: ApiErrorCode.UNAUTHORIZED,
        message: "로그인이 필요합니다.",
      },
    }
  }

  if (!isSupabaseConfigured()) {
    if (!(await isNotionPageIdAccessible(notionPageId))) {
      return NOT_FOUND_ERROR
    }

    const shareToken = issueShareToken(notionPageId)
    revalidatePath("/dashboard")
    return { success: true, data: { shareToken } }
  }

  return generateShareLinkWithSupabase(notionPageId)
}
