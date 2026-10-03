import Link from "next/link"
import { redirect } from "next/navigation"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { QuotesTable } from "@/components/dashboard/quotes-table"
import { fetchQuotesFromNotion } from "@/lib/notion/quotes"
import { createClient } from "@/lib/supabase/server"
import { isSupabaseConfigured } from "@/lib/supabase/is-configured"
import { syncQuotesForAccount } from "@/lib/supabase/quotes"
import { getDummyNotionSettings } from "@/lib/dummy/account"
import { getLiveOrDummyQuotes } from "@/lib/quotes-source"
import type { Account, QuoteWithItems } from "@/types/database"

type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>

// 노션 조회/동기화가 실패했을 때(레이트리밋·키 만료 등) 화면이 완전히 비지 않도록
// quotes 테이블에 이미 캐시된 최신 목록으로 폴백한다 (PRD상 quotes는 "견적서 캐시").
async function getCachedQuotesForAccount(
  supabase: SupabaseServerClient,
  accountId: string,
): Promise<QuoteWithItems[]> {
  const { data } = await supabase
    .from("quotes")
    .select("*, quote_items(*)")
    .eq("account_id", accountId)
    .returns<QuoteWithItems[]>()

  return data ?? []
}

async function getDashboardData(): Promise<{
  isConnected: boolean
  quotes: QuoteWithItems[]
}> {
  // Supabase 미연동 상태에서는 연동 여부만 더미 계정 설정으로 판정하고,
  // 목록 데이터는 .env.local의 노션 환경변수로 실제 워크스페이스에서 조회한다(실패 시 더미 폴백).
  // 실제 목록 동기화는 Task 009에서 구현되며, 그때 이 분기가 사라지고 항상 실연동 경로만 남는다.
  if (!isSupabaseConfigured()) {
    const account = getDummyNotionSettings()
    const isConnected = Boolean(
      account.notion_api_key && account.notion_database_id,
    )
    return {
      isConnected,
      quotes: isConnected ? await getLiveOrDummyQuotes() : [],
    }
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

  if (!account?.notion_api_key || !account?.notion_database_id) {
    return { isConnected: false, quotes: [] }
  }

  try {
    const notionQuotes = await fetchQuotesFromNotion(
      account.notion_api_key,
      account.notion_database_id,
    )
    const quotes = await syncQuotesForAccount(user.id, notionQuotes)
    return { isConnected: true, quotes }
  } catch (error) {
    console.error(
      "[dashboard] 노션 견적서 동기화 실패 — 캐시된 목록으로 폴백",
      error,
    )
    const quotes = await getCachedQuotesForAccount(supabase, user.id)
    return { isConnected: true, quotes }
  }
}

export default async function DashboardPage() {
  const { isConnected, quotes } = await getDashboardData()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">대시보드</h1>
          <p className="text-muted-foreground text-sm">
            노션과 연동된 견적서 목록을 확인하고 공유 링크를 생성합니다.
          </p>
        </div>
        <Button nativeButton={false} render={<Link href="/settings/notion" />}>
          노션 연동 설정
        </Button>
      </div>

      {!isConnected && (
        <Alert>
          <AlertTitle>노션이 아직 연동되지 않았습니다</AlertTitle>
          <AlertDescription>
            노션 연동 설정에서 API 키와 데이터베이스 ID를 등록하면 견적서 목록이
            이곳에 표시됩니다.
          </AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>견적서 목록</CardTitle>
          <CardDescription>
            {isConnected
              ? "노션과 동기화된 견적서 목록입니다."
              : "노션 연동 후 이곳에 견적서 목록이 표시됩니다."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <QuotesTable quotes={quotes} />
        </CardContent>
      </Card>
    </div>
  )
}
