import { createBrowserClient } from "@supabase/ssr"

// 브라우저(클라이언트 컴포넌트)에서 사용하는 Supabase 클라이언트
// TODO: 실제 인증(F010)/DB 호출 로직은 이후 구현 단계에서 이 클라이언트를 사용해 추가
function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
  )
}

export { createClient }
