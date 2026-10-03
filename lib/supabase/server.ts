import { cookies } from "next/headers"
import { createServerClient } from "@supabase/ssr"

// 서버 컴포넌트/라우트 핸들러에서 사용하는 Supabase 클라이언트
// TODO: 실제 세션 검증(F010, 관리자 로그인 필수 페이지 가드) 로직은 이후 구현 단계에서 추가
async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            )
          } catch {
            // Server Component에서 호출된 경우 무시 — 세션 갱신은 미들웨어에서 처리
          }
        },
      },
    },
  )
}

export { createClient }
