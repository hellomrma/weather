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
  AirQualityResponse,
  OWMCurrentWeatherResponse,
  OWMForecastResponse,
  OWMAirPollutionResponse,
} from '@/lib/types'
import { aggregateForecast, buildHourly } from '@/lib/forecast'

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
  return {
    daily: aggregateForecast(raw.list, raw.city.timezone),
    hourly: buildHourly(raw.list, raw.city.timezone),
  }
}

// =============================================================================
// 대기질 조회
// =============================================================================

/**
 * OpenWeatherMap Air Pollution API를 호출하여 현재 대기질을 반환한다.
 *
 * @param lat 위도 (-90 ~ 90)
 * @param lon 경도 (-180 ~ 180)
 */
export async function fetchAirQuality(
  lat: number,
  lon: number
): Promise<AirQualityResponse> {
  'use cache'
  // 대기질: 관측값이 1시간 단위로 갱신되므로 30분마다 재검증
  cacheLife({ stale: 600, revalidate: 1800, expire: 3600 })

  const apiKey = getApiKey()
  const url = `${OWM_BASE_URL}/air_pollution?lat=${lat}&lon=${lon}&appid=${apiKey}`

  let res: Response
  try {
    res = await fetch(url)
  } catch (err) {
    console.error('[weather-api] Network error calling OWM /air_pollution:', err)
    throw new Error('Failed to fetch air quality data: network error')
  }

  if (!res.ok) {
    const body = await res.text().catch(() => '')
    console.error(
      `[weather-api] OWM /air_pollution responded ${res.status}: ${body}`
    )
    throw new Error(`Failed to fetch air quality data: OWM returned ${res.status}`)
  }

  const raw: OWMAirPollutionResponse = await res.json()
  const entry = raw.list[0]
  if (!entry) {
    throw new Error('Failed to fetch air quality data: empty response')
  }
  return {
    aqi: entry.main.aqi,
    pm25: Math.round(entry.components.pm2_5),
    pm10: Math.round(entry.components.pm10),
  }
}
