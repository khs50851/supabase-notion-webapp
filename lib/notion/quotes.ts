import "server-only"
import { isFullDatabase, isFullPage } from "@notionhq/client"
import type { Client, PageObjectResponse } from "@notionhq/client"

import { createNotionClient } from "@/lib/notion/client"
import type { Quote, QuoteItem, QuoteWithItems } from "@/types/database"
import {
  NOTION_OPTIONAL_INVOICE_PROPERTIES,
  NOTION_REQUIRED_INVOICE_PROPERTIES,
  NOTION_REQUIRED_ITEM_PROPERTIES,
} from "@/types/notion"

// 프로퍼티 이름 상수는 types/notion.ts가 단일 소스 — 여기서 다시 정의하지 않는다
// 스키마 검증(lib/notion/schema.ts)과 달리 이 모듈은 페이지 프로퍼티의 "값"을 읽는다

type NotionPageProperties = PageObjectResponse["properties"]
type NotionPropertyValue = NotionPageProperties[string]

// Supabase 없이 환경변수 기반으로 조회한 데모 데이터임을 나타내는 자리값
// (실제 accounts 행이 없으므로 account_id에 의미가 없다)
const ENV_ACCOUNT_ID = "env-notion"

// title / rich_text는 RichTextItemResponse[] 형태라 plain_text를 이어붙여야 사용자가 입력한 원문이 된다
function readPlainText(property: NotionPropertyValue | undefined): string {
  if (property?.type === "title") {
    return property.title.map((item) => item.plain_text).join("")
  }
  if (property?.type === "rich_text") {
    return property.rich_text.map((item) => item.plain_text).join("")
  }
  return ""
}

function readNumber(property: NotionPropertyValue | undefined): number | null {
  return property?.type === "number" ? property.number : null
}

// 날짜는 { start, end } 범위지만 발행일·유효기간 모두 시작일만 사용한다
function readDateStart(
  property: NotionPropertyValue | undefined,
): string | null {
  return property?.type === "date" ? (property.date?.start ?? null) : null
}

// 노션 "상태" 컬럼은 사용자가 일반 select로 만들 수도, 노션의 전용 Status 타입(할 일/진행/완료 그룹이
// 있는 상태 속성)으로 만들 수도 있다. 응답 형태는 값이 `select` 대신 `status` 키에 담기는 점만 다르고
// 나머지는 동일(PartialSelectPropertyValueResponse)하므로 두 타입 모두 처리한다.
function readSelectName(
  property: NotionPropertyValue | undefined,
): string | null {
  if (property?.type === "select") {
    return property.select?.name ?? null
  }
  if (property?.type === "status") {
    return property.status?.name ?? null
  }
  return null
}

// 페이지 프로퍼티 값의 relation은 "연결된 페이지 ID 목록"이다 —
// 스키마 검증에 쓰는 relation.data_source_id(= Items 데이터소스 자체의 ID)와 다른 형태다.
// 참고: 한 페이지의 relation이 25개를 넘으면 노션이 목록을 잘라서 보내므로(응답의 has_more)
// 전량 수집에는 별도 페이지네이션이 필요하다 — 현재 스코프에서는 다루지 않는다.
function readRelationPageIds(
  property: NotionPropertyValue | undefined,
): string[] {
  return property?.type === "relation"
    ? property.relation.map((item) => item.id)
    : []
}

// 제목 프로퍼티(`견적서 번호`)는 이름이 고정되지 않으므로 type으로 탐지한다
// (노션 데이터베이스는 항상 정확히 1개의 title 프로퍼티를 가진다)
function findTitleProperty(
  properties: NotionPageProperties,
): NotionPropertyValue | undefined {
  return Object.values(properties).find((property) => property.type === "title")
}

function mapItemPageToQuoteItem(
  page: PageObjectResponse,
  quoteId: string,
): QuoteItem {
  const properties = page.properties

  return {
    id: page.id,
    quote_id: quoteId,
    // `항목명`은 Items DB에서 title일 수도 rich_text일 수도 있어 readPlainText가 둘 다 처리한다
    item_name: readPlainText(
      properties[NOTION_REQUIRED_ITEM_PROPERTIES.itemName],
    ),
    quantity:
      readNumber(properties[NOTION_REQUIRED_ITEM_PROPERTIES.quantity]) ?? 0,
    unit_price:
      readNumber(properties[NOTION_REQUIRED_ITEM_PROPERTIES.unitPrice]) ?? 0,
  }
}

async function mapInvoicePageToQuote(
  notion: Client,
  page: PageObjectResponse,
): Promise<QuoteWithItems> {
  const properties = page.properties

  const quote: Quote = {
    // 실제 DB 행이 아니므로 앱 전용 식별자는 노션 페이지 ID를 그대로 재사용한다
    id: page.id,
    account_id: ENV_ACCOUNT_ID,
    notion_page_id: page.id,
    quote_number: readPlainText(findTitleProperty(properties)) || null,
    client_name: readPlainText(
      properties[NOTION_REQUIRED_INVOICE_PROPERTIES.clientName],
    ),
    issued_date:
      readDateStart(
        properties[NOTION_REQUIRED_INVOICE_PROPERTIES.issuedDate],
      ) ?? "",
    valid_until: readDateStart(
      properties[NOTION_OPTIONAL_INVOICE_PROPERTIES.validUntil],
    ),
    status: readSelectName(
      properties[NOTION_OPTIONAL_INVOICE_PROPERTIES.status],
    ),
    total_amount:
      readNumber(properties[NOTION_REQUIRED_INVOICE_PROPERTIES.totalAmount]) ??
      0,
    // 공유 링크는 대시보드에서 명시적으로 "생성"해야 발급된다 (F004, Task 010) — 저장소(더미/Supabase)
    // 방식에 중립적이도록 이 모듈은 항상 null을 반환하고, 호출부가 각자의 저장소에서 병합한다
    share_token: null,
  }

  const itemPageIds = readRelationPageIds(
    properties[NOTION_REQUIRED_INVOICE_PROPERTIES.items],
  )
  const quoteItems: QuoteItem[] = []

  // 항목은 별도 Items DB의 페이지라서 relation ID마다 조회가 필요하다.
  // Notion 레이트리밋(약 3req/s)을 넘기지 않도록 Promise.all 병렬 대신 순차로 호출한다.
  for (const itemPageId of itemPageIds) {
    const itemPage = await notion.pages.retrieve({ page_id: itemPageId })
    if (!isFullPage(itemPage)) {
      continue
    }
    quoteItems.push(mapItemPageToQuoteItem(itemPage, quote.id))
  }

  return { ...quote, quote_items: quoteItems }
}

// invoice 데이터베이스의 견적서와 연결된 항목을 조회해 앱 도메인 모델로 매핑한다.
// 실패(잘못된 키/ID, 권한 미공유 등)는 그대로 throw해 호출부가 폴백 정책을 결정하게 한다.
async function fetchQuotesFromNotion(
  apiKey: string,
  invoiceDatabaseId: string,
): Promise<QuoteWithItems[]> {
  const notion = createNotionClient(apiKey)

  // databases.retrieve는 properties를 주지 않고 data_sources 참조만 준다 (@notionhq/client 5.x)
  const database = await notion.databases.retrieve({
    database_id: invoiceDatabaseId,
  })

  if (!isFullDatabase(database)) {
    throw new Error("견적서 데이터베이스 정보를 가져올 수 없습니다.")
  }

  const invoiceDataSourceId = database.data_sources[0]?.id

  if (!invoiceDataSourceId) {
    throw new Error("견적서 데이터베이스에 데이터소스가 없습니다.")
  }

  // 기본 페이지 크기(100건)를 넘는 견적서도 전량 수집하기 위해 has_more를 따라간다
  const invoicePages: PageObjectResponse[] = []
  let cursor: string | undefined

  do {
    const response = await notion.dataSources.query({
      data_source_id: invoiceDataSourceId,
      start_cursor: cursor,
    })

    for (const result of response.results) {
      if (isFullPage(result)) {
        invoicePages.push(result)
      }
    }

    cursor = response.has_more ? (response.next_cursor ?? undefined) : undefined
  } while (cursor)

  const quotes: QuoteWithItems[] = []

  // 항목 relation을 페이지별로 순차 조회하므로 견적서 자체도 순차 처리해 레이트리밋을 피한다
  for (const page of invoicePages) {
    quotes.push(await mapInvoicePageToQuote(notion, page))
  }

  return quotes
}

// 상세 페이지/PDF 라우트 공용 — 공유 링크 토큰으로 견적서 1건만 조회.
// 토큰 → 노션 페이지 ID를 알고 있으므로 목록 전체를 조회하지 않고 페이지를 직접 가져온다.
async function fetchQuoteFromNotion(
  apiKey: string,
  notionPageId: string,
): Promise<QuoteWithItems | null> {
  const notion = createNotionClient(apiKey)
  const page = await notion.pages.retrieve({ page_id: notionPageId })

  if (!isFullPage(page)) {
    return null
  }

  return mapInvoicePageToQuote(notion, page)
}

export { fetchQuotesFromNotion, fetchQuoteFromNotion }
