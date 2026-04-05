# DB 스키마 / 상태 구조

- **최종 업데이트**: 2026-04-05

## DB 없음

이 프로젝트는 **별도 데이터베이스를 사용하지 않는다.**

모든 날씨 데이터는 OpenWeatherMap API를 실시간으로 조회하여 클라이언트에 전달한다. 영속성이 필요한 정보가 없으므로 DB 계층이 불필요하다.

이 문서는 다음을 정의한다:
1. 클라이언트 상태 구조
2. 목업 데이터 구조 (데모 모드)
3. OWM API 응답 → 앱 타입 매핑
4. 환경변수 목록

---

## 1. 클라이언트 상태 구조

### useGeolocation — 위치 상태

```typescript
// src/hooks/useGeolocation.ts
export type LocationPermission = 'prompt' | 'granted' | 'denied' | 'loading'

export interface GeolocationState {
  lat: number         // 기본값: 37.5665 (서울)
  lon: number         // 기본값: 126.9780 (서울)
  loading: boolean
  error: string | null
  permission: LocationPermission
}
```

**상태 전이**:

```
초기값: { loading: true, permission: 'loading', lat: 37.5665, lon: 126.9780 }

getCurrentPosition 성공 → { loading: false, permission: 'granted', lat: 실제좌표, lon: 실제좌표 }
PERMISSION_DENIED(code:1)  → { loading: false, permission: 'denied',  lat: 37.5665(서울), error: '...' }
POSITION_UNAVAILABLE(code:2) → { loading: false, permission: 'prompt', lat: 37.5665(서울), error: '...' }
TIMEOUT(code:3)            → { loading: false, permission: 'prompt',  lat: 37.5665(서울), error: '...' }
geolocation 미지원         → { loading: false, permission: 'denied',  lat: 37.5665(서울), error: '...' }
```

> `POSITION_UNAVAILABLE`과 `TIMEOUT`은 사용자가 권한을 거부한 것이 아니므로 `'prompt'`로 설정한다.
> `LocationStatus` 컴포넌트는 `error` prop을 우선 표시하므로 에러 메시지는 올바르게 표시된다.

### useWeather — 날씨 데이터 상태

```typescript
// src/hooks/useWeather.ts
export interface WeatherState {
  weather: WeatherResponse | null
  forecast: ForecastResponse | null
  loading: boolean      // 필드명: loading (isLoading 아님)
  error: string | null
}
```

**동작 방식**:
- `lat`, `lon`이 `NaN` 또는 `Infinity`이면 fetch를 호출하지 않는다 (데모 모드 차단).
- `/api/weather`와 `/api/forecast`를 `Promise.all`로 병렬 호출한다.
- `cancelled` 플래그로 언마운트 후 stale 상태 업데이트를 방지한다.

---

## 2. 목업 데이터 구조 (데모 모드)

```typescript
// src/lib/mock-data.ts
export const MOCK_WEATHER: WeatherResponse = {
  location: { city: '서울', country: 'KR' },
  current: {
    temp: 18.4,
    feelsLike: 17.1,
    humidity: 62,
    windSpeed: 3.2,
    windDeg: 225,
    description: '약간의 구름',
    icon: '02d',
    condition: 'Clouds',
  },
}

export const MOCK_FORECAST: ForecastResponse = {
  daily: [
    { date: '2026-04-05', tempMin: 11.2, tempMax: 19.8, description: '약간의 구름', icon: '02d', pop: 0.10 },
    { date: '2026-04-06', tempMin: 13.0, tempMax: 22.3, description: '맑음',       icon: '01d', pop: 0.00 },
    { date: '2026-04-07', tempMin: 14.5, tempMax: 20.1, description: '가벼운 비',  icon: '10d', pop: 0.75 },
    { date: '2026-04-08', tempMin: 10.8, tempMax: 16.4, description: '흐림',       icon: '04d', pop: 0.40 },
    { date: '2026-04-09', tempMin: 9.3,  tempMax: 17.6, description: '맑음',       icon: '01d', pop: 0.05 },
  ],
}
```

**데모 모드 조건 분기** (`page.tsx`):

```typescript
const isDemo = searchParams.get('demo') === 'true'

const weather  = isDemo ? MOCK_WEATHER  : realWeatherState.weather
const forecast = isDemo ? MOCK_FORECAST : realWeatherState.forecast
const isLoading = isDemo ? false : (geoLoading || realWeatherState.loading)
```

---

## 3. OWM API 응답 → 앱 타입 매핑

### Current Weather → `WeatherResponse`

| OWM 응답 필드 | 앱 타입 필드 | 변환 방식 |
|-------------|------------|---------|
| `name` | `location.city` | 그대로 |
| `sys.country` | `location.country` | 그대로 |
| `main.temp` | `current.temp` | `Math.round(x * 10) / 10` |
| `main.feels_like` | `current.feelsLike` | `Math.round(x * 10) / 10` |
| `main.humidity` | `current.humidity` | 그대로 |
| `wind.speed` | `current.windSpeed` | 그대로 |
| `wind.deg` | `current.windDeg` | 그대로 |
| `weather[0].description` | `current.description` | 그대로 (`lang=kr` 파라미터로 한국어) |
| `weather[0].icon` | `current.icon` | 그대로 (예: `"02d"`) |
| `weather[0].main` | `current.condition` | 그대로 (예: `"Clouds"`) |

### 5 Day Forecast → `ForecastResponse`

| OWM 응답 필드 | 앱 타입 필드 | 변환 방식 |
|-------------|------------|---------|
| `list[n].dt_txt` | `daily[n].date` | `"YYYY-MM-DD HH:MM:SS"` → `"YYYY-MM-DD"` |
| `list[n].main.temp_max` (그룹 최댓값) | `daily[n].tempMax` | `Math.round(Math.max(...) * 10) / 10` |
| `list[n].main.temp_min` (그룹 최솟값) | `daily[n].tempMin` | `Math.round(Math.min(...) * 10) / 10` |
| `list[n].weather[0].description` (정오 우선) | `daily[n].description` | 정오(12:00:00) 항목 우선 |
| `list[n].weather[0].icon` (정오 우선) | `daily[n].icon` | 정오(12:00:00) 항목 우선 |
| `list[n].pop` (그룹 최댓값) | `daily[n].pop` | `Math.max(...)` |

---

## 4. 환경변수 목록

| 변수명 | 설명 | 필수 | 참조 위치 |
|--------|------|------|---------|
| `OPENWEATHERMAP_API_KEY` | OpenWeatherMap API 인증 키 | 필수 | `src/lib/weather-api.ts` (서버 전용) |
| `NEXT_PUBLIC_BASE_URL` | 배포된 앱의 도메인 URL | 권장 | `src/app/layout.tsx`, `sitemap.ts`, `robots.ts` |

```bash
# .env.local
OPENWEATHERMAP_API_KEY=your_owm_api_key_here
NEXT_PUBLIC_BASE_URL=https://your-app.vercel.app
```

> `OPENWEATHERMAP_API_KEY`는 `NEXT_PUBLIC_` 접두어가 없으므로 서버사이드에서만 접근 가능하다.
> `NEXT_PUBLIC_BASE_URL`은 클라이언트 번들에 포함되어도 무방한 공개 정보이다.

---

## 향후 DB 도입 시나리오

| 기능 추가 | 필요 테이블 | 권장 기술 |
|---------|-----------|---------|
| 즐겨찾기 도시 저장 | `users`, `favorite_locations` | Neon Postgres + Prisma |
| API 응답 캐싱 (Rate Limit 완화) | `weather_cache` | Upstash Redis |
| 사용자 단위 설정 (섭씨/화씨) | `user_preferences` | Neon Postgres + Prisma |
