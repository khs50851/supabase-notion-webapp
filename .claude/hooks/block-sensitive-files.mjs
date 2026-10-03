#!/usr/bin/env node
// PreToolUse 훅: .env, package-lock.json, .claude/settings*.json 등
// 민감 파일에 대한 Edit/Write/MultiEdit 및 Bash를 통한 변경 시도를 차단한다.

import { basename } from "node:path"

// ---- 보호 대상 정의 (여기만 수정하면 됨) ----------------------------------

// 아무 경로에서나 이 베이스네임 패턴에 매칭되면 차단 (템플릿류는 예외)
const PROTECTED_BASENAME_PATTERNS = [
  /^\.env(\..+)?$/i, // .env, .claude/.env, .env.local, .env.production ...
  /^package-lock\.json$/i,
]
const ENV_ALLOW_SUFFIXES = ["example", "sample", "template", "defaults"]

// 정확한 상대경로(뒤에서부터 매칭)로 보호할 파일들
const PROTECTED_PATH_SUFFIXES = [
  ".claude/settings.json",
  ".claude/settings.local.json",
]

// Bash 휴리스틱: 명령어 안에 이 문자열/패턴이 있으면 "쓰기 동작"으로 간주
const WRITE_OPERATOR_PATTERNS = [
  />>?/,
  /\brm\b/i,
  /\bdel\b/i,
  /\bmv\b/i,
  /\bren(ame)?\b/i,
  /\bcp\b/i,
  /\bcopy\b/i,
  /\bsed\s+-i\b/i,
  /Remove-Item/i,
  /Set-Content/i,
  /Out-File/i,
  /Add-Content/i,
  /Move-Item/i,
  /Copy-Item/i,
  /\btruncate\b/i,
]

// ---------------------------------------------------------------------------

function normalize(p) {
  return String(p || "").replace(/\\/g, "/")
}

function isProtectedPath(rawPath) {
  const p = normalize(rawPath)
  const base = basename(p)

  for (const suffix of PROTECTED_PATH_SUFFIXES) {
    if (p === suffix || p.endsWith("/" + suffix)) return true
  }

  for (const pattern of PROTECTED_BASENAME_PATTERNS) {
    if (!pattern.test(base)) continue
    if (pattern.source.startsWith("^\\.env")) {
      const suffix = base.slice(".env".length).replace(/^\./, "")
      if (ENV_ALLOW_SUFFIXES.includes(suffix.toLowerCase())) continue
    }
    return true
  }
  return false
}

function findProtectedMentionInCommand(command) {
  if (typeof command !== "string" || !command) return null
  const cmd = normalize(command)

  // 명령어 문자열을 대략적인 토큰으로 쪼개서 각 토큰이 보호 대상인지 검사
  const tokens = cmd.split(/[\s"'`|&;()]+/).filter(Boolean)
  for (const token of tokens) {
    if (isProtectedPath(token)) return token
  }
  return null
}

function deny(reason) {
  const output = {
    hookSpecificOutput: {
      hookEventName: "PreToolUse",
      permissionDecision: "deny",
      permissionDecisionReason: reason,
    },
  }
  process.stdout.write(JSON.stringify(output))
  process.exit(0)
}

async function readStdin() {
  const chunks = []
  for await (const chunk of process.stdin) chunks.push(chunk)
  return Buffer.concat(chunks).toString("utf-8")
}

async function main() {
  const raw = await readStdin()
  let payload
  try {
    payload = JSON.parse(raw)
  } catch {
    return // 파싱 실패 시 안전하게 통과 (fail open)
  }

  const toolName = payload.tool_name
  const input = payload.tool_input || {}

  if (toolName === "Edit" || toolName === "Write" || toolName === "MultiEdit") {
    const filePath = input.file_path
    if (isProtectedPath(filePath)) {
      deny(
        `보호된 파일(${basename(String(filePath))})은 Claude가 직접 수정할 수 없습니다. ` +
          `필요하다면 사용자가 직접 편집해주세요.`,
      )
      return
    }
  }

  if (toolName === "Bash") {
    const command = input.command
    const hasWriteOperator = WRITE_OPERATOR_PATTERNS.some((re) =>
      re.test(command || ""),
    )
    if (hasWriteOperator) {
      const hit = findProtectedMentionInCommand(command)
      if (hit) {
        deny(
          `Bash 명령이 보호된 파일(${hit})을 변경하려는 것으로 보여 차단되었습니다. ` +
            `필요하다면 사용자가 직접 실행해주세요.`,
        )
        return
      }
    }
  }

  // 그 외에는 아무것도 출력하지 않고 exit 0 -> 정상 통과
}

main().catch(() => {
  // 훅 자체의 예기치 못한 에러는 차단이 아니라 통과로 처리 (fail open)
  process.exit(0)
})
