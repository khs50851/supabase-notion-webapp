"use server"

import { cookies } from "next/headers"

import {
  DEV_ADMIN_COOKIE_NAME,
  DEV_ADMIN_COOKIE_VALUE,
  verifyDevAdminCredentials,
} from "@/lib/auth/dev-admin"

interface DevAdminAuthResult {
  success: boolean
  error?: string
}

// Supabase 미연동 상태에서 로그인 폼이 호출하는 서버 액션.
// 환경변수(DEV_ADMIN_EMAIL/DEV_ADMIN_PASSWORD, 기본값 admin/1234) 자격증명이 맞아야 쿠키를 발급한다.
async function signInWithDevAdmin(
  email: string,
  password: string,
): Promise<DevAdminAuthResult> {
  if (!verifyDevAdminCredentials(email, password)) {
    return {
      success: false,
      error: "이메일 또는 비밀번호가 올바르지 않습니다.",
    }
  }

  const cookieStore = await cookies()
  cookieStore.set(DEV_ADMIN_COOKIE_NAME, DEV_ADMIN_COOKIE_VALUE, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  })

  return { success: true }
}

async function signOutDevAdmin(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.delete(DEV_ADMIN_COOKIE_NAME)
}

export { signInWithDevAdmin, signOutDevAdmin }
