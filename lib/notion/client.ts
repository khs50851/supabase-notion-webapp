import "server-only"
import { Client } from "@notionhq/client"

// 계정별 Notion API 키로 클라이언트를 생성하는 서버 전용 팩토리
// "server-only" import로 클라이언트 컴포넌트에서 실수로 import 시 빌드 타임에 에러 발생
function createNotionClient(apiKey: string) {
  return new Client({ auth: apiKey })
}

export { createNotionClient }
