import type { AuthError } from "@supabase/supabase-js"

// Supabase Auth 에러 코드 → 한국어 메시지 매핑
// https://supabase.com/docs/guides/auth/debugging/error-codes
const AUTH_ERROR_MESSAGES: Record<string, string> = {
  invalid_credentials: "이메일 또는 비밀번호가 올바르지 않습니다.",
  user_already_exists: "이미 가입된 이메일입니다.",
  user_not_found: "가입되지 않은 이메일입니다.",
  weak_password: "비밀번호가 너무 약합니다. 8자 이상 입력해주세요.",
  email_not_confirmed: "이메일 인증이 필요합니다. 받은 메일함을 확인해주세요.",
  over_request_rate_limit: "요청이 너무 많습니다. 잠시 후 다시 시도해주세요.",
  over_email_send_rate_limit:
    "이메일 발송 한도를 초과했습니다. 잠시 후 다시 시도해주세요.",
  same_password: "기존 비밀번호와 동일합니다.",
  // OAuth(구글 등 소셜 로그인) 관련 코드
  bad_oauth_state: "로그인 시도가 만료되었습니다. 다시 시도해주세요.",
  bad_oauth_callback: "로그인 처리 중 오류가 발생했습니다. 다시 시도해주세요.",
  oauth_provider_not_supported: "지원하지 않는 로그인 방식입니다.",
  provider_email_needs_verification:
    "이메일 인증이 필요합니다. 받은 메일함을 확인해주세요.",
  oauth_callback_failed: "구글 로그인에 실패했습니다. 다시 시도해주세요.",
}

export function getAuthErrorMessage(error: AuthError): string {
  const code = error.code ?? ""
  return (
    AUTH_ERROR_MESSAGES[code] ??
    "요청 처리 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요."
  )
}

// OAuth 콜백 라우트가 `/login?error=<code>`로 넘겨준 에러 코드를 동일한 테이블로 매핑
export function getAuthErrorMessageByCode(code: string): string {
  return (
    AUTH_ERROR_MESSAGES[code] ??
    "요청 처리 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요."
  )
}
