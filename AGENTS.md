# Agent Rules — 지금 날씨 (Weather Now)

AI 에이전트가 이 코드베이스를 작업할 때 반드시 따라야 하는 규칙이다.

---

## 프로젝트 스택 (실제 버전)

| 패키지 | 버전 | 주의사항 |
|--------|------|---------|
| Next.js | **16.2.2** | App Router. `'use cache'` + `cacheLife()` 디렉티브 사용 (PPR). |
| React | 19.2.4 | `use client` / `use server` 경계 명확히 구분. |
| Tailwind CSS | v4 | `@import "tailwindcss"` 방식. `tailwind.config.js` 없음. |
| TypeScript | 5.x | strict mode. `any` 타입 사용 금지. |

---

## Next.js 16 핵심 규칙

### `'use cache'` 디렉티브
`weather-api.ts`의 서버 함수는 `'use cache'` 디렉티브와 `cacheLife()`를 사용한다.
`export const revalidate`나 `fetch` 옵션으로 캐시를 제어하지 않는다.

```typescript
// 올바른 패턴 (현재 코드베이스)
export async function fetchCurrentWeather(lat: number, lon: number) {
  'use cache'
  cacheLife({ stale: 300, revalidate: 600, expire: 1800 })
  // ...
}

// 금지 — 이전 방식
export const revalidate = 600
fetch(url, { next: { revalidate: 600 } })
```

### Route Handler `searchParams`
`new URL(request.url).searchParams`를 사용한다.
`request.nextUrl.searchParams`도 동작하지만 일관성을 위해 전자를 사용한다.

### `cacheComponents: true`
`next.config.ts`에 이미 설정되어 있다. 별도 수정 불필요.

---

## 보안 — 절대 위반 금지

1. **`OPENWEATHERMAP_API_KEY`를 클라이언트 코드에서 참조하지 않는다.**
   - `src/lib/weather-api.ts`는 `import 'server-only'`가 선언되어 있다.
   - 이 파일을 `'use client'` 컴포넌트나 hook에서 import하면 빌드가 실패한다.

2. **환경변수에 `NEXT_PUBLIC_` 접두어를 함부로 추가하지 않는다.**
   - `NEXT_PUBLIC_BASE_URL`만 클라이언트 노출이 허용된다.

---

## 파일별 역할 및 제약

| 파일 | 실행 환경 | 제약 |
|------|---------|------|
| `src/lib/weather-api.ts` | 서버 전용 | `import 'server-only'` 선언. 클라이언트 import 금지 |
| `src/lib/types.ts` | 공유 | OWM 원본 타입은 서버에서만 사용하지만 파일 자체는 공유 가능 |
| `src/lib/mock-data.ts` | 클라이언트 | 데모 모드용 목업. API 키 참조 없음 |
| `src/app/api/*/route.ts` | 서버 전용 | Route Handler. `GET` 함수만 export |
| `src/hooks/*.ts` | 클라이언트 | `'use client'` 명시 필요 |
| `src/components/WeatherBackground.tsx` | 클라이언트 | Canvas API 사용. `useEffect` + `requestAnimationFrame` |
| `src/components/JsonLd.tsx` | 서버 | `dangerouslySetInnerHTML` 사용. XSS 위험 없음 (정적 데이터) |

---

## TypeScript 컨벤션

- 모든 함수 파라미터와 반환값에 타입 명시
- `interface` 우선 사용 (`type`은 유니온 등 불가피한 경우만)
- OWM 원본 타입 (`OWM*`)과 앱 타입(`WeatherResponse` 등) 혼용 금지
- `src/lib/types.ts`에 정의된 타입을 항상 import하여 사용

---

## 코드 수정 체크리스트

파일을 수정하기 전 확인:

- [ ] 기존 파일을 반드시 Read 후 Edit 사용 (Write는 신규 파일에만)
- [ ] `weather-api.ts` 수정 시 `import 'server-only'`와 `'use cache'` 디렉티브 유지
- [ ] 새 컴포넌트 추가 시 `'use client'` 필요 여부 판단
- [ ] `next.config.ts`의 `remotePatterns` — 외부 이미지 도메인 추가 시 목록에 명시
- [ ] 환경변수 추가 시 `.env.local.example`과 `_workspace/03_db_schema.md`에도 반영

---

## 명령어

```bash
npm run dev      # 개발 서버 (http://localhost:3000)
npm run build    # 프로덕션 빌드
npm run start    # 프로덕션 서버
npm run lint     # ESLint 검사
```

데모 모드(API 키 없이 UI 확인):
```
http://localhost:3000/?demo=true
```

---

## 알려진 제약

- OpenWeatherMap 무료 플랜: 5일/3시간 예보만 제공 (7일 예보 불가)
- 신규 API 키 활성화 대기: 최대 2시간
- Canvas 애니메이션: `WeatherBackground`는 `position: fixed`이므로 콘텐츠는 반드시 `relative z-10`
