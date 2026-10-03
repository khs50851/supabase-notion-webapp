import type { Metadata } from "next"
import { notFound } from "next/navigation"

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { formatCurrency, formatDate } from "@/lib/format"
import { getPublicQuoteByShareToken } from "@/lib/quotes-source"

type QuoteDetailPageProps = {
  params: Promise<{ shareToken: string }>
}

// 클라이언트에게 전달되는 공개 링크라 검색엔진에는 노출하지 않는다
export const metadata: Metadata = {
  robots: { index: false, follow: false },
}

// 매 요청마다 최신 견적 데이터를 반영해야 하므로 정적 캐싱을 사용하지 않는다
export const dynamic = "force-dynamic"

// 비로그인 공개 접근 페이지 — 공유 링크(shareToken)로 견적서 조회 (F003), PDF 다운로드 (F005)
export default async function QuoteDetailPage({
  params,
}: QuoteDetailPageProps) {
  const { shareToken } = await params
  const quote = await getPublicQuoteByShareToken(shareToken)

  if (!quote) {
    notFound()
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">견적서 상세</h1>
        <p className="text-muted-foreground text-sm">
          {quote.client_name}님께 발행된 견적서입니다.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{quote.quote_number ?? "견적서"}</CardTitle>
          <CardDescription>
            발행일 {formatDate(quote.issued_date)}
            {quote.valid_until &&
              ` · 유효기간 ${formatDate(quote.valid_until)}까지`}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {quote.quote_items.length === 0 ? (
            <p className="text-muted-foreground text-sm">
              등록된 항목이 없습니다.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>항목명</TableHead>
                  <TableHead className="text-right">수량</TableHead>
                  <TableHead className="text-right">단가</TableHead>
                  <TableHead className="text-right">소계</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {quote.quote_items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>{item.item_name}</TableCell>
                    <TableCell className="text-right">
                      {item.quantity}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(item.unit_price)}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(item.quantity * item.unit_price)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          <div className="flex items-center justify-end gap-2 border-t pt-4">
            <span className="text-muted-foreground text-sm">총 금액</span>
            <span className="text-lg font-semibold">
              {formatCurrency(quote.total_amount)}
            </span>
          </div>
        </CardContent>
        <CardFooter>
          {/* 일반 앵커로 라우트 핸들러의 Content-Disposition: attachment를 그대로 활용한다 */}
          <Button
            variant="outline"
            nativeButton={false}
            render={<a href={`/quotes/${shareToken}/pdf`} />}
          >
            PDF 다운로드
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
