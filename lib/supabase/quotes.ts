import "server-only"

import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { generateShareTokenValue } from "@/lib/share-token"
import type { Quote, QuoteItem, QuoteWithItems } from "@/types/database"

interface UpsertedQuoteRow {
  id: string
  notion_page_id: string
  share_token: string | null
}

// 노션에서 가져온 견적서를 계정 소유로 upsert하고, DB에 저장된 id/share_token을 병합해 돌려준다.
// upsert 대상 컬럼에 share_token을 포함하지 않아 기존에 발급된 토큰이 그대로 보존된다.
// RLS(quotes_insert_own/update_own)가 auth.uid() = account_id를 강제하므로 이중 방어된다.
async function syncQuotesForAccount(
  accountId: string,
  notionQuotes: QuoteWithItems[],
): Promise<QuoteWithItems[]> {
  if (notionQuotes.length === 0) {
    return []
  }

  const supabase = await createClient()

  const { data: upsertedQuotes, error: upsertError } = await supabase
    .from("quotes")
    .upsert(
      notionQuotes.map((quote) => ({
        account_id: accountId,
        notion_page_id: quote.notion_page_id,
        quote_number: quote.quote_number,
        client_name: quote.client_name,
        issued_date: quote.issued_date,
        valid_until: quote.valid_until,
        status: quote.status,
        total_amount: quote.total_amount,
      })),
      { onConflict: "account_id,notion_page_id" },
    )
    .select("id, notion_page_id, share_token")
    .returns<UpsertedQuoteRow[]>()

  if (upsertError || !upsertedQuotes) {
    throw new Error("견적서 동기화 중 오류가 발생했습니다.")
  }

  const result: QuoteWithItems[] = []

  for (const dbQuote of upsertedQuotes) {
    const notionQuote = notionQuotes.find(
      (quote) => quote.notion_page_id === dbQuote.notion_page_id,
    )
    if (!notionQuote) {
      continue
    }

    // quote_items는 노션 쪽에 안정적인 외부 키가 없어 매 동기화마다 전량 교체한다
    // (PRD상 quotes/quote_items는 "노션 견적서 캐시"라 전량 갱신이 간단하고 정확함)
    await supabase.from("quote_items").delete().eq("quote_id", dbQuote.id)

    let insertedItems: QuoteItem[] = []

    if (notionQuote.quote_items.length > 0) {
      const { data: itemRows, error: insertError } = await supabase
        .from("quote_items")
        .insert(
          notionQuote.quote_items.map((item) => ({
            quote_id: dbQuote.id,
            item_name: item.item_name,
            quantity: item.quantity,
            unit_price: item.unit_price,
          })),
        )
        .select("id, quote_id, item_name, quantity, unit_price")
        .returns<QuoteItem[]>()

      if (insertError || !itemRows) {
        throw new Error("견적 항목 동기화 중 오류가 발생했습니다.")
      }
      insertedItems = itemRows
    }

    result.push({
      id: dbQuote.id,
      account_id: accountId,
      notion_page_id: dbQuote.notion_page_id,
      quote_number: notionQuote.quote_number,
      client_name: notionQuote.client_name,
      issued_date: notionQuote.issued_date,
      valid_until: notionQuote.valid_until,
      status: notionQuote.status,
      total_amount: notionQuote.total_amount,
      share_token: dbQuote.share_token,
      quote_items: insertedItems,
    })
  }

  return result
}

// 계정 소유 견적서의 공유 링크를 발급/재발급한다 (F004). WHERE 절이 account_id까지 포함하므로
// 영향받은 행이 없으면 소유하지 않은 견적서이거나 존재하지 않는 견적서 — 어느 쪽이든 구분하지 않고
// null을 반환해 호출부가 동일한 오류 메시지로 응답하게 한다 (정보 노출 방지).
async function rotateShareToken(
  accountId: string,
  notionPageId: string,
): Promise<string | null> {
  const supabase = await createClient()
  const shareToken = generateShareTokenValue()

  const { data, error } = await supabase
    .from("quotes")
    .update({ share_token: shareToken })
    .eq("account_id", accountId)
    .eq("notion_page_id", notionPageId)
    .select("id")

  if (error || !data || data.length === 0) {
    return null
  }

  return shareToken
}

// 공개 상세/PDF(F003/F005)에서 사용 — 로그인 세션 없이 share_token만으로 조회해야 하므로
// 서비스 롤 클라이언트로 RLS를 우회한다 (마이그레이션 파일 주석과 일치하는 유일한 예외 경로).
async function getQuoteByShareTokenAdmin(
  shareToken: string,
): Promise<QuoteWithItems | null> {
  const supabase = createAdminClient()

  const { data, error } = await supabase
    .from("quotes")
    .select("*, quote_items(*)")
    .eq("share_token", shareToken)
    .maybeSingle<Quote & { quote_items: QuoteItem[] }>()

  if (error || !data) {
    return null
  }

  return data
}

export { syncQuotesForAccount, rotateShareToken, getQuoteByShareTokenAdmin }
