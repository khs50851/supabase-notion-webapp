"use client"

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
import { signupFormSchema, type SignupFormValues } from "@/lib/schemas/auth"
import { getAuthErrorMessage } from "@/lib/supabase/auth-errors"
import { GoogleAuthButton } from "@/components/auth/google-auth-button"

function SignupForm() {
  const router = useRouter()
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignupFormValues>({
    resolver: zodResolver(signupFormSchema),
    defaultValues: { email: "", password: "", passwordConfirm: "" },
  })

  const onSubmit = handleSubmit(async (values) => {
    // Supabase 미연동 상태에서는 실제 가입 호출 없이 더미 계정으로 대시보드 UI를 볼 수 있게 한다
    if (!isSupabaseConfigured()) {
      toast.success("회원가입이 완료되었습니다. (더미 모드)", {
        description:
          "Supabase 연동 전이라 실제 계정 생성 없이 대시보드로 이동합니다.",
      })
      router.push("/dashboard")
      return
    }

    const supabase = createClient()
    const { data, error } = await supabase.auth.signUp({
      email: values.email,
      password: values.password,
    })

    if (error) {
      toast.error(getAuthErrorMessage(error))
      return
    }

    toast.success("회원가입이 완료되었습니다.", {
      description: `${values.email} 계정으로 가입했습니다.`,
    })

    // 이메일 확인이 꺼져 있으면 signUp만으로 세션이 즉시 생성됨
    if (data.session) {
      router.push("/dashboard")
      router.refresh()
    } else {
      router.push("/login")
    }
  })

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>회원가입</CardTitle>
        <CardDescription>
          이메일과 비밀번호로 관리자 계정을 생성하세요.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={onSubmit} className="grid gap-4">
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
              autoComplete="new-password"
              {...register("password")}
            />
            {errors.password && (
              <p className="text-destructive text-sm">
                {errors.password.message}
              </p>
            )}
          </div>

          <div className="grid gap-1.5">
            <Label htmlFor="passwordConfirm">비밀번호 확인</Label>
            <Input
              id="passwordConfirm"
              type="password"
              placeholder="********"
              autoComplete="new-password"
              {...register("passwordConfirm")}
            />
            {errors.passwordConfirm && (
              <p className="text-destructive text-sm">
                {errors.passwordConfirm.message}
              </p>
            )}
          </div>

          <Button type="submit" disabled={isSubmitting} className="w-full">
            {isSubmitting ? "가입 처리 중..." : "회원가입"}
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
        <p className="text-muted-foreground text-sm">이미 계정이 있으신가요?</p>
        <Button
          variant="outline"
          className="w-full"
          nativeButton={false}
          render={<Link href="/login" />}
        >
          로그인
        </Button>
      </CardFooter>
    </Card>
  )
}

export { SignupForm }
