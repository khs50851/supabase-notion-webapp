// 노션 페이지 프로퍼티 → 앱 도메인 모델(Quote/QuoteItem) 매핑 타입
// F001 저장 시 대상 데이터베이스가 아래 프로퍼티를 갖추고 있는지 검증하는 데도 사용
// 견적서와 항목은 relation으로 연결된 별도의 두 데이터베이스(invoice / Items)다

export type NotionPropertyType =
  | "title"
  | "number"
  | "date"
  | "rich_text"
  | "select"
  | "status"
  | "relation"
  | "formula"

// 견적서(invoice) 데이터베이스에서 사용하는 프로퍼티 이름
// 제목 프로퍼티(`견적서 번호`)는 이름을 고정하지 않는다 —
// 노션 데이터베이스는 항상 정확히 1개의 title 프로퍼티를 가지므로 `type === "title"`로 탐지한다
export interface NotionInvoiceDatabaseSchema {
  clientName: string // rich_text
  totalAmount: string // number
  issuedDate: string // date
  items: string // relation → Items 데이터베이스
  status?: string // select 또는 status(노션 전용 진행 상태 속성) 둘 다 지원
  validUntil?: string // date
}

// 견적 항목(Items) 데이터베이스에서 사용하는 프로퍼티 이름
// `금액`(formula)은 앱이 수량×단가로 직접 계산하므로 검증 대상에서 제외한다
// `invoice`(relation 역참조)도 invoice 쪽에서 이미 탐지했으므로 검증 대상에서 제외한다
export interface NotionItemDatabaseSchema {
  itemName: string // title 또는 rich_text
  quantity: string // number
  unitPrice: string // number
}

export const NOTION_REQUIRED_INVOICE_PROPERTIES = {
  clientName: "클라이언트명",
  totalAmount: "총 금액",
  issuedDate: "발행일",
  items: "항목",
} as const

export const NOTION_OPTIONAL_INVOICE_PROPERTIES = {
  status: "상태",
  validUntil: "유효기간",
} as const

export const NOTION_REQUIRED_ITEM_PROPERTIES = {
  itemName: "항목명",
  quantity: "수량",
  unitPrice: "단가",
} as const

// dataSources.retrieve() 응답에서 프로퍼티 존재/타입 검증 시 사용하는 최소 형태
export interface NotionDatabasePropertySummary {
  name: string
  type: string
}
