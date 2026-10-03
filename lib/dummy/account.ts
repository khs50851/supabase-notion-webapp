import "server-only"

import type { Account } from "@/types/database"

// Supabase 미연동 상태에서 노션 설정 화면을 시연하기 위한 인메모리 더미 계정 상태.
// 개발 서버 프로세스가 살아있는 동안만 유지되고 재시작하면 초기값(미연동)으로 돌아간다 —
// 실제 영속 저장은 Task 006(Supabase 연결) 완료 후 accounts 테이블이 담당한다.
type DummyNotionSettings = Pick<
  Account,
  "notion_api_key" | "notion_database_id"
>

// 기본값은 "연동됨" 상태 — 대시보드/설정 화면을 처음 열었을 때 바로 데모 데이터가 보이도록 함.
// 설정 화면에서 "연동 해제"를 누르면 null로 바뀌어 미연동 상태(빈 목록/배너)도 확인할 수 있다.
let dummyNotionSettings: DummyNotionSettings = {
  notion_api_key: "ntn_dummy0000000000000000000000000000000000",
  notion_database_id: "3e72a9fe62298078ad2ed9aa9b89af24",
}

function getDummyNotionSettings(): DummyNotionSettings {
  return dummyNotionSettings
}

function setDummyNotionSettings(next: DummyNotionSettings) {
  dummyNotionSettings = next
}

export { getDummyNotionSettings, setDummyNotionSettings }
