"use client"

import { useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createClient } from "@/lib/supabase/client"
import { isSupabaseConfigured } from "@/lib/supabase/is-configured"
import {
  loginFormSchema,
  devAdminLoginFormSchema,
  type LoginFormValues,
} from "@/lib/schemas/auth"
import {
  getAuthErrorMessage,
  getAuthErrorMessageByCode,
} from "@/lib/supabase/auth-errors"
import { signInWithDevAdmin } from "@/lib/auth/actions"
import { GoogleAuthButton } from "@/components/auth/google-auth-button"

function LoginForm({ oauthError }: { oauthError?: string }) {
  const router = useRouter()

  useEffect(() => {
    if (oauthError) {
      toast.error(getAuthErrorMessageByCode(oauthError))
    }
  }, [oauthError])

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    // Supabase 미연동 시의 개발용 관리자 계정(기본값 admin/1234)은 실제 이메일 형식·비밀번호
    // 강도 규칙을 따르지 않으므로 완화된 스키마를 쓴다
    resolver: zodResolver(
      isSupabaseConfigured() ? loginFormSchema : devAdminLoginFormSchema,
    ),
    defaultValues: { email: "", password: "" },
  })

  const onSubmit = handleSubmit(async (values) => {
    // Supabase 미연동 상태에서는 환경변수 기반 개발용 관리자 계정(기본값 admin/1234)으로 로그인한다
    if (!isSupabaseConfigured()) {
      const result = await signInWithDevAdmin(values.email, values.password)

      if (!result.success) {
        toast.error(result.error ?? "로그인에 실패했습니다.")
        return
      }

      toast.success("로그인되었습니다. (개발용 관리자 계정)", {
        description:
          "Supabase 연동 전이라 환경변수 기반 임시 계정으로 로그인했습니다.",
      })
      router.push("/dashboard")
      router.refresh()
      return
    }

    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({
      email: values.email,
      password: values.password,
    })

    if (error) {
      toast.error(getAuthErrorMessage(error))
      return
    }

    toast.success("로그인되었습니다.", {
      description: `${values.email} 계정으로 로그인했습니다.`,
    })
    router.push("/dashboard")
    router.refresh()
  })

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>로그인</CardTitle>
        <CardDescription>
          이메일과 비밀번호를 입력해 계정에 로그인하세요.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={onSubmit} noValidate className="grid gap-4">
          <div className="grid gap-1.5">
            <Label htmlFor="email">이메일</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              autoComplete="email"
              {...register("email")}
            />
            {errors.email && (
              <p className="text-destructive text-sm">{errors.email.message}</p>
            )}
          </div>

          <div className="grid gap-1.5">
            <Label htmlFor="password">비밀번호</Label>
            <Input
              id="password"
              type="password"
              placeholder="********"
              autoComplete="current-password"
              {...register("password")}
            />
            {errors.password && (
              <p className="text-destructive text-sm">
                {errors.password.message}
              </p>
            )}
          </div>

          <Button type="submit" disabled={isSubmitting} className="w-full">
            {isSubmitting ? "로그인 중..." : "로그인"}
          </Button>
        </form>

        {isSupabaseConfigured() && (
          <>
            <div className="my-4 flex items-center gap-3">
              <div className="bg-border h-px flex-1" />
              <span className="text-muted-foreground text-xs">또는</span>
              <div className="bg-border h-px flex-1" />
            </div>
            <GoogleAuthButton next="/dashboard" />
          </>
        )}
      </CardContent>

      <CardFooter className="flex-col gap-3">
        <p className="text-muted-foreground text-sm">아직 계정이 없으신가요?</p>
        <Button
          variant="outline"
          className="w-full"
          nativeButton={false}
          render={<Link href="/signup" />}
        >
          회원가입
        </Button>
      </CardFooter>
    </Card>
  )
}

export { LoginForm }
