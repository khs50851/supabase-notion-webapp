#!/usr/bin/env node
// Claude Code 훅(Notification/Stop) 이벤트를 Slack 웹훅으로 전달한다.
// 훅 실행이 Claude Code 동작을 막으면 안 되므로 모든 에러는 삼키고 항상 exit 0으로 종료한다.

import { readFileSync } from "node:fs"
import { dirname, join, basename } from "node:path"
import { fileURLToPath } from "node:url"

const HOOKS_DIR = dirname(fileURLToPath(import.meta.url))
const CLAUDE_DIR = dirname(HOOKS_DIR)

function loadWebhookUrl() {
  if (process.env.SLACK_WEBHOOK_URL) return process.env.SLACK_WEBHOOK_URL
  try {
    const envPath = join(CLAUDE_DIR, ".env")
    const content = readFileSync(envPath, "utf-8")
    for (const line of content.split(/\r?\n/)) {
      const trimmed = line.trim()
      if (!trimmed || trimmed.startsWith("#")) continue
      const eq = trimmed.indexOf("=")
      if (eq === -1) continue
      const key = trimmed.slice(0, eq).trim()
      if (key === "SLACK_WEBHOOK_URL") {
        let value = trimmed.slice(eq + 1).trim()
        if (
          (value.startsWith('"') && value.endsWith('"')) ||
          (value.startsWith("'") && value.endsWith("'"))
        ) {
          value = value.slice(1, -1)
        }
        return value
      }
    }
  } catch {
    // .env가 없으면 웹훅 미설정으로 간주하고 조용히 종료
  }
  return null
}

async function readStdin() {
  const chunks = []
  for await (const chunk of process.stdin) chunks.push(chunk)
  return Buffer.concat(chunks).toString("utf-8")
}

function extractLastAssistantText(transcriptPath) {
  try {
    const content = readFileSync(transcriptPath, "utf-8")
    const lines = content.split(/\r?\n/).filter(Boolean)
    for (let i = lines.length - 1; i >= 0; i--) {
      let entry
      try {
        entry = JSON.parse(lines[i])
      } catch {
        continue
      }
      if (entry.type !== "assistant") continue
      const blocks = entry.message?.content
      if (!Array.isArray(blocks)) continue
      const text = blocks
        .filter((b) => b.type === "text" && typeof b.text === "string")
        .map((b) => b.text)
        .join(" ")
        .trim()
      if (text) {
        return text.length > 300 ? text.slice(0, 300) + "…" : text
      }
    }
  } catch {
    // 무시하고 폴백 메시지 사용
  }
  return null
}

function buildMessage(payload) {
  const projectName = payload.cwd
    ? basename(payload.cwd)
    : "알 수 없는 프로젝트"
  const timestamp = new Date().toLocaleString("ko-KR")

  if (payload.hook_event_name === "UserPromptSubmit") {
    const prompt =
      typeof payload.prompt === "string" ? payload.prompt.trim() : ""
    const preview = prompt.length > 300 ? prompt.slice(0, 300) + "…" : prompt
    const body = preview ? `\n> ${preview}` : ""
    return `🚀 *[${projectName}] 작업 시작*${body}\n_${timestamp}_`
  }

  if (payload.hook_event_name === "Notification") {
    const detail = payload.message || "Claude Code에서 알림이 발생했습니다."
    return `🔔 *[${projectName}] Claude Code 알림*\n${detail}\n_${timestamp}_`
  }

  if (payload.hook_event_name === "Stop") {
    const preview = payload.transcript_path
      ? extractLastAssistantText(payload.transcript_path)
      : null
    const body = preview ? `\n> ${preview}` : ""
    return `✅ *[${projectName}] 작업 완료*${body}\n_${timestamp}_`
  }

  return `ℹ️ *[${projectName}] ${payload.hook_event_name || "이벤트"}*\n_${timestamp}_`
}

async function main() {
  const webhookUrl = loadWebhookUrl()
  if (!webhookUrl) return

  const raw = await readStdin()
  let payload = {}
  try {
    payload = JSON.parse(raw)
  } catch {
    return
  }

  const text = buildMessage(payload)

  try {
    await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    })
  } catch {
    // 네트워크 실패 등은 무시
  }
}

main().catch(() => {})
