import "server-only"

import {
  NOTION_REQUIRED_INVOICE_PROPERTIES,
  NOTION_REQUIRED_ITEM_PROPERTIES,
} from "@/types/notion"

// 프로퍼티 이름 상수는 types/notion.ts가 단일 소스 — 여기서 다시 정의하지 않는다

// relation 프로퍼티 응답 형태 (@notionhq/client 5.x)
// relation.data_source_id가 곧 연결된 Items 데이터소스 ID라서 databases.retrieve 추가 호출이 불필요
interface NotionRelationProperty {
  type: "relation"
  relation: { data_source_id: string }
}

function isRelationProperty(
  property: unknown,
): property is NotionRelationProperty {
  if (typeof property !== "object" || property === null) {
    return false
  }

  const candidate = property as { type?: unknown; relation?: unknown }
  if (candidate.type !== "relation") {
    return false
  }

  const relation = candidate.relation as
    { data_source_id?: unknown } | undefined
  return (
    typeof relation?.data_source_id === "string" &&
    relation.data_source_id.length > 0
  )
}

// invoice 데이터소스의 properties 맵을 받아 누락된 필수 프로퍼티 이름을 반환
// `항목`은 존재 여부뿐 아니라 relation 타입인지까지 확인해야 Items 데이터소스를 따라갈 수 있다
function getMissingInvoiceProperties(
  properties: Record<string, unknown>,
): string[] {
  const itemsName = NOTION_REQUIRED_INVOICE_PROPERTIES.items

  return Object.values(NOTION_REQUIRED_INVOICE_PROPERTIES).filter((name) => {
    if (name === itemsName) {
      return !isRelationProperty(properties[name])
    }
    return !(name in properties)
  })
}

// Items 데이터소스의 properties 맵을 받아 누락된 필수 프로퍼티 이름을 반환
function getMissingItemProperties(
  properties: Record<string, unknown>,
): string[] {
  return Object.values(NOTION_REQUIRED_ITEM_PROPERTIES).filter(
    (name) => !(name in properties),
  )
}

// invoice의 `항목` relation에서 Items 데이터소스 ID를 자동 탐지 (사용자가 별도 입력하지 않음)
function getItemsDataSourceId(
  properties: Record<string, unknown>,
): string | null {
  const itemsProperty = properties[NOTION_REQUIRED_INVOICE_PROPERTIES.items]

  return isRelationProperty(itemsProperty)
    ? itemsProperty.relation.data_source_id
    : null
}

export {
  getMissingInvoiceProperties,
  getMissingItemProperties,
  getItemsDataSourceId,
}
