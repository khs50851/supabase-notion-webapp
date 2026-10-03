"use client"

import { useState } from "react"
import Link from "next/link"
import { MenuIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { getNavLinks } from "@/components/layout/nav-links"
import { LogoutButton } from "@/components/auth/logout-button"

interface MobileNavProps {
  isAuthenticated: boolean
}

function MobileNav({ isAuthenticated }: MobileNavProps) {
  const [open, setOpen] = useState(false)
  const navLinks = getNavLinks(isAuthenticated)

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        render={
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            aria-label="메뉴 열기"
          />
        }
      >
        <MenuIcon />
      </SheetTrigger>
      <SheetContent side="left">
        <SheetHeader>
          <SheetTitle>메뉴</SheetTitle>
        </SheetHeader>
        <nav className="flex flex-col gap-1 px-4">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className="hover:bg-muted rounded-lg px-2.5 py-2 text-sm font-medium"
            >
              {link.label}
            </Link>
          ))}
          {/* 데스크톱 헤더에만 로그아웃이 있으면 모바일에서는 로그아웃 수단이 사라짐 */}
          {isAuthenticated && (
            <div className="flex" onClick={() => setOpen(false)}>
              <LogoutButton />
            </div>
          )}
        </nav>
      </SheetContent>
    </Sheet>
  )
}

export { MobileNav }
