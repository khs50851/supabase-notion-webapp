"use server"

import { revalidatePath } from "next/cache"

import { createClient } from "@/lib/supabase/server"
import { isSupabaseConfigured } from "@/lib/supabase/is-configured"
import { setDummyNotionSettings } from "@/lib/dummy/account"
import {
  verifyNotionConnection,
  type NotionConnectionError,
} from "@/lib/notion/verify-connection"
import {
  notionSettingsFormSchema,
  type NotionSettingsFormValues,
} from "@/lib/schemas/notion"
import { maskSecret } from "@/lib/format"
import { ApiErrorCode, type ApiError } from "@/types/api"
import type { ApiResult } from "@/types/api"

// Supabase 연동 여부와 무관하게 저장 전 실연결 검증에서 나온 에러를 동일하게 매핑한다
function mapConnectionErrorToApiError(error: NotionConnectionError): ApiError {
  if (error.type === "unauthorized") {
    return {
      success: false,
      error: {
        code: ApiErrorCode.NOTION_UNAUTHORIZED,
        message:
          "Notion API 키가 올바르지 않습니다. 통합(integration) 키를 다시 확인해주세요.",
      },
    }
  }
  if (error.type === "object_not_found") {
    return {
      success: false,
      error: {
        code: ApiErrorCode.NOTION_OBJECT_NOT_FOUND,
        message:
          "데이터베이스를 찾을 수 없습니다. ID가 정확한지, 통합(integration)에 페이지 공유가 되어 있는지 확인해주세요.",
      },
    }
  }
  if (error.type === "invoice_schema_mismatch") {
    return {
      success: false,
      error: {
        code: ApiErrorCode.NOTION_SCHEMA_MISMATCH,
        message: `견적서 데이터베이스에 다음 속성이 없습니다: ${error.missingProperties.join(", ")}`,
      },
    }
  }
  if (error.type === "items_schema_mismatch") {
    return {
      success: false,
      error: {
        code: ApiErrorCode.NOTION_SCHEMA_MISMATCH,
        message: `항목(Items) 데이터베이스에 다음 속성이 없습니다: ${error.missingProperties.join(", ")}`,
      },
    }
  }
  if (error.type === "items_unauthorized") {
    return {
      success: false,
      error: {
        code: ApiErrorCode.NOTION_ITEMS_UNAUTHORIZED,
        message:
          "항목(Items) 데이터베이스에 연동(integration)이 공유되어 있지 않습니다. 노션에서 항목 데이터베이스에도 통합을 공유해주세요.",
      },
    }
  }
  if (error.type === "items_object_not_found") {
    return {
      success: false,
      error: {
        code: ApiErrorCode.NOTION_ITEMS_NOT_FOUND,
        message:
          "견적서와 연결된 항목(Items) 데이터베이스를 찾을 수 없습니다. 노션에서 관계(relation)가 올바른지 확인해주세요.",
      },
    }
  }
  return {
    success: false,
    error: { code: ApiErrorCode.INTERNAL_ERROR, message: error.message },
  }
}

export async function saveNotionSettings(
  values: NotionSettingsFormValues,
): Promise<ApiResult<{ maskedApiKey: string }>> {
  const parsed = notionSettingsFormSchema.safeParse(values)
  if (!parsed.success) {
    return {
      success: false,
      error: {
        code: ApiErrorCode.VALIDATION_ERROR,
        message: parsed.error.issues[0]?.message ?? "입력값을 확인해주세요.",
      },
    }
  }

  const { notionApiKey, notionDatabaseId } = parsed.data

  // Supabase 연동 여부와 무관하게 저장 전 실연결 검증은 항상 수행한다 (Task 008 수정 —
  // 이전에는 Supabase 미연동 분기에서 검증 없이 그대로 저장되는 문제가 있었다)
  const connectionResult = await verifyNotionConnection(
    notionApiKey,
    notionDatabaseId,
  )

  if (!connectionResult.ok) {
    return mapConnectionErrorToApiError(connectionResult.error)
  }

  if (!isSupabaseConfigured()) {
    setDummyNotionSettings({
      notion_api_key: notionApiKey,
      notion_database_id: notionDatabaseId,
    })
    revalidatePath("/settings/notion")
    revalidatePath("/dashboard")
    return { success: true, data: { maskedApiKey: maskSecret(notionApiKey) } }
  }

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

  const { error: updateError } = await supabase
    .from("accounts")
    .update({
      notion_api_key: notionApiKey,
      notion_database_id: notionDatabaseId,
    })
    .eq("id", user.id)

  if (updateError) {
    return {
      success: false,
      error: {
        code: ApiErrorCode.INTERNAL_ERROR,
        message: "저장 중 오류가 발생했습니다.",
      },
    }
  }

  revalidatePath("/settings/notion")
  revalidatePath("/dashboard")

  return { success: true, data: { maskedApiKey: maskSecret(notionApiKey) } }
}

export async function disconnectNotionSettings(): Promise<ApiResult<null>> {
  if (!isSupabaseConfigured()) {
    setDummyNotionSettings({ notion_api_key: null, notion_database_id: null })
    revalidatePath("/settings/notion")
    revalidatePath("/dashboard")
    return { success: true, data: null }
  }

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

  const { error: updateError } = await supabase
    .from("accounts")
    .update({ notion_api_key: null, notion_database_id: null })
    .eq("id", user.id)

  if (updateError) {
    return {
      success: false,
      error: {
        code: ApiErrorCode.INTERNAL_ERROR,
        message: "연동 해제 중 오류가 발생했습니다.",
      },
    }
  }

  revalidatePath("/settings/notion")
  revalidatePath("/dashboard")

  return { success: true, data: null }
}
