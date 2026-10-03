"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { MenuIcon } from "lucide-react"
import { cn } from "cn"

import { LogoutButton } from "@/components/auth/logout-button"
import { AUTHED_NAV_LINKS } from "@/components/layout/nav-links"
import { ThemeToggle } from "@/components/theme-toggle"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"

// 하위 경로(예: /settings/notion/xxx)에서도 상위 메뉴가 활성으로 보여야 한다
function isActivePath(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`)
}

interface AdminNavProps {
  onNavigate?: () => void
}

function AdminNav({ onNavigate }: AdminNavProps) {
  const pathname = usePathname()

  return (
    <nav className="flex flex-col gap-1">
      {AUTHED_NAV_LINKS.map((link) => {
        const isActive = isActivePath(pathname, link.href)

        return (
          <Link
            key={link.href}
            href={link.href}
            onClick={onNavigate}
            aria-current={isActive ? "page" : undefined}
            className={cn(
              "rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              isActive
                ? "bg-sidebar-accent text-sidebar-accent-foreground"
                : "text-sidebar-foreground/70 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground",
            )}
          >
            {link.label}
          </Link>
        )
      })}
    </nav>
  )
}

function AdminSidebar() {
  const [open, setOpen] = useState(false)

  return (
    <>
      {/* 데스크톱: 좌측 고정 사이드바 */}
      <aside className="bg-sidebar text-sidebar-foreground sticky top-0 hidden h-svh w-60 shrink-0 flex-col border-r md:flex">
        <div className="flex h-14 items-center border-b px-5">
          <Link
            href="/dashboard"
            className="font-heading text-base font-semibold"
          >
            견적서 확인
          </Link>
        </div>
        <div className="flex-1 overflow-y-auto p-3">
          <AdminNav />
        </div>
        <div className="flex items-center justify-between border-t p-3">
          <LogoutButton />
          <ThemeToggle />
        </div>
      </aside>

      {/* 모바일: 상단 바 + 드로어 (사이드바가 숨겨지므로 대체 진입점이 필요) */}
      <div className="bg-background sticky top-0 z-40 flex h-14 items-center justify-between border-b px-4 md:hidden">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger
            render={
              <Button
                variant="ghost"
                size="icon"
                aria-label="관리자 메뉴 열기"
              />
            }
          >
            <MenuIcon />
          </SheetTrigger>
          <SheetContent side="left">
            <SheetHeader>
              <SheetTitle>관리자 메뉴</SheetTitle>
            </SheetHeader>
            <div className="flex flex-col gap-3 px-4">
              <AdminNav onNavigate={() => setOpen(false)} />
              <div className="flex items-center justify-between border-t pt-3">
                <div className="flex" onClick={() => setOpen(false)}>
                  <LogoutButton />
                </div>
                <ThemeToggle />
              </div>
            </div>
          </SheetContent>
        </Sheet>
        <Link
          href="/dashboard"
          className="font-heading text-base font-semibold"
        >
          견적서 확인
        </Link>
      </div>
    </>
  )
}

export { AdminSidebar }
