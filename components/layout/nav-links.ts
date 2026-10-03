export const GUEST_NAV_LINKS = [
  { href: "/login", label: "로그인" },
  { href: "/signup", label: "회원가입" },
] as const

export const AUTHED_NAV_LINKS = [
  { href: "/dashboard", label: "대시보드" },
  { href: "/settings/notion", label: "노션 연동 설정" },
] as const

export function getNavLinks(isAuthenticated: boolean) {
  return isAuthenticated ? AUTHED_NAV_LINKS : GUEST_NAV_LINKS
}
