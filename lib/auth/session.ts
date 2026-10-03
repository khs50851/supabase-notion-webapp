import "server-only"
import { cookies } from "next/headers"

import { createClient } from "@/lib/supabase/server"
import { isSupabaseConfigured } from "@/lib/supabase/is-configured"
import {
  DEV_ADMIN_COOKIE_NAME,
  DEV_ADMIN_COOKIE_VALUE,
} from "@/lib/auth/dev-admin"

// 서버 컴포넌트 전용 인증 상태 판별. Supabase 연동 시 실제 세션을, 미연동 시 개발용 관리자
// 로그인 쿠키(lib/auth/actions.ts에서 발급)를 확인한다. proxy.ts의 가드 로직과 기준이 같아야 한다.
async function getIsAuthenticated(): Promise<boolean> {
  if (isSupabaseConfigured()) {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    return Boolean(user)
  }

  const cookieStore = await cookies()
  return (
    cookieStore.get(DEV_ADMIN_COOKIE_NAME)?.value === DEV_ADMIN_COOKIE_VALUE
  )
}

export { getIsAuthenticated }
