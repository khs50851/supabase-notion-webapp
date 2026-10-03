// Supabase 미연동 상태에서 대시보드·견적서 상세 UI를 시연하기 위한 더미 데이터.
// Task 009(견적서 목록 동기화)에서 실제 노션 연동으로 대체될 때까지만 사용한다.
import type { QuoteWithItems } from "@/types/database"

const DUMMY_QUOTES: QuoteWithItems[] = [
  {
    id: "dummy-quote-1",
    account_id: "dummy-account",
    notion_page_id: "dummy-notion-page-1",
    quote_number: "INV-2026-09-001",
    client_name: "ABC회사",
    issued_date: "2026-09-01",
    valid_until: "2026-09-30",
    status: "대기",
    total_amount: 5000000,
    share_token: "dummy-token-001",
    quote_items: [
      {
        id: "dummy-item-1-1",
        quote_id: "dummy-quote-1",
        item_name: "웹사이트 디자인",
        quantity: 1,
        unit_price: 3000000,
      },
      {
        id: "dummy-item-1-2",
        quote_id: "dummy-quote-1",
        item_name: "퍼블리싱",
        quantity: 1,
        unit_price: 2000000,
      },
    ],
  },
  {
    id: "dummy-quote-2",
    account_id: "dummy-account",
    notion_page_id: "dummy-notion-page-2",
    quote_number: "INV-2026-09-002",
    client_name: "델타상사",
    issued_date: "2026-09-10",
    valid_until: null,
    status: "완료",
    total_amount: 1200000,
    // 아직 공유 링크를 발급하지 않은 견적서 (Task 010 전까지는 목록에서 "미발급"으로 표시)
    share_token: null,
    quote_items: [
      {
        id: "dummy-item-2-1",
        quote_id: "dummy-quote-2",
        item_name: "로고 디자인",
        quantity: 2,
        unit_price: 600000,
      },
    ],
  },
  {
    id: "dummy-quote-3",
    account_id: "dummy-account",
    notion_page_id: "dummy-notion-page-3",
    quote_number: "INV-2026-08-015",
    client_name: "그린테크",
    issued_date: "2026-08-20",
    valid_until: "2026-08-25",
    status: "만료",
    // 항목 0건 엣지 케이스
    total_amount: 0,
    share_token: "dummy-token-015",
    quote_items: [],
  },
]

function getDummyQuotes(): QuoteWithItems[] {
  return DUMMY_QUOTES
}

function getDummyQuoteByShareToken(
  shareToken: string,
): QuoteWithItems | undefined {
  return DUMMY_QUOTES.find((quote) => quote.share_token === shareToken)
}

export { getDummyQuotes, getDummyQuoteByShareToken }
