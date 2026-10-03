import { Readable } from "node:stream"
import { renderToStream } from "@react-pdf/renderer"

import { QuoteDocument } from "@/components/pdf/quote-document"
import { getPublicQuoteByShareToken } from "@/lib/quotes-source"

type RouteParams = {
  params: Promise<{ shareToken: string }>
}

// 공개 PDF 다운로드 라우트 (F005) — 상세 페이지와 동일한 공개 조회 진입점을 사용해
// share_token 유효성을 이 라우트에서도 재검증한다 (직접 호출 시에도 404 처리)
export async function GET(_request: Request, { params }: RouteParams) {
  const { shareToken } = await params
  const quote = await getPublicQuoteByShareToken(shareToken)

  if (!quote) {
    return new Response("견적서를 찾을 수 없습니다.", { status: 404 })
  }

  // renderToStream의 타입은 NodeJS.ReadableStream 인터페이스지만 런타임 실체는 Readable이다
  const nodeStream = await renderToStream(<QuoteDocument quote={quote} />)
  const webStream = Readable.toWeb(nodeStream as Readable) as ReadableStream

  const fileName = `견적서_${quote.client_name}_${quote.issued_date}.pdf`
  const encodedFileName = encodeURIComponent(fileName)

  return new Response(webStream, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="quote.pdf"; filename*=UTF-8''${encodedFileName}`,
    },
  })
}
