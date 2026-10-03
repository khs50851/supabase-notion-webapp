import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  // 기본 위치(bottom-left)가 관리자 사이드바 하단의 로그아웃/테마 버튼과 겹쳐 클릭을 막는다
  devIndicators: {
    position: "bottom-right",
  },
}

export default nextConfig
