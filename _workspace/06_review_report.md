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

---

### 권장 개선

#### [REC-01] 🟡 API 명세와 에러 응답 불일치 → 문서 업데이트 완료

- **파일**: `_workspace/02_api_spec.md`
- `/api/weather`가 lat/lon 범위 검증 시 에러 메시지를 반환하지만 초기 명세에 누락되어 있었다.
- **조치**: `02_api_spec.md` 에러 응답 테이블에 범위 검증 케이스(400) 추가 완료.

#### [REC-02] 🟡 useWeather — 에러 시 기존 데이터 초기화 문제

- **파일**: `src/hooks/useWeather.ts` 50~56행
- 에러 발생 시 `weather: null, forecast: null`로 기존 데이터를 초기화한다. 이미 데이터가 로드된 상태에서 재시도 실패 시 빈 화면이 표시되는 UX 문제.
- **조치 (미적용)**: `error` 상태에서 이전 데이터를 유지하도록 개선 검토.

#### [REC-03] 🟡 WeatherCard의 WeatherIcon에 priority 미적용

- **파일**: `src/components/WeatherIcon.tsx`
- LCP 후보 이미지(현재 날씨 아이콘, size=96)에 `priority={true}` 미적용.
- **조치 (미적용)**: `WeatherCard`에서 `WeatherIcon` 사용 시 `priority={true}` 전달.

#### [REC-04] 🟡 page.tsx 재시도 로직이 전체 새로고침에 의존

- **파일**: `src/app/page.tsx`
- `handleRetry`가 `window.location.reload()`를 호출하여 위치 정보 재요청도 함께 발생.
- **조치 (미적용)**: `useWeather` hook에 `refetch` 함수를 노출하여 API만 재요청하도록 개선.

#### [REC-05] 🟡 테스트 도구 미설치

- **파일**: `package.json`
- `vitest`, `@testing-library/react`, `@playwright/test` 등 미설치.
- **조치 (미적용)**: 테스트 도구 설치 및 `vitest.config.ts`, `playwright.config.ts` 구성.

#### [REC-06] 🟡 PWA 아이콘 파일 미생성

- **파일**: `public/`
- `manifest.json`에 정의된 `icon-192.png`, `icon-512.png`, `apple-icon.png`, `og-image.png` 파일이 없다.
- **조치 (미적용)**: 아이콘 파일 직접 생성 필요 (디자인 툴 또는 favicon 생성기 활용).

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
| 이미지 최적화 | ⚠️ | next/image 사용 ✅, LCP 아이콘 priority 미적용 |
| PWA 아이콘 파일 | ❌ | 아이콘 이미지 파일 직접 생성 필요 |
| 테스트 도구 설치 | ❌ | vitest, playwright 미설치 |

---

## 필수 수정 체크리스트

- [x] `src/app/api/forecast/route.ts` 파일 생성 (FR-01)
- [x] `useGeolocation` POSITION_UNAVAILABLE/TIMEOUT permission 값 수정 (FR-02)
- [x] `02_api_spec.md` 범위 검증 에러 응답 케이스 추가 (REC-01)

## 배포 전 완료 필요

- [ ] `public/` 아이콘 파일 생성 (icon-192.png, icon-512.png, apple-icon.png, og-image.png)
- [ ] Vercel 환경변수 등록 (OPENWEATHERMAP_API_KEY, NEXT_PUBLIC_BASE_URL)
- [ ] GitHub Secrets 등록 (VERCEL_TOKEN, VERCEL_ORG_ID, VERCEL_PROJECT_ID)
