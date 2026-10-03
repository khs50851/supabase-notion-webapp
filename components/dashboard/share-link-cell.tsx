"use client"

import { useState } from "react"
import Link from "next/link"
import { Copy, RefreshCw } from "lucide-react"
import { toast } from "sonner"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { generateShareLink } from "@/app/(admin)/dashboard/actions"

interface ShareLinkCellProps {
  notionPageId: string
  shareToken: string | null
}

function buildShareUrl(shareToken: string): string {
  return `${window.location.origin}/quotes/${shareToken}`
}

async function copyToClipboard(url: string) {
  await navigator.clipboard.writeText(url)
  toast.success("공유 링크가 복사되었습니다.")
}

// 공유 링크가 없으면 "생성" 버튼만, 있으면 "링크 보기" + 복사 + 재발급 버튼을 보여준다 (F004)
function ShareLinkCell({ notionPageId, shareToken }: ShareLinkCellProps) {
  const [isGenerating, setIsGenerating] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)

  async function issueAndCopy() {
    setIsGenerating(true)
    try {
      const result = await generateShareLink(notionPageId)
      if (!result.success) {
        toast.error(result.error.message)
        return
      }
      await copyToClipboard(buildShareUrl(result.data.shareToken))
    } finally {
      setIsGenerating(false)
    }
  }

  async function handleReissue() {
    await issueAndCopy()
    setConfirmOpen(false)
  }

  if (!shareToken) {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={issueAndCopy}
        disabled={isGenerating}
      >
        {isGenerating ? "생성 중..." : "공유 링크 생성"}
      </Button>
    )
  }

  return (
    <div className="flex items-center justify-end gap-1">
      <Button
        variant="outline"
        size="sm"
        nativeButton={false}
        render={<Link href={`/quotes/${shareToken}`} />}
      >
        링크 보기
      </Button>
      <Button
        variant="ghost"
        size="icon"
        aria-label="공유 링크 복사"
        onClick={() => copyToClipboard(buildShareUrl(shareToken))}
      >
        <Copy className="size-4" />
      </Button>

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogTrigger
          render={
            <Button
              variant="ghost"
              size="icon"
              aria-label="공유 링크 재발급"
              disabled={isGenerating}
            />
          }
        >
          <RefreshCw className="size-4" />
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>공유 링크를 재발급할까요?</AlertDialogTitle>
            <AlertDialogDescription>
              재발급하면 기존 링크는 즉시 무효화됩니다. 이미 전달한 링크는 더
              이상 열리지 않습니다.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isGenerating}>취소</AlertDialogCancel>
            <AlertDialogAction onClick={handleReissue} disabled={isGenerating}>
              {isGenerating ? "재발급 중..." : "재발급"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

export { ShareLinkCell }
