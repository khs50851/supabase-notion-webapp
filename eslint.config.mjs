import { defineConfig, globalIgnores } from "eslint/config"
import nextVitals from "eslint-config-next/core-web-vitals"
import nextTs from "eslint-config-next/typescript"
import eslintConfigPrettier from "eslint-config-prettier"

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // 별도 독립 참고용 스타터 프로젝트 — 자체 tsconfig/eslint 설정을 가짐
    "nextjs-supabase-app/**",
  ]),
  // Prettier와 충돌하는 스타일 규칙 비활성화 (항상 마지막에 위치)
  eslintConfigPrettier,
])

export default eslintConfig
