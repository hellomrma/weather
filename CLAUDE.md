@AGENTS.md

## Claude Code 전용 추가 지침

### 작업 시작 전

1. `_workspace/` 문서를 먼저 확인한다.
   - `01_architecture.md` — 전체 구조 파악
   - `02_api_spec.md` — API 변경 시 반드시 참고
   - `06_review_report.md` — 알려진 이슈 및 미적용 개선 사항

2. 기존 파일을 수정할 때는 **반드시 Read 후 Edit**을 사용한다.

### 하지 말아야 할 것

- `_workspace/*.md` 문서 없이 아키텍처를 임의로 변경하지 않는다.
- `weather-api.ts`에서 `import 'server-only'`를 제거하지 않는다.
- `any` 타입을 사용하지 않는다.
- 이미 `cacheLife()`로 관리되는 캐시를 `fetch` 옵션으로 중복 설정하지 않는다.
- 불필요한 의존성을 `package.json`에 추가하지 않는다.

### 문서 동기화

코드를 변경했을 때 영향받는 `_workspace/*.md` 파일도 함께 업데이트한다.

| 변경 내용 | 업데이트할 문서 |
|---------|-------------|
| 컴포넌트/파일 추가·삭제 | `01_architecture.md` |
| API 엔드포인트 변경 | `02_api_spec.md` |
| 환경변수 추가·삭제 | `03_db_schema.md`, `05_deploy_guide.md` |
| 버그 수정·기능 추가 | `06_review_report.md` |
