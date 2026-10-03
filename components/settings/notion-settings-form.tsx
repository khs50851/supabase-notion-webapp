"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { toast } from "sonner"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  notionSettingsFormSchema,
  type NotionSettingsFormValues,
} from "@/lib/schemas/notion"
import { maskSecret } from "@/lib/format"
import {
  disconnectNotionSettings,
  saveNotionSettings,
} from "@/app/(admin)/settings/notion/actions"

interface NotionSettingsFormProps {
  isConnected: boolean
  maskedApiKey: string | null
  notionDatabaseId: string | null
}

function NotionSettingsForm({
  isConnected,
  maskedApiKey,
  notionDatabaseId,
}: NotionSettingsFormProps) {
  const router = useRouter()
  const [isDisconnecting, setIsDisconnecting] = useState(false)
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<NotionSettingsFormValues>({
    resolver: zodResolver(notionSettingsFormSchema),
    defaultValues: {
      notionApiKey: "",
      notionDatabaseId: notionDatabaseId ?? "",
    },
  })

  const onSubmit = handleSubmit(async (values) => {
    const result = await saveNotionSettings(values)

    if (!result.success) {
      toast.error(result.error.message)
      return
    }

    toast.success("노션 연동 정보가 저장되었습니다.", {
      description: `API 키: ${maskSecret(values.notionApiKey)}`,
    })
    router.push("/dashboard")
    router.refresh()
  })

  async function handleDisconnect() {
    setIsDisconnecting(true)
    const result = await disconnectNotionSettings()
    setIsDisconnecting(false)

    if (!result.success) {
      toast.error(result.error.message)
      return
    }

    toast.success("노션 연동이 해제되었습니다.")
    router.refresh()
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Notion 연결 정보</CardTitle>
          <Badge variant={isConnected ? "default" : "outline"}>
            {isConnected ? "연동됨" : "미연동"}
          </Badge>
        </div>
        <CardDescription>
          입력한 값은 이후 견적서 목록 동기화(F002)에 사용됩니다.
        </CardDescription>
      </CardHeader>

      <form onSubmit={onSubmit}>
        <CardContent className="grid gap-4">
          {isConnected && (
            <Alert>
              <AlertTitle>현재 저장된 API 키</AlertTitle>
              <AlertDescription>{maskedApiKey}</AlertDescription>
            </Alert>
          )}

          <div className="grid gap-1.5">
            <Label htmlFor="notionApiKey">Notion API 키</Label>
            <Input
              id="notionApiKey"
              type="password"
              placeholder={
                isConnected ? "변경하려면 새 키를 입력하세요" : "secret_..."
              }
              autoComplete="off"
              {...register("notionApiKey")}
            />
            {errors.notionApiKey && (
              <p className="text-destructive text-sm">
                {errors.notionApiKey.message}
              </p>
            )}
          </div>

          <div className="grid gap-1.5">
            <Label htmlFor="notionDatabaseId">Notion 데이터베이스 ID</Label>
            <Input
              id="notionDatabaseId"
              placeholder="데이터베이스 ID를 입력하세요"
              {...register("notionDatabaseId")}
            />
            {errors.notionDatabaseId && (
              <p className="text-destructive text-sm">
                {errors.notionDatabaseId.message}
              </p>
            )}
          </div>
        </CardContent>

        <CardFooter className="flex-col gap-2">
          <Button type="submit" disabled={isSubmitting} className="w-full">
            {isSubmitting ? "저장 중..." : "저장"}
          </Button>
          {isConnected && (
            <Button
              type="button"
              variant="outline"
              className="w-full"
              disabled={isDisconnecting}
              onClick={handleDisconnect}
            >
              {isDisconnecting ? "해제 중..." : "연동 해제"}
            </Button>
          )}
        </CardFooter>
      </form>
    </Card>
  )
}

export { NotionSettingsForm }
