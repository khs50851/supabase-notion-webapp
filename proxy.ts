import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@supabase/ssr"

import { isSupabaseConfigured } from "@/lib/supabase/is-configured"
import {
  DEV_ADMIN_COOKIE_NAME,
  DEV_ADMIN_COOKIE_VALUE,
} from "@/lib/auth/dev-admin"

const PROTECTED_PREFIXES = ["/dashboard", "/settings"]
const GUEST_ONLY_PATHS = ["/login", "/signup"]

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const isProtected = PROTECTED_PREFIXES.some((prefix) =>
    pathname.startsWith(prefix),
  )
  const isGuestOnly = GUEST_ONLY_PATHS.some((path) => pathname === path)

  // Supabase 미연동 상태에서는 환경변수 기반 개발용 관리자 로그인 쿠키(lib/auth/actions.ts에서
  // 발급)로 보호 라우트를 가드한다. site-header.tsx / lib/auth/session.ts와 판별 기준이 동일해야 한다.
  if (!isSupabaseConfigured()) {
    const isDevAdminAuthed =
      request.cookies.get(DEV_ADMIN_COOKIE_NAME)?.value ===
      DEV_ADMIN_COOKIE_VALUE

    if (!isDevAdminAuthed && isProtected) {
      return NextResponse.redirect(new URL("/login", request.url))
    }
    if (isDevAdminAuthed && isGuestOnly) {
      return NextResponse.redirect(new URL("/dashboard", request.url))
    }
    return NextResponse.next()
  }

  let response = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          )
          response = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          )
        },
      },
    },
  )

  // getUser()는 매 요청마다 세션을 검증/갱신함 (getSession()은 만료 검증을 하지 않으므로 사용 금지)
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user && isProtected) {
    const redirectUrl = new URL("/login", request.url)
    return NextResponse.redirect(redirectUrl)
  }

  if (user && isGuestOnly) {
    const redirectUrl = new URL("/dashboard", request.url)
    return NextResponse.redirect(redirectUrl)
  }

  return response
}

export const config = {
  matcher: ["/dashboard/:path*", "/settings/:path*", "/login", "/signup"],
}
