import Link from "next/link"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

// 존재하지 않거나 만료된 공유 링크 — 토큰 존재 여부를 추측할 수 없도록 항상 동일한 화면을 보여준다
export default function QuoteNotFound() {
  return (
    <div className="flex justify-center py-20">
      <Card className="w-full max-w-sm text-center">
        <CardHeader>
          <CardTitle>견적서를 찾을 수 없습니다</CardTitle>
          <CardDescription>
            링크가 만료되었거나 잘못된 주소일 수 있습니다. 견적서를 보낸
            담당자에게 새 링크를 요청해주세요.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            nativeButton={false}
            render={<Link href="/" />}
            className="w-full"
          >
            홈으로 이동
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
