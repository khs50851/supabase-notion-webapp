import { AdminSidebar } from "@/components/layout/admin-sidebar"
import { Container } from "@/components/layout/container"

// 관리자 화면은 계정 설정/노션 조회 결과처럼 요청마다 달라지는 데이터를 보여준다.
// 기존에는 루트 레이아웃의 SiteHeader가 쿠키를 읽어 자동으로 동적 렌더링됐지만,
// 사이드바 레이아웃으로 분리되면서 그 의존이 사라졌으므로 명시적으로 고정한다.
export const dynamic = "force-dynamic"

// 인증 여부는 proxy.ts가 /dashboard, /settings/** 접근 시점에 이미 가드하므로
// 이 레이아웃에서는 세션을 다시 조회하지 않는다.
export default function AdminLayout({ children }: LayoutProps<"/">) {
  return (
    <div className="flex min-h-svh flex-1 flex-col md:flex-row">
      <AdminSidebar />
      <main className="flex-1">
        <Container className="py-10">{children}</Container>
      </main>
    </div>
  )
}
