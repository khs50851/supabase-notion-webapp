// 원화 통화 포맷 (예: 1234000 → "₩1,234,000")
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("ko-KR", {
    style: "currency",
    currency: "KRW",
    maximumFractionDigits: 0,
  }).format(amount)
}

// 발행일 등 날짜를 한국어 포맷으로 표기 (예: "2026년 9월 26일")
export function formatDate(date: string | Date): string {
  const value = typeof date === "string" ? new Date(date) : date

  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(value)
}

// API 키 등 민감 값을 앞 4자만 남기고 마스킹 (예: "secret_abcd1234" → "secr************")
export function maskSecret(value: string): string {
  const visibleLength = Math.min(4, value.length)
  return (
    value.slice(0, visibleLength) +
    "*".repeat(Math.max(value.length - visibleLength, 0))
  )
}
