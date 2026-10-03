import { redirect } from "next/navigation"

import { NotionSettingsForm } from "@/components/settings/notion-settings-form"
import { createClient } from "@/lib/supabase/server"
import { isSupabaseConfigured } from "@/lib/supabase/is-configured"
import { getDummyNotionSettings } from "@/lib/dummy/account"
import { maskSecret } from "@/lib/format"
import type { Account } from "@/types/database"

async function getAccountNotionSettings(): Promise<Pick<
  Account,
  "notion_api_key" | "notion_database_id"
> | null> {
  // Supabase 미연동 상태에서는 인메모리 더미 저장소를 읽는다 (actions.ts의 더미 분기와 짝)
  if (!isSupabaseConfigured()) {
    return getDummyNotionSettings()
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const { data: account } = await supabase
    .from("accounts")
    .select("notion_api_key, notion_database_id")
    .eq("id", user.id)
    .single<Pick<Account, "notion_api_key" | "notion_database_id">>()

  return account
}

export default async function NotionSettingsPage() {
  const account = await getAccountNotionSettings()
  const isConnected = Boolean(
    account?.notion_api_key && account?.notion_database_id,
  )

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">노션 연동 설정</h1>
        <p className="text-muted-foreground text-sm">
          Notion API 키와 데이터베이스 ID를 입력해 견적서 데이터 소스를
          연결하세요.
        </p>
      </div>

      <NotionSettingsForm
        isConnected={isConnected}
        maskedApiKey={
          account?.notion_api_key ? maskSecret(account.notion_api_key) : null
        }
        notionDatabaseId={account?.notion_database_id ?? null}
      />
    </div>
  )
}
