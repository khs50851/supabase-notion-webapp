import { Badge } from "@/components/ui/badge"
import { Container } from "@/components/layout/container"

const STACK = [
  "Next.js 16",
  "React 19",
  "TypeScript",
  "Tailwind CSS v4",
  "shadcn/ui",
  "Base UI",
]

function SiteFooter() {
  return (
    <footer className="border-t">
      <Container className="flex flex-col gap-4 py-8 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-muted-foreground text-sm">
          © {new Date().getFullYear()} 견적서 확인. All rights reserved.
        </p>
        <div className="flex flex-wrap gap-1.5">
          {STACK.map((item) => (
            <Badge key={item} variant="secondary">
              {item}
            </Badge>
          ))}
        </div>
      </Container>
    </footer>
  )
}

export { SiteFooter }
