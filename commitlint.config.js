// 커밋 메시지 포맷: `<이모지> <타입>: <설명>` (.claude/commands/commit.md 참고)
// 이모지 접두사를 허용하기 위해 기본 headerPattern을 오버라이드한다.
module.exports = {
  extends: ["@commitlint/config-conventional"],
  parserPreset: {
    parserOpts: {
      headerPattern: /^\S+\s+(\w+)(?:\(([\w-]+)\))?: (.+)$/,
      headerCorrespondence: ["type", "scope", "subject"],
    },
  },
  rules: {
    "type-enum": [
      2,
      "always",
      ["feat", "fix", "docs", "style", "refactor", "perf", "test", "chore"],
    ],
    "subject-case": [0],
    "header-max-length": [2, "always", 72],
  },
}
