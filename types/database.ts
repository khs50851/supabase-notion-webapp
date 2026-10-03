// PRD 데이터 모델(Account/Quote/QuoteItem)과 1:1 매핑되는 타입 정의
// password_hash는 Supabase Auth(auth.users)가 관리하므로 앱 타입에서 제외

export interface Account {
  id: string
  email: string
  notion_api_key: string | null
  notion_database_id: string | null
  created_at: string
}

// quote_number/valid_until/status는 노션 invoice DB의 선택 프로퍼티라 nullable
export interface Quote {
  id: string
  account_id: string
  notion_page_id: string
  quote_number: string | null
  client_name: string
  issued_date: string
  valid_until: string | null
  status: string | null
  total_amount: number
  share_token: string | null
}

export interface QuoteItem {
  id: string
  quote_id: string
  item_name: string
  quantity: number
  unit_price: number
}

// 대시보드/상세 페이지에서 항목까지 함께 다룰 때 사용하는 조합 타입
export interface QuoteWithItems extends Quote {
  quote_items: QuoteItem[]
}
