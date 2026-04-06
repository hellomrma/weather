/**
 * weather-api.ts
 *
 * OpenWeatherMap API 클라이언트 — 서버사이드 전용.
 * Route Handler(route.ts)에서만 import 한다.
 * 클라이언트 번들에 포함되는 코드에서 절대 import 하지 않는다.
 */

import 'server-only'
import { cacheLife } from 'next/cache'
import type {
  WeatherResponse,
  ForecastResponse,
  ForecastDay,
  OWMCurrentWeatherResponse,
  OWMForecastResponse,
  OWMForecastItem,
} from '@/lib/types'

const OWM_BASE_URL = 'https://api.openweathermap.org/data/2.5'

/**
 * API 키를 런타임에 검증하여 반환한다.
 * 미설정 시 서버 콘솔에 명확한 오류를 남기고 에러를 throw 한다.
 */
function getApiKey(): string {
  const key = process.env.OPENWEATHERMAP_API_KEY
  if (!key) {
    console.error(
      '[weather-api] OPENWEATHERMAP_API_KEY environment variable is not set. ' +
        'Set it in .env.local for local development or in Vercel Environment Variables for production.'
    )
    throw new Error('OPENWEATHERMAP_API_KEY environment variable is not set')
  }
  return key
}

// =============================================================================
// 현재 날씨 조회
// =============================================================================

/**
 * OpenWeatherMap Current Weather API를 호출하고
 * OWM 응답을 앱의 WeatherResponse 타입으로 변환하여 반환한다.
 *
 * @param lat 위도 (-90 ~ 90)
 * @param lon 경도 (-180 ~ 180)
 */
export async function fetchCurrentWeather(
  lat: number,
  lon: number,
  lang: string = 'kr'
): Promise<WeatherResponse> {
  'use cache'
  // 현재 날씨: 10분마다 재검증 (빠른 날씨 변화 반영)
  cacheLife({ stale: 300, revalidate: 600, expire: 1800 })

  const apiKey = getApiKey()
  const url =
    `${OWM_BASE_URL}/weather` +
    `?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric&lang=${lang}`

  let res: Response
  try {
    res = await fetch(url)
  } catch (err) {
    console.error('[weather-api] Network error calling OWM /weather:', err)
    throw new Error('Failed to fetch weather data: network error')
  }

  if (!res.ok) {
    const body = await res.text().catch(() => '')
    console.error(
      `[weather-api] OWM /weather responded ${res.status}: ${body}`
    )
    throw new Error(`Failed to fetch weather data: OWM returned ${res.status}`)
  }

  const raw: OWMCurrentWeatherResponse = await res.json()
  return mapCurrentWeather(raw)
}

/**
 * OWM Current Weather 응답 → WeatherResponse 변환
 */
function mapCurrentWeather(raw: OWMCurrentWeatherResponse): WeatherResponse {
  const weather = raw.weather[0]
  return {
    location: {
      city: raw.name,
      country: raw.sys.country,
    },
    current: {
      temp: Math.round(raw.main.temp * 10) / 10,
      feelsLike: Math.round(raw.main.feels_like * 10) / 10,
      humidity: raw.main.humidity,
      windSpeed: raw.wind.speed,
      windDeg: raw.wind.deg,
      description: weather.description,
      icon: weather.icon,
      condition: weather.main,
    },
  }
}

// =============================================================================
// 5일 예보 조회
// =============================================================================

/**
 * OpenWeatherMap 5 Day / 3 Hour Forecast API를 호출하고
 * 3시간 간격 데이터를 일별로 집계하여 ForecastResponse 타입으로 반환한다.
 *
 * @param lat 위도 (-90 ~ 90)
 * @param lon 경도 (-180 ~ 180)
 */
export async function fetchForecast(
  lat: number,
  lon: number,
  lang: string = 'kr'
): Promise<ForecastResponse> {
  'use cache'
  // 5일 예보: 1시간마다 재검증 (일별 예보는 변화 빈도가 낮음)
  cacheLife({ stale: 1800, revalidate: 3600, expire: 7200 })

  const apiKey = getApiKey()
  const url =
    `${OWM_BASE_URL}/forecast` +
    `?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric&lang=${lang}`

  let res: Response
  try {
    res = await fetch(url)
  } catch (err) {
    console.error('[weather-api] Network error calling OWM /forecast:', err)
    throw new Error('Failed to fetch forecast data: network error')
  }

  if (!res.ok) {
    const body = await res.text().catch(() => '')
    console.error(
      `[weather-api] OWM /forecast responded ${res.status}: ${body}`
    )
    throw new Error(`Failed to fetch forecast data: OWM returned ${res.status}`)
  }

  const raw: OWMForecastResponse = await res.json()
  return { daily: aggregateForecast(raw.list) }
}

/**
 * OWM 3시간 간격 예보 목록을 날짜별로 집계하여 일별 ForecastDay 배열로 변환한다.
 *
 * 집계 규칙 (API 명세 준수):
 * - 날짜 기준: dt_txt의 "YYYY-MM-DD" 부분으로 그룹화
 * - tempMax: 그룹 내 main.temp_max 최댓값
 * - tempMin: 그룹 내 main.temp_min 최솟값
 * - description / icon: 해당 날짜 정오(12:00:00 UTC) 항목 우선, 없으면 첫 번째 항목
 * - pop: 그룹 내 최댓값
 * - 최대 5일 반환
 */
function aggregateForecast(list: OWMForecastItem[]): ForecastDay[] {
  // 날짜별 그룹화 — dt_txt 형식: "YYYY-MM-DD HH:MM:SS"
  const grouped = list.reduce<Record<string, OWMForecastItem[]>>((acc, item) => {
    const date = item.dt_txt.split(' ')[0] // "YYYY-MM-DD"
    if (!acc[date]) acc[date] = []
    acc[date].push(item)
    return acc
  }, {})

  return Object.entries(grouped)
    .slice(0, 5) // 최대 5일
    .map(([date, items]): ForecastDay => {
      // 정오(12:00:00 UTC) 데이터 우선, 없으면 첫 번째 항목
      const noonItem =
        items.find((i) => i.dt_txt.includes('12:00:00')) ?? items[0]

      return {
        date,
        tempMin: Math.round(Math.min(...items.map((i) => i.main.temp_min)) * 10) / 10,
        tempMax: Math.round(Math.max(...items.map((i) => i.main.temp_max)) * 10) / 10,
        description: noonItem.weather[0].description,
        icon: noonItem.weather[0].icon,
        pop: Math.max(...items.map((i) => i.pop)),
      }
    })
}
