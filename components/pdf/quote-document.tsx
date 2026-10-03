import {
  Document,
  Font,
  Page,
  StyleSheet,
  Text,
  View,
} from "@react-pdf/renderer"

import { formatCurrency, formatDate } from "@/lib/format"
import type { QuoteWithItems } from "@/types/database"

// react-pdf 기본 폰트(Helvetica 등)는 한글을 지원하지 않아 별도 한글 폰트 등록이 필요하다.
// 리포지토리에 폰트 바이너리를 커밋하지 않고, 요청 시점에 서버가 직접 내려받아 렌더링한다
// (OFL 라이선스, Google Fonts 공식 저장소). 운영 안정성을 높이려면 이후 자체 호스팅으로 교체할 것.
Font.register({
  family: "NanumGothic",
  fonts: [
    {
      src: "https://raw.githubusercontent.com/google/fonts/main/ofl/nanumgothic/NanumGothic-Regular.ttf",
    },
    {
      src: "https://raw.githubusercontent.com/google/fonts/main/ofl/nanumgothic/NanumGothic-Bold.ttf",
      fontWeight: "bold",
    },
  ],
})

const styles = StyleSheet.create({
  page: {
    fontFamily: "NanumGothic",
    fontSize: 10,
    padding: 40,
    color: "#111111",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 10,
    color: "#555555",
    marginBottom: 20,
  },
  metaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  metaBlock: {
    flexDirection: "column",
    gap: 2,
  },
  metaLabel: {
    fontSize: 9,
    color: "#777777",
  },
  metaValue: {
    fontSize: 11,
    fontWeight: "bold",
  },
  table: {
    borderTop: "1pt solid #dddddd",
    borderBottom: "1pt solid #dddddd",
    marginBottom: 16,
  },
  tableHeaderRow: {
    flexDirection: "row",
    backgroundColor: "#f5f5f5",
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderTop: "1pt solid #eeeeee",
  },
  colItemName: { width: "40%" },
  colQuantity: { width: "15%", textAlign: "right" },
  colUnitPrice: { width: "20%", textAlign: "right" },
  colSubtotal: { width: "25%", textAlign: "right" },
  headerCell: {
    fontSize: 9,
    color: "#555555",
    fontWeight: "bold",
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "baseline",
    gap: 8,
    marginTop: 4,
  },
  totalLabel: {
    fontSize: 10,
    color: "#555555",
  },
  totalValue: {
    fontSize: 16,
    fontWeight: "bold",
  },
  emptyNotice: {
    padding: 16,
    fontSize: 10,
    color: "#777777",
    textAlign: "center",
  },
})

interface QuoteDocumentProps {
  quote: QuoteWithItems
}

// @react-pdf/renderer는 react-dom과 별개 렌더러라 서버(Node)에서만 렌더링한다 (F005)
function QuoteDocument({ quote }: QuoteDocumentProps) {
  return (
    <Document title={`견적서_${quote.client_name}`}>
      <Page size="A4" style={styles.page}>
        <Text style={styles.title}>견적서</Text>
        <Text style={styles.subtitle}>{quote.quote_number ?? "-"}</Text>

        <View style={styles.metaRow}>
          <View style={styles.metaBlock}>
            <Text style={styles.metaLabel}>클라이언트</Text>
            <Text style={styles.metaValue}>{quote.client_name}</Text>
          </View>
          <View style={styles.metaBlock}>
            <Text style={styles.metaLabel}>발행일</Text>
            <Text style={styles.metaValue}>
              {formatDate(quote.issued_date)}
            </Text>
          </View>
          {quote.valid_until && (
            <View style={styles.metaBlock}>
              <Text style={styles.metaLabel}>유효기간</Text>
              <Text style={styles.metaValue}>
                {formatDate(quote.valid_until)}까지
              </Text>
            </View>
          )}
        </View>

        {quote.quote_items.length === 0 ? (
          <Text style={styles.emptyNotice}>등록된 항목이 없습니다.</Text>
        ) : (
          <View style={styles.table}>
            <View style={styles.tableHeaderRow}>
              <Text style={[styles.headerCell, styles.colItemName]}>
                항목명
              </Text>
              <Text style={[styles.headerCell, styles.colQuantity]}>수량</Text>
              <Text style={[styles.headerCell, styles.colUnitPrice]}>단가</Text>
              <Text style={[styles.headerCell, styles.colSubtotal]}>소계</Text>
            </View>
            {quote.quote_items.map((item) => (
              <View key={item.id} style={styles.tableRow}>
                <Text style={styles.colItemName}>{item.item_name}</Text>
                <Text style={styles.colQuantity}>{item.quantity}</Text>
                <Text style={styles.colUnitPrice}>
                  {formatCurrency(item.unit_price)}
                </Text>
                <Text style={styles.colSubtotal}>
                  {formatCurrency(item.quantity * item.unit_price)}
                </Text>
              </View>
            ))}
          </View>
        )}

        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>총 금액</Text>
          <Text style={styles.totalValue}>
            {formatCurrency(quote.total_amount)}
          </Text>
        </View>
      </Page>
    </Document>
  )
}

export { QuoteDocument }
