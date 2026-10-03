import { type NextRequest, NextResponse } from "next/server"

import { createClient } from "@/lib/supabase/server"

// Supabase Auth(OAuth) 콜백 — Google 등 소셜 로그인 동의 후 이 라우트로 돌아온다
export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl
  const code = searchParams.get("code")
  const next = searchParams.get("next") ?? "/dashboard"
  const error = searchParams.get("error")

  if (error) {
    return NextResponse.redirect(new URL(`/login?error=${error}`, origin))
  }

  if (code) {
    const supabase = await createClient()
    const { error: exchangeError } =
      await supabase.auth.exchangeCodeForSession(code)

    if (!exchangeError) {
      return NextResponse.redirect(new URL(next, origin))
    }
  }

  return NextResponse.redirect(
    new URL("/login?error=oauth_callback_failed", origin),
  )
}
