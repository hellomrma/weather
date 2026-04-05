# 테스트 계획

- **최종 업데이트**: 2026-04-05

## 테스트 전략

- **커버리지 목표**: 핵심 비즈니스 로직 80% 이상
- **테스트 레벨**: 단위(70%) / 통합(20%) / E2E(10%)
- **테스트 도구**:
  - 단위/통합: Vitest + @testing-library/react + MSW (API 목킹)
  - E2E: Playwright
- **주요 원칙**: AAA 패턴 (Arrange → Act → Assert), 테스트 간 독립성 보장

---

## 테스트 매트릭스

| 기능 | 단위 | 통합 | E2E | 우선순위 |
|------|------|------|-----|---------|
| OWM 응답 변환 (mapCurrentWeather) | ✅ | - | - | P0 |
| OWM 예보 집계 (aggregateForecast) | ✅ | - | - | P0 |
| useGeolocation hook | ✅ | - | - | P0 |
| useWeather hook | ✅ | - | - | P0 |
| GET /api/weather | - | ✅ | - | P0 |
| GET /api/forecast | - | ✅ | - | P0 |
| WeatherBackground 캔버스 렌더링 | ✅ | - | - | P1 |
| 데모 모드 (?demo=true) | ✅ | - | ✅ | P1 |
| 위치 허용 → 날씨 표시 | - | - | ✅ | P0 |
| 위치 거부 → 서울 날씨 표시 | - | - | ✅ | P0 |
| API 오류 → 에러 메시지 | - | - | ✅ | P1 |
| WeatherCard 렌더링 | ✅ | - | - | P1 |
| ForecastList 렌더링 | ✅ | - | - | P1 |
| JSON-LD 구조화 데이터 | ✅ | - | - | P1 |
| getWindDirection 변환 | ✅ | - | - | P2 |
| 날씨별 배경 그라데이션 | ✅ | - | - | P2 |

---

## 단위 테스트 시나리오

### 1. `weather-api.ts` — OWM 응답 변환

파일: `src/lib/__tests__/weather-api.test.ts`

#### 1-1. `mapCurrentWeather`

| # | 시나리오 | 입력 | 기대 결과 |
|---|---------|------|---------|
| U-01 | 정상 변환 | 완전한 OWMCurrentWeatherResponse | WeatherResponse 구조 반환 |
| U-02 | 온도 소수점 반올림 | temp: 18.456 | temp: 18.5 |
| U-03 | 체감온도 반올림 | feels_like: 17.149 | feelsLike: 17.1 |
| U-04 | weather[0] 사용 | weather[0].icon = "01d" | icon: "01d" |
| U-05 | condition 매핑 | weather[0].main = "Clear" | condition: "Clear" |
| U-06 | 풍속/풍향 매핑 | wind.speed: 3.2, wind.deg: 230 | windSpeed: 3.2, windDeg: 230 |

#### 1-2. `aggregateForecast`

| # | 시나리오 | 입력 | 기대 결과 |
|---|---------|------|---------|
| U-07 | 날짜별 그룹화 | 2개 날짜 항목 | 2개 ForecastDay |
| U-08 | tempMax 최댓값 | temp_max: [15.0, 19.8, 12.3] | tempMax: 19.8 |
| U-09 | tempMin 최솟값 | temp_min: [8.0, 10.2, 11.5] | tempMin: 8.0 |
| U-10 | 정오 항목 우선 | 00:00, 12:00, 15:00 혼재 | 12:00 항목 description/icon |
| U-11 | 정오 없으면 첫 번째 | 00:00, 03:00, 06:00만 존재 | 00:00 항목 |
| U-12 | pop 최댓값 | pop: [0.2, 0.72, 0.45] | pop: 0.72 |
| U-13 | 최대 5일 제한 | 6개 날짜 그룹 | 5개 반환 |
| U-14 | 빈 목록 | [] | [] |

#### 1-3. `getApiKey()`

| # | 시나리오 | 기대 결과 |
|---|---------|---------|
| U-15 | 환경변수 설정 시 | 키 문자열 반환 |
| U-16 | 환경변수 미설정 시 | Error throw |

---

### 2. `useGeolocation` hook

파일: `src/hooks/__tests__/useGeolocation.test.ts`

| # | 시나리오 | 목킹 조건 | 기대 상태 |
|---|---------|---------|---------|
| U-17 | 초기 상태 | - | loading: true, permission: 'loading' |
| U-18 | 위치 허용 | onSuccess({ coords: { latitude: 35.1, longitude: 129.0 } }) | permission: 'granted', lat: 35.1, lon: 129.0 |
| U-19 | PERMISSION_DENIED (code:1) | onError({ code: 1 }) | permission: 'denied', lat: 37.5665 (서울) |
| U-20 | POSITION_UNAVAILABLE (code:2) | onError({ code: 2 }) | permission: 'prompt', lat: 37.5665 (서울) |
| U-21 | TIMEOUT (code:3) | onError({ code: 3 }) | permission: 'prompt', lat: 37.5665 (서울) |
| U-22 | geolocation 미지원 | navigator.geolocation = undefined | permission: 'denied', error 존재 |

---

### 3. `useWeather` hook

파일: `src/hooks/__tests__/useWeather.test.ts`

| # | 시나리오 | 목킹 | 기대 결과 |
|---|---------|------|---------|
| U-23 | 초기 로딩 | 지연 응답 | loading: true |
| U-24 | 정상 수신 | 두 API 200 | loading: false, weather/forecast 데이터 존재 |
| U-25 | /api/weather 실패 | ok: false | loading: false, error 존재 |
| U-26 | /api/forecast 실패 | ok: false | loading: false, error 존재 |
| U-27 | 좌표 변경 시 재요청 | lat, lon 변경 | 새 좌표로 fetch 재실행 |
| U-28 | 언마운트 후 응답 무시 | 응답 도착 전 언마운트 | setState 미호출 |
| U-29 | NaN 좌표 무시 | lat: NaN | fetch 미호출 |

---

### 4. 컴포넌트 단위 테스트

파일: `src/components/__tests__/`

#### WeatherBackground

| # | 시나리오 | 기대 결과 |
|---|---------|---------|
| U-30 | canvas 요소 렌더링 | `<canvas aria-hidden="true">` 존재 |
| U-31 | condition 미전달 | 기본값('Clear')으로 렌더링, 오류 없음 |
| U-32 | 날/밤 구분 | icon="01d" → isNight: false, icon="01n" → isNight: true |

#### WeatherCard

| # | 시나리오 | 기대 결과 |
|---|---------|---------|
| U-33 | 정상 렌더링 | 도시명, 온도, 체감온도, 습도, 풍속 표시 |
| U-34 | aria-label 확인 | 온도 aria-label 존재 |

#### ForecastList

| # | 시나리오 | 기대 결과 |
|---|---------|---------|
| U-35 | 정상 렌더링 | daily 배열 수만큼 항목 렌더링 |
| U-36 | 빈 배열 | null 반환 |
| U-37 | pop = 0 | 강수 확률 표시 없음 |
| U-38 | pop > 0 | 강수 확률 % 표시 |

#### JsonLd

| # | 시나리오 | 기대 결과 |
|---|---------|---------|
| U-39 | WebApplication 스키마 | script[type="application/ld+json"] 3개 존재 |
| U-40 | FAQPage 스키마 | mainEntity 4개 포함 |
| U-41 | 유효한 JSON | JSON.parse 오류 없음 |

#### getWindDirection 유틸리티

| # | deg | 기대 결과 |
|---|-----|---------|
| U-42 | 0 / 360 | "N" |
| U-43 | 90 | "E" |
| U-44 | 180 | "S" |
| U-45 | 270 | "W" |
| U-46 | 22.5 | "NNE" |

---

## 통합 테스트 시나리오

파일: `src/app/api/__tests__/`

### GET /api/weather

| # | 요청 | 기대 응답 |
|---|------|---------|
| I-01 | `?lat=37.5&lon=126.9` | 200 + WeatherResponse |
| I-02 | lat 누락 | 400 |
| I-03 | `?lat=abc&lon=126.9` | 400 |
| I-04 | `?lat=91&lon=0` | 400 (범위 초과) |
| I-05 | `?lat=-91&lon=0` | 400 (범위 미달) |
| I-06 | `?lat=0&lon=181` | 400 (범위 초과) |
| I-07 | `?lat=90&lon=0` | 200 (경계값 유효) |
| I-08 | OWM API 네트워크 오류 | 500 |
| I-09 | OWM API 401 응답 | 500 |

### GET /api/forecast

| # | 요청 | 기대 응답 |
|---|------|---------|
| I-10 | `?lat=37.5&lon=126.9` | 200 + ForecastResponse |
| I-11 | lat 누락 | 400 |
| I-12 | `?lat=91&lon=0` | 400 |
| I-13 | OWM 6일치 목킹 | daily.length <= 5 |
| I-14 | 정상 응답 | daily 각 항목에 6개 필드 모두 존재 |

---

## E2E 테스트 시나리오 (Playwright)

파일: `e2e/weather.spec.ts`

### E2E-01: 위치 허용 → 실제 위치 날씨 표시

```
1. geolocation 권한 허용, 부산 좌표(35.1, 129.0) 설정
2. / 접속
3. 로딩 스켈레톤 표시 확인
4. weather-card 렌더링 확인
5. 도시명이 Seoul이 아닌 지역명 확인
```

### E2E-02: 위치 거부 → 서울 날씨 표시

```
1. geolocation 권한 거부
2. / 접속
3. 에러 안내 문구("서울 날씨를 표시합니다") 확인
4. weather-card 렌더링, 도시명 "Seoul" 확인
5. forecast-list 1~5개 항목 확인
```

### E2E-03: API 오류 → 에러 UI 및 재시도 버튼

```
1. /api/weather를 500으로 목킹
2. / 접속
3. error-view data-testid 확인
4. "다시 시도" 버튼 클릭 → 페이지 새로고침
```

### E2E-04: 데모 모드 (?demo=true)

```
1. /?demo=true 접속
2. 노란 데모 배너 표시 확인
3. weather-card 즉시 렌더링 (로딩 없음) 확인
4. 도시명 "서울" 표시 확인
5. forecast-list 5개 항목 확인
6. Network 탭에서 /api/weather, /api/forecast 호출 없음 확인
```

### E2E-05: 날씨별 캔버스 배경

```
1. /?demo=true 접속
2. canvas[aria-hidden="true"] 존재 확인
3. mock-data의 condition("Clouds")에 맞는 배경색 클래스 확인
```

---

## 테스트 환경 설정

### Vitest 설정 (`vitest.config.ts`)

```typescript
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    coverage: {
      provider: 'v8',
      include: ['src/lib/**', 'src/hooks/**', 'src/app/api/**', 'src/components/**'],
      threshold: { lines: 80, functions: 80, branches: 75 },
    },
  },
  resolve: { alias: { '@': path.resolve(__dirname, './src') } },
})
```

### Playwright 설정 (`playwright.config.ts`)

```typescript
import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  use: { baseURL: 'http://localhost:3000' },
  projects: [
    { name: 'chromium',      use: { ...devices['Desktop Chrome'] } },
    { name: 'Mobile Safari', use: { ...devices['iPhone 14'] } },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
})
```

### 테스트 셋업 (`src/test/setup.ts`)

```typescript
import '@testing-library/jest-dom'
import { server } from './mocks/server'

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())
```
