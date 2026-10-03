// Supabase 프로젝트가 아직 연결되지 않은 환경(로컬 UI 작업 등)을 판별하는 헬퍼.
// NEXT_PUBLIC_* 값은 빌드 시 정적으로 치환되므로 서버/클라이언트 양쪽에서 그대로 사용 가능하다.
// true를 반환하면 실제 Supabase 로직을, false면 더미 데이터 기반 로직을 타도록 각 호출부에서 분기한다.
function isSupabaseConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  )
}

export { isSupabaseConfigured }
