// Supabase 미연동 상태에서만 활성화되는 개발용 관리자 로그인 헬퍼.
// next/headers를 사용하지 않는 순수 함수만 둬서 proxy.ts(Edge 미들웨어)에서도 안전하게 import한다.

const DEV_ADMIN_COOKIE_NAME = "dev_admin_auth"
const DEV_ADMIN_COOKIE_VALUE = "authenticated"

function getDevAdminCredentials() {
  return {
    email: process.env.DEV_ADMIN_EMAIL ?? "admin",
    password: process.env.DEV_ADMIN_PASSWORD ?? "1234",
  }
}

function verifyDevAdminCredentials(email: string, password: string) {
  const { email: validEmail, password: validPassword } =
    getDevAdminCredentials()
  return email === validEmail && password === validPassword
}

export {
  DEV_ADMIN_COOKIE_NAME,
  DEV_ADMIN_COOKIE_VALUE,
  getDevAdminCredentials,
  verifyDevAdminCredentials,
}
