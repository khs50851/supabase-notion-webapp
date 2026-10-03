import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { ShareLinkCell } from "@/components/dashboard/share-link-cell"
import { formatCurrency, formatDate } from "@/lib/format"
import type { QuoteWithItems } from "@/types/database"

interface QuotesTableProps {
  quotes: QuoteWithItems[]
}

// 노션 "상태" 값은 사용자가 자유롭게 옵션을 만들 수 있어(select/status 공용) 정해진 상수가 아니다.
// 그중 PRD에서 예시로 든 대기/거절/승인 세 값만 색으로 구분하고, 그 외 값은 기본(outline)으로 둔다.
const STATUS_BADGE_CLASSES: Record<string, string> = {
  대기: "border-border bg-muted text-muted-foreground",
  거절: "border-destructive/20 bg-destructive/10 text-destructive dark:border-destructive/30 dark:bg-destructive/20",
  승인: "border-green-500/20 bg-green-500/10 text-green-600 dark:border-green-500/30 dark:bg-green-500/20 dark:text-green-400",
}

function QuotesTable({ quotes }: QuotesTableProps) {
  if (quotes.length === 0) {
    return (
      <p className="text-muted-foreground py-8 text-center text-sm">
        아직 표시할 견적서가 없습니다.
      </p>
    )
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>견적서 번호</TableHead>
          <TableHead>클라이언트명</TableHead>
          <TableHead>발행일</TableHead>
          <TableHead>상태</TableHead>
          <TableHead className="text-right">총 금액</TableHead>
          <TableHead className="text-right">공유 링크</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {quotes.map((quote) => (
          <TableRow key={quote.id}>
            <TableCell className="font-medium">
              {quote.quote_number ?? "-"}
            </TableCell>
            <TableCell>{quote.client_name}</TableCell>
            <TableCell>{formatDate(quote.issued_date)}</TableCell>
            <TableCell>
              {quote.status ? (
                <Badge
                  variant="outline"
                  className={STATUS_BADGE_CLASSES[quote.status]}
                >
                  {quote.status}
                </Badge>
              ) : (
                "-"
              )}
            </TableCell>
            <TableCell className="text-right">
              {formatCurrency(quote.total_amount)}
            </TableCell>
            <TableCell className="text-right">
              <ShareLinkCell
                notionPageId={quote.notion_page_id}
                shareToken={quote.share_token}
              />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

export { QuotesTable }
