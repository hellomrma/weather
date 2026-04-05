# API 명세

- **최종 업데이트**: 2026-04-05

## 기본 정보

- **Base URL**: `/api` (Next.js App Router Route Handler)
- **인증 방식**: 없음 (서버사이드 API 키 사용, 클라이언트 인증 불필요)
- **응답 형식**: `application/json`
- **문자 인코딩**: UTF-8
- **단위**: 섭씨(°C), m/s (OpenWeatherMap `units=metric` 고정)
- **캐싱**: `'use cache'` 디렉티브 적용 (현재 날씨 10분, 예보 1시간)

---

## 엔드포인트 목록

| Method | Path | 설명 | 캐시 TTL | 성공 응답 |
|--------|------|------|---------|---------|
| GET | `/api/weather` | 현재 날씨 조회 | 10분 (stale 5분) | 200 WeatherResponse |
| GET | `/api/forecast` | 5일 예보 조회 | 1시간 (stale 30분) | 200 ForecastResponse |

---

## 상세 API

### [GET] /api/weather

현재 위치의 실시간 날씨 정보를 반환한다. OpenWeatherMap Current Weather API(`/data/2.5/weather`)를 내부 호출하여 앱 타입으로 변환한다.

#### 쿼리 파라미터

| 파라미터 | 타입 | 필수 | 범위 | 예시 |
|---------|------|------|------|------|
| `lat` | `number` | 필수 | -90 ~ 90 | `37.5665` |
| `lon` | `number` | 필수 | -180 ~ 180 | `126.9780` |

#### 요청 예시

```
GET /api/weather?lat=37.5665&lon=126.9780
```

#### 응답 타입

```typescript
interface WeatherResponse {
  location: {
    city: string       // 도시명 (예: "Seoul")
    country: string    // 국가 코드 (예: "KR")
  }
  current: {
    temp: number         // 현재 온도 (섭씨, 소수점 1자리 반올림)
    feelsLike: number    // 체감 온도 (섭씨, 소수점 1자리 반올림)
    humidity: number     // 습도 (%, 0-100)
    windSpeed: number    // 풍속 (m/s)
    windDeg: number      // 풍향 (도, 0-360)
    description: string  // 날씨 설명 (예: "약간의 구름")
    icon: string         // OWM 아이콘 코드 (예: "01d", "10n")
    condition: string    // 날씨 주요 상태 (예: "Clear" | "Clouds" | "Rain" | "Snow" | "Thunderstorm" | "Drizzle" | "Mist")
  }
}
```

#### 응답 예시 (200 OK)

```json
{
  "location": { "city": "Seoul", "country": "KR" },
  "current": {
    "temp": 18.4,
    "feelsLike": 17.1,
    "humidity": 62,
    "windSpeed": 3.2,
    "windDeg": 230,
    "description": "약간의 구름",
    "icon": "02d",
    "condition": "Clouds"
  }
}
```

#### 에러 응답

| HTTP 상태 | 원인 | 응답 본문 |
|----------|------|---------|
| 400 | `lat` 또는 `lon` 누락 | `{ "error": "lat and lon query parameters are required" }` |
| 400 | 숫자가 아닌 값 | `{ "error": "lat and lon must be valid numbers" }` |
| 400 | `lat` 범위 초과 | `{ "error": "lat must be between -90 and 90" }` |
| 400 | `lon` 범위 초과 | `{ "error": "lon must be between -180 and 180" }` |
| 500 | OWM API 오류 (네트워크, 인증, Rate Limit 등) | `{ "error": "Failed to fetch weather data" }` |

---

### [GET] /api/forecast

현재 위치의 5일 예보를 일별로 집계하여 반환한다. OpenWeatherMap 5 Day / 3 Hour Forecast API(`/data/2.5/forecast`)를 내부 호출하고, 3시간 간격 데이터를 날짜별로 집계한다.

#### 집계 규칙

- **날짜 기준**: `dt_txt`(UTC)의 `YYYY-MM-DD` 부분으로 그룹화
- **tempMax**: 그룹 내 `main.temp_max` 최댓값 (소수점 1자리 반올림)
- **tempMin**: 그룹 내 `main.temp_min` 최솟값 (소수점 1자리 반올림)
- **description / icon**: 정오(12:00 UTC) 항목 우선, 없으면 첫 번째 항목
- **pop**: 그룹 내 최댓값 (0.0 ~ 1.0)
- **반환 개수**: 최대 5일

#### 쿼리 파라미터

| 파라미터 | 타입 | 필수 | 범위 | 예시 |
|---------|------|------|------|------|
| `lat` | `number` | 필수 | -90 ~ 90 | `37.5665` |
| `lon` | `number` | 필수 | -180 ~ 180 | `126.9780` |

#### 요청 예시

```
GET /api/forecast?lat=37.5665&lon=126.9780
```

#### 응답 타입

```typescript
interface ForecastDay {
  date: string        // ISO 날짜 (예: "2026-04-06")
  tempMin: number     // 일 최저 기온 (섭씨, 소수점 1자리)
  tempMax: number     // 일 최고 기온 (섭씨, 소수점 1자리)
  description: string // 대표 날씨 설명
  icon: string        // OWM 아이콘 코드
  pop: number         // 최대 강수 확률 (0.0 ~ 1.0)
}

interface ForecastResponse {
  daily: ForecastDay[]  // 최대 5개 항목
}
```

#### 응답 예시 (200 OK)

```json
{
  "daily": [
    { "date": "2026-04-06", "tempMin": 10.2, "tempMax": 19.8, "description": "가벼운 비", "icon": "10d", "pop": 0.72 },
    { "date": "2026-04-07", "tempMin": 8.5,  "tempMax": 16.3, "description": "흐림",      "icon": "04d", "pop": 0.20 },
    { "date": "2026-04-08", "tempMin": 11.0, "tempMax": 21.4, "description": "맑음",      "icon": "01d", "pop": 0.04 },
    { "date": "2026-04-09", "tempMin": 13.1, "tempMax": 23.2, "description": "약간 구름", "icon": "02d", "pop": 0.00 },
    { "date": "2026-04-10", "tempMin": 9.8,  "tempMax": 18.7, "description": "보통 비",   "icon": "10d", "pop": 0.85 }
  ]
}
```

#### 에러 응답

| HTTP 상태 | 원인 | 응답 본문 |
|----------|------|---------|
| 400 | `lat` 또는 `lon` 누락 | `{ "error": "lat and lon query parameters are required" }` |
| 400 | 숫자가 아닌 값 | `{ "error": "lat and lon must be valid numbers" }` |
| 400 | `lat` 범위 초과 | `{ "error": "lat must be between -90 and 90" }` |
| 400 | `lon` 범위 초과 | `{ "error": "lon must be between -180 and 180" }` |
| 500 | OWM API 오류 | `{ "error": "Failed to fetch forecast data" }` |

---

## 공통 Route Handler 패턴

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { cacheLife } from 'next/cache'

export async function GET(request: NextRequest) {
  'use cache'
  cacheLife({ stale: 300, revalidate: 600, expire: 1800 }) // 현재 날씨 기준

  const { searchParams } = new URL(request.url)
  const lat = searchParams.get('lat')
  const lon = searchParams.get('lon')

  // 1. 파라미터 존재 검증
  if (!lat || !lon) {
    return NextResponse.json({ error: 'lat and lon query parameters are required' }, { status: 400 })
  }

  // 2. 숫자 형식 검증
  const latNum = parseFloat(lat)
  const lonNum = parseFloat(lon)
  if (isNaN(latNum) || isNaN(lonNum)) {
    return NextResponse.json({ error: 'lat and lon must be valid numbers' }, { status: 400 })
  }

  // 3. 범위 검증
  if (latNum < -90 || latNum > 90) {
    return NextResponse.json({ error: 'lat must be between -90 and 90' }, { status: 400 })
  }
  if (lonNum < -180 || lonNum > 180) {
    return NextResponse.json({ error: 'lon must be between -180 and 180' }, { status: 400 })
  }

  // 4. 외부 API 호출
  try {
    const data = await fetchCurrentWeather(latNum, lonNum)
    return NextResponse.json(data)
  } catch {
    return NextResponse.json({ error: 'Failed to fetch weather data' }, { status: 500 })
  }
}
```

---

## OWM 아이콘 URL 규칙

```typescript
// icon 코드 → 이미지 URL
const getIconUrl = (icon: string) =>
  `https://openweathermap.org/img/wn/${icon}@2x.png`

// 예: "01d" → .../01d@2x.png (맑은 낮)
//     "10n" → .../10n@2x.png (비 밤)
// 낮/밤 구분: 아이콘 코드 마지막 문자 'd'(day) | 'n'(night)
// WeatherBackground 컴포넌트도 이 규칙으로 낮/밤 배경을 구분한다.
```

`next.config.ts` 원격 이미지 허용 설정:

```typescript
images: {
  remotePatterns: [
    { protocol: 'https', hostname: 'openweathermap.org', pathname: '/img/wn/**' }
  ]
}
```
