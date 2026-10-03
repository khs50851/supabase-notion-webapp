---
description: "변경사항을 대상으로 lint/타입체크/컨벤션을 점검하는 PR 리뷰를 수행합니다"
allowed-tools:
  [
    "Bash(git status:*)",
    "Bash(git diff:*)",
    "Bash(git log:*)",
    "Bash(npm run lint:*)",
    "Bash(npx tsc:*)",
  ]
---

# Claude 명령어: PR Review

현재 브랜치의 변경사항(스테이지 여부 무관)을 대상으로 lint, 타입 오류, 프로젝트 컨벤션 준수 여부를 점검하고 리뷰 결과를 요약합니다.

## 사용법

```
/pr-review
```

## 프로세스

1. `git status`, `git diff`로 변경된 파일과 변경 범위 확인
2. `npm run lint`로 ESLint 오류/경고 확인
3. `npx tsc --noEmit`으로 타입 오류 확인
4. 변경된 파일을 대상으로 컨벤션 점검
   - 들여쓰기 2칸 준수 여부
   - 주석이 있다면 한국어로 작성되었는지
   - 불필요한 추상화, 미사용 코드, 과도한 방어 코드 여부
   - `AGENTS.md`에 명시된 Next.js 브레이킹 체인지 관련 규칙 위반 여부
5. 심각도별(🔴 blocking / 🟡 suggestion / 🔵 nit)로 이슈를 정리해 보고

## 출력 포맷

파일별로 그룹화하여 아래 형식으로 보고합니다.

```
### <파일 경로>
- 🔴 <blocking 이슈 설명> (줄 번호)
- 🟡 <suggestion 이슈 설명> (줄 번호)
```

이슈가 없으면 "리뷰 결과 이상 없음"으로 보고합니다.

## 참고사항

- 코드를 임의로 수정하지 않고 리뷰 결과만 보고 (수정은 사용자 승인 후 별도 진행)
- lint/tsc 실행 결과에 없는 이슈를 추측해서 만들어내지 않음
- 발견한 이슈가 없다면 없다고 솔직하게 보고
