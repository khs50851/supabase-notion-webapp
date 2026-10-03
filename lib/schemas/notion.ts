import { z } from "zod"

export const notionSettingsFormSchema = z.object({
  notionApiKey: z
    .string()
    .trim()
    .min(1, "Notion API 키를 입력해주세요.")
    .refine(
      (value) => value.startsWith("secret_") || value.startsWith("ntn_"),
      "Notion API 키 형식이 올바르지 않습니다. (secret_ 또는 ntn_로 시작)",
    ),
  notionDatabaseId: z
    .string()
    .trim()
    .min(1, "Notion 데이터베이스 ID를 입력해주세요.")
    .regex(
      /^[0-9a-fA-F-]{32,36}$/,
      "데이터베이스 ID 형식이 올바르지 않습니다.",
    ),
})

export type NotionSettingsFormValues = z.infer<typeof notionSettingsFormSchema>
