"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"
import { isSupabaseConfigured } from "@/lib/supabase/is-configured"
import { signOutDevAdmin } from "@/lib/auth/actions"

function LogoutButton() {
  const router = useRouter()
  const [isPending, setIsPending] = useState(false)

  async function handleLogout() {
    // Supabase 미연동 상태에서는 개발용 관리자 로그인 쿠키를 지우고 로그인 페이지로 이동한다
    if (!isSupabaseConfigured()) {
      setIsPending(true)
      await signOutDevAdmin()
      setIsPending(false)
      router.push("/login")
      router.refresh()
      return
    }

    setIsPending(true)
    const supabase = createClient()
    const { error } = await supabase.auth.signOut()
    setIsPending(false)

    if (error) {
      toast.error("로그아웃 중 오류가 발생했습니다.")
      return
    }

    router.push("/login")
    router.refresh()
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleLogout}
      disabled={isPending}
    >
      {isPending ? "로그아웃 중..." : "로그아웃"}
    </Button>
  )
}

export { LogoutButton }
