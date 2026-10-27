# 코드 리뷰 & 테스트 보고서

- **리뷰 기준일**: 2026-04-05
- **배포 준비 상태**: 🟢 배포 가능
- **총평**: 초기 2건의 필수 수정(forecast Route Handler 누락, useGeolocation permission 타입 불일치)이 완료되었고, 이후 캔버스 배경 애니메이션, 데모 모드, SEO/GEO/AEO 메타데이터가 추가되었다. 현재 코드베이스는 배포 가능 상태이며, 남은 항목은 성능 개선 및 테스트 도구 셋업이다.

---

## 이력

| 날짜 | 변경 내용 |
|------|---------|
| 2026-04-05 | 초기 QA 리뷰 — FR-01, FR-02 필수 수정 직접 반영 |
| 2026-04-05 | `WeatherBackground` 캔버스 애니메이션 추가 |
| 2026-04-05 | 데모 모드 (`?demo=true`) 추가 |
| 2026-04-05 | SEO / GEO / AEO 메타데이터, JSON-LD, PWA 추가 |
| 2026-10-27 | 개선 리뷰 — FR-03~05 수정, REC-02~05 적용, 접근성/캔버스 개선, 시간별 예보·대기질 기능 추가 |
| 2026-10-27 | PC 위치 부정확 대응 — 정확도 안내 + 도시 검색으로 위치 직접 선택 |

---

## 발견 사항

### 필수 수정 — 완료

#### [FR-01] ✅ /api/forecast Route Handler 파일 누락 → 수정 완료

- **심각도**: P0 (기능 오류)
- **영향**: useWeather가 /api/forecast 호출 시 404 응답, 앱이 항상 에러 상태로 렌더링
- **조치**: `src/app/api/forecast/route.ts` 신규 생성. `/api/weather`와 동일한 3단계 파라미터 검증 패턴 적용.

#### [FR-02] ✅ useGeolocation POSITION_UNAVAILABLE/TIMEOUT 시 permission 불일치 → 수정 완료

- **심각도**: P0 (잘못된 UI 메시지)
- **영향**: 타임아웃/위치불가 오류 발생 시 "위치 권한이 거부되었습니다" 메시지 노출
- **조치**: 해당 케이스의 `permission`을 `'denied'`에서 `'prompt'`로 수정.

#### [FR-03] ✅ 예보 일별 집계가 UTC 기준 → 수정 완료 (2026-10-27)

- **심각도**: P1 (데이터 정확성)
- **영향**: `dt_txt`(UTC)로 날짜를 묶어 KST 기준 하루 경계가 9시간 어긋났고, "정오(12:00 UTC)" 대표 항목이 실제로는 KST 21시라 밤 아이콘(`n`)이 표시됐다.
- **조치**: 집계를 `src/lib/forecast.ts`로 분리하고 `city.timezone` 기반 현지 날짜·현지 정오 최근접 항목으로 변경. `forecast.test.ts` 회귀 테스트 추가.

#### [FR-04] ✅ 좌표별 캐시 키로 캐시 적중률 ≈ 0 → 수정 완료 (2026-10-27)

- **심각도**: P1 (비용 / Rate Limit)
- **영향**: GPS 원좌표가 그대로 `'use cache'` 키가 되어 사용자마다 OWM을 새로 호출.
- **조치**: `src/lib/coords.ts` `parseCoords()`에서 소수 2자리(약 1km) 반올림. 3개 Route Handler의 중복 검증 코드도 공통화.

#### [FR-05] ✅ 초기 렌더 시 API 중복 호출 → 수정 완료 (2026-10-27)

- **심각도**: P2 (비용 / 깜빡임)
- **영향**: 위치 확정 전 서울 기본 좌표로, 로케일 확정 전 `ko`로 먼저 호출한 뒤 재호출.
- **조치**: `LocaleProvider`에 `ready` 추가(`useSyncExternalStore` — 기존 `set-state-in-effect` 린트 에러도 해소). 위치·로케일 확정 후에만 fetch.

---

### 권장 개선

#### [REC-01] 🟡 API 명세와 에러 응답 불일치 → 문서 업데이트 완료

- **파일**: `_workspace/02_api_spec.md`
- `/api/weather`가 lat/lon 범위 검증 시 에러 메시지를 반환하지만 초기 명세에 누락되어 있었다.
- **조치**: `02_api_spec.md` 에러 응답 테이블에 범위 검증 케이스(400) 추가 완료.

#### [REC-02] 🟡 useWeather — 에러 시 기존 데이터 초기화 문제

- **파일**: `src/hooks/useWeather.ts` 50~56행
- 에러 발생 시 `weather: null, forecast: null`로 기존 데이터를 초기화한다. 이미 데이터가 로드된 상태에서 재시도 실패 시 빈 화면이 표시되는 UX 문제.
- **조치 (✅ 2026-10-27 적용)**: 에러 시 이전 데이터 유지. 데이터가 있으면 `StaleDataNotice`(갱신 실패 안내 + 재시도) 표시.

#### [REC-03] 🟡 WeatherCard의 WeatherIcon에 priority 미적용

- **파일**: `src/components/WeatherIcon.tsx`
- LCP 후보 이미지(현재 날씨 아이콘, size=96)에 `priority={true}` 미적용.
- **조치 (✅ 2026-10-27 적용)**: `WeatherIcon`에 `priority` prop 추가, `WeatherCard`에서 전달.

#### [REC-04] 🟡 page.tsx 재시도 로직이 전체 새로고침에 의존

- **파일**: `src/app/page.tsx`
- `handleRetry`가 `window.location.reload()`를 호출하여 위치 정보 재요청도 함께 발생.
- **조치 (✅ 2026-10-27 적용)**: `useWeather`가 `refetch`를 반환하고 재시도 버튼이 이를 호출.

#### [REC-05] 🟡 테스트 도구 미설치

- **파일**: `package.json`
- `vitest`, `@testing-library/react`, `@playwright/test` 등 미설치.
- **조치 (✅ 2026-10-27 부분 적용)**: `vitest@4` + `vitest.config.ts` + `npm test` 구성, 순수 함수 단위 테스트 9건. 컴포넌트/E2E(Testing Library, Playwright)는 미적용.
- 참고: vitest 5는 `@types/node>=22`를 요구하여 4.x 사용. npm 10.9의 arborist 버그(`edgesOut`)로 `--legacy-peer-deps`로 설치함.

#### [REC-06] 🟡 PWA 아이콘 파일 미생성

- **파일**: `public/`
- `manifest.json`에 정의된 `icon-192.png`, `icon-512.png`, `apple-icon.png`, `og-image.png` 파일이 없다.
- **조치 (✅ 2026-10-27 적용)**: 해+구름 심볼로 `icon-192.png`, `icon-512.png`, `apple-icon.png`(180), `og-image.png`(1200×630) 생성. maskable 안전영역(반지름 40%) 내 배치.

#### [REC-07] ✅ 에러 메시지 하드코딩(한국어) → 적용 (2026-10-27)

- hook은 에러 코드(`GeolocationErrorCode`, `WeatherErrorCode`)만 반환하고 UI에서 `t.geoErrors` / `t.weatherErrors`로 번역 (5개 언어).

#### [REC-08] ✅ 접근성 · 캔버스 → 적용 (2026-10-27)

- `viewport.maximumScale: 1` 제거 (확대 허용, WCAG 1.4.4).
- `WeatherBackground`: `devicePixelRatio`(최대 2) 대응, `prefers-reduced-motion` 시 정적 프레임.
- 백그라운드 탭 일시정지는 브라우저가 rAF를 자동 중단하므로 별도 구현하지 않음.

#### [FEAT] ✅ 위치 정확도 안내 · 직접 선택 (2026-10-27)

- **배경**: PC(성남)에서 화성시로 표시됨. OWM 역지오코딩은 정확했고(성남 좌표 → `Seongnam-si`), 브라우저가 IP 기반으로 추정한 좌표 자체가 약 30km 어긋난 것이 원인. PC에는 GPS가 없어 `enableHighAccuracy`로 해결 불가.
- `useGeolocation`이 `accuracy`를 반환하고, 5km 초과 시 `LocationStatus`에 "대략적인 위치" 안내 표시.
- "위치 변경" → `LocationSearch`(`/api/geocode`, OWM Direct Geocoding, 한글 지원)로 도시 선택 → `useSavedLocation`이 localStorage에 저장. 저장 위치가 있으면 위치 권한 요청 생략. "현재 위치 사용"으로 해제.
- 위치 변경 후 새 데이터를 받는 동안 이전 화면을 흐리게 표시(`aria-busy`).

#### [FEAT] ✅ 시간별 예보 · 대기질 추가 (2026-10-27)

- `HourlyForecast`: `/api/forecast` 응답의 `hourly`(24시간) 표시 — 추가 OWM 호출 없음.
- `AirQualityCard` + `/api/air` + `useAirQuality`: AQI·PM2.5·PM10. OWM AQI는 유럽 CAQI 기준으로 국내 환경부 등급과 다름.

---

### 잘된 점

#### [GOOD-01] ✅ API 키 서버사이드 격리

`import 'server-only'`로 클라이언트 번들 포함을 컴파일 타임에 차단. `OPENWEATHERMAP_API_KEY` 노출 위험 없음.

#### [GOOD-02] ✅ 완전한 파라미터 검증 (3단계)

존재 여부 → 숫자 형식 → 범위(-90~90, -180~180). 각 단계마다 명확한 에러 메시지와 400 코드 반환.

#### [GOOD-03] ✅ 타입 안전성

`any` 타입 없음. OWM 원본 타입과 앱 타입 명확히 분리. strict mode 준수.

#### [GOOD-04] ✅ Race Condition 방지

`cancelled` 플래그로 언마운트 후 stale setState 차단. 좌표 변경 시 이전 응답이 새 상태를 덮어쓰는 문제 방지.

#### [GOOD-05] ✅ Geolocation 완전한 Fallback

PERMISSION_DENIED, POSITION_UNAVAILABLE, TIMEOUT, 미지원 브라우저 모두 서울 기본 좌표로 Fallback. 앱이 항상 날씨 정보를 표시.

#### [GOOD-06] ✅ next/image + remotePatterns

LCP 최적화, WebP 자동 변환, 이미지 도메인 화이트리스트 보안 적용.

#### [GOOD-07] ✅ 접근성 (WAI-ARIA)

`aria-label`, `aria-hidden`, `role="status"`, `role="alert"`, `aria-live="polite"` 체계적 적용.

#### [GOOD-08] ✅ 스켈레톤 로딩 UI

실제 레이아웃과 동일한 구조의 스켈레톤으로 CLS 방지.

#### [GOOD-09] ✅ 날씨별 Canvas 배경 애니메이션

8가지 날씨 조건별 차별화된 그라데이션과 파티클 애니메이션. 낮/밤 구분(OWM 아이콘 코드 'n' 접미사). `requestAnimationFrame` + `cancelAnimationFrame` 메모리 누수 방지.

#### [GOOD-10] ✅ 데모 모드 (?demo=true)

API 키 미발급 상태에서도 UI 전체를 확인 가능. 목업 데이터 사용, API 호출 없음, 데모 배너 표시.

#### [GOOD-11] ✅ SEO / GEO / AEO 완전한 적용

- SEO: title template, description, keywords, canonical, robots, sitemap, robots.txt
- Open Graph / Twitter Card: OG 이미지(1200×630), 로케일(ko_KR)
- GEO: `geo.region: KR`, `geo.placename: South Korea`
- AEO: JSON-LD WebApplication, FAQPage, Speakable schema
- PWA: Web App Manifest, themeColor (라이트/다크), Apple 메타태그

#### [GOOD-12] ✅ Hydration 불일치 방지

`useCurrentTime`이 `useState('')` 초기화 후 `useEffect`에서만 시간 설정. 서버/클라이언트 렌더링 불일치 방지.

---

## 정합성 매트릭스

| 검증 항목 | 상태 | 비고 |
|----------|------|------|
| 아키텍처 ↔ 코드 구조 | ✅ | 모든 컴포넌트, hook, Route Handler 일치 |
| API 명세 ↔ /api/weather 구현 | ✅ | 3단계 파라미터 검증 + 에러 응답 일치 |
| API 명세 ↔ /api/forecast 구현 | ✅ | FR-01 수정 후 일치 |
| DB 스키마 ↔ 상태 구조 | ✅ | WeatherState.loading 필드명 명세 반영 |
| 프론트 ↔ 백엔드 연동 | ✅ | 두 API 모두 정상 연동 |
| 타입 정의 ↔ 실제 사용 | ✅ | 전체 코드베이스 일관된 타입 사용 |
| 보안 | ✅ | API 키 격리, 입력 검증, 이미지 도메인 제한 |
| 접근성 | ✅ | ARIA 체계적 적용 |
| SEO / GEO / AEO | ✅ | 메타데이터 + JSON-LD + PWA 완비 |
| 이미지 최적화 | ✅ | next/image + LCP 아이콘 priority |
| PWA 아이콘 파일 | ✅ | 아이콘 3종 + OG 이미지 생성 |
| 테스트 도구 설치 | ⚠️ | vitest 단위 테스트 ✅, 컴포넌트/E2E 미설치 |

---

## 필수 수정 체크리스트

- [x] `src/app/api/forecast/route.ts` 파일 생성 (FR-01)
- [x] `useGeolocation` POSITION_UNAVAILABLE/TIMEOUT permission 값 수정 (FR-02)
- [x] `02_api_spec.md` 범위 검증 에러 응답 케이스 추가 (REC-01)

## 배포 전 완료 필요

- [x] `public/` 아이콘 파일 생성 (icon-192.png, icon-512.png, apple-icon.png, og-image.png)
- [ ] Vercel 환경변수 등록 (OPENWEATHERMAP_API_KEY, NEXT_PUBLIC_BASE_URL)
- [ ] GitHub Secrets 등록 (VERCEL_TOKEN, VERCEL_ORG_ID, VERCEL_PROJECT_ID)
