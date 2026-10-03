import Link from "next/link"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

// 랜딩은 공개 라우트라 `proxy.ts` 가드 대상이 아니다 (Task 007 결정) —
// 로그인 상태여도 리디렉션하지 않고 그대로 노출한다
export default function Home() {
  return (
    <div className="flex flex-col items-center gap-6 py-20 text-center">
      <Badge variant="secondary">견적서 웹 확인 서비스</Badge>
      <h1 className="max-w-2xl text-4xl font-semibold tracking-tight sm:text-5xl">
        노션 견적서를 웹에서 바로 확인하세요
      </h1>
      <p className="text-muted-foreground max-w-xl">
        노션(Notion)에 작성한 견적서를 클라이언트가 별도 프로그램 설치 없이
        웹에서 확인하고, 필요할 때 PDF로 다운로드할 수 있습니다.
      </p>
      <div className="flex gap-2">
        <Button nativeButton={false} render={<Link href="/login" />}>
          로그인
        </Button>
        <Button
          variant="outline"
          nativeButton={false}
          render={<Link href="/signup" />}
        >
          회원가입
        </Button>
      </div>
    </div>
  )
}
