import { z } from "zod"

export const loginFormSchema = z.object({
  email: z.string().email("올바른 이메일 주소를 입력해주세요."),
  password: z.string().min(8, "비밀번호는 8자 이상 입력해주세요."),
})

export type LoginFormValues = z.infer<typeof loginFormSchema>

// Supabase 미연동 상태의 개발용 관리자 로그인(DEV_ADMIN_EMAIL/PASSWORD, 기본값 admin/1234)은
// 실제 이메일 형식이나 비밀번호 강도 규칙을 따르지 않으므로 완화된 스키마를 별도로 둔다.
export const devAdminLoginFormSchema = z.object({
  email: z.string().min(1, "이메일을 입력해주세요."),
  password: z.string().min(1, "비밀번호를 입력해주세요."),
})

export const signupFormSchema = z
  .object({
    email: z.string().email("올바른 이메일 주소를 입력해주세요."),
    password: z.string().min(8, "비밀번호는 8자 이상 입력해주세요."),
    passwordConfirm: z.string().min(8, "비밀번호는 8자 이상 입력해주세요."),
  })
  .refine((data) => data.password === data.passwordConfirm, {
    message: "비밀번호가 일치하지 않습니다.",
    path: ["passwordConfirm"],
  })

export type SignupFormValues = z.infer<typeof signupFormSchema>
