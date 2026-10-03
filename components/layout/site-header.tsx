import Link from "next/link"

import { Container } from "@/components/layout/container"
import { MobileNav } from "@/components/layout/mobile-nav"
import { getNavLinks } from "@/components/layout/nav-links"
import { ThemeToggle } from "@/components/theme-toggle"
import { LogoutButton } from "@/components/auth/logout-button"
import { getIsAuthenticated } from "@/lib/auth/session"

async function SiteHeader() {
  const isAuthenticated = await getIsAuthenticated()
  const navLinks = getNavLinks(isAuthenticated)

  return (
    <header className="bg-background/95 supports-backdrop-filter:bg-background/60 sticky top-0 z-40 border-b backdrop-blur">
      <Container className="flex h-14 items-center justify-between">
        <Link href="/" className="font-heading text-base font-semibold">
          견적서 확인
        </Link>
        <nav className="hidden items-center gap-1 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-foreground/70 hover:bg-muted hover:text-foreground rounded-lg px-2.5 py-1.5 text-sm font-medium transition-colors"
            >
              {link.label}
            </Link>
          ))}
          {isAuthenticated && <LogoutButton />}
        </nav>
        <div className="flex items-center gap-1">
          <ThemeToggle />
          <MobileNav isAuthenticated={isAuthenticated} />
        </div>
      </Container>
    </header>
  )
}

export { SiteHeader }
