import "server-only"
import { randomBytes } from "node:crypto"

// 더미(인메모리) 스토어와 Supabase 저장소가 공통으로 쓰는 공유 링크 토큰 생성 규칙.
// 추측 불가능한 32자 이상의 base64url 문자열 — URL에 그대로 써도 안전하다.
function generateShareTokenValue(): string {
  return randomBytes(24).toString("base64url")
}

export { generateShareTokenValue }
