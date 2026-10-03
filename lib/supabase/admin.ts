import "server-only"
import { createClient as createSupabaseClient } from "@supabase/supabase-js"

// 서비스 롤 키 기반 서버 전용 클라이언트 — RLS를 우회하므로 클라이언트 컴포넌트에서 절대 import 금지
// 용도: 공개 견적서 조회(F003)처럼 로그인 세션 없이 share_token만으로 접근해야 하는 경우
function createAdminClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    },
  )
}

export { createAdminClient }
