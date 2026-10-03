import "server-only"
import { APIErrorCode, isNotionClientError } from "@notionhq/client"

import { createNotionClient } from "@/lib/notion/client"
import {
  getItemsDataSourceId,
  getMissingInvoiceProperties,
  getMissingItemProperties,
} from "@/lib/notion/schema"
import { NOTION_REQUIRED_INVOICE_PROPERTIES } from "@/types/notion"

export type NotionConnectionError =
  | { type: "unauthorized" }
  | { type: "object_not_found" }
  | { type: "invoice_schema_mismatch"; missingProperties: string[] }
  | { type: "items_unauthorized" }
  | { type: "items_object_not_found" }
  | { type: "items_schema_mismatch"; missingProperties: string[] }
  | { type: "unknown"; message: string }

export type NotionConnectionResult =
  { ok: true } | { ok: false; error: NotionConnectionError }

// 저장 전 Notion API 실연결 검증: invoice 데이터베이스 → 연결된 Items 데이터소스 순으로 확인
// Items 쪽 실패를 invoice 쪽과 구분해 반환해야 사용자가 "Items DB에 통합 미공유" 원인을 알 수 있다
export async function verifyNotionConnection(
  apiKey: string,
  databaseId: string,
): Promise<NotionConnectionResult> {
  const notion = createNotionClient(apiKey)

  try {
    const database = await notion.databases.retrieve({
      database_id: databaseId,
    })
    const dataSourceRef =
      "data_sources" in database ? database.data_sources[0] : undefined

    if (!dataSourceRef) {
      return {
        ok: false,
        error: {
          type: "invoice_schema_mismatch",
          missingProperties: Object.values(NOTION_REQUIRED_INVOICE_PROPERTIES),
        },
      }
    }

    const invoiceDataSource = await notion.dataSources.retrieve({
      data_source_id: dataSourceRef.id,
    })
    const invoiceProperties =
      "properties" in invoiceDataSource ? invoiceDataSource.properties : {}
    const missingInvoiceProperties =
      getMissingInvoiceProperties(invoiceProperties)

    if (missingInvoiceProperties.length > 0) {
      return {
        ok: false,
        error: {
          type: "invoice_schema_mismatch",
          missingProperties: missingInvoiceProperties,
        },
      }
    }

    // Items DB ID는 입력받지 않고 `항목` relation에서 자동 탐지한다
    const itemsDataSourceId = getItemsDataSourceId(invoiceProperties)

    if (!itemsDataSourceId) {
      return {
        ok: false,
        error: {
          type: "invoice_schema_mismatch",
          missingProperties: [NOTION_REQUIRED_INVOICE_PROPERTIES.items],
        },
      }
    }

    // 통합(integration)은 데이터베이스마다 개별 공유라서 Items 조회만 따로 실패할 수 있다
    let itemsProperties: Record<string, unknown>
    try {
      const itemsDataSource = await notion.dataSources.retrieve({
        data_source_id: itemsDataSourceId,
      })
      itemsProperties =
        "properties" in itemsDataSource ? itemsDataSource.properties : {}
    } catch (itemsError) {
      if (isNotionClientError(itemsError)) {
        if (itemsError.code === APIErrorCode.Unauthorized) {
          return { ok: false, error: { type: "items_unauthorized" } }
        }
        if (itemsError.code === APIErrorCode.ObjectNotFound) {
          return { ok: false, error: { type: "items_object_not_found" } }
        }
      }
      throw itemsError
    }

    const missingItemProperties = getMissingItemProperties(itemsProperties)

    if (missingItemProperties.length > 0) {
      return {
        ok: false,
        error: {
          type: "items_schema_mismatch",
          missingProperties: missingItemProperties,
        },
      }
    }

    return { ok: true }
  } catch (error) {
    if (isNotionClientError(error)) {
      if (error.code === APIErrorCode.Unauthorized) {
        return { ok: false, error: { type: "unauthorized" } }
      }
      if (error.code === APIErrorCode.ObjectNotFound) {
        return { ok: false, error: { type: "object_not_found" } }
      }
    }

    return {
      ok: false,
      error: {
        type: "unknown",
        message:
          error instanceof Error
            ? error.message
            : "알 수 없는 오류가 발생했습니다.",
      },
    }
  }
}
