/**
 * GET /api/air?lat={lat}&lon={lon}
 *
 * 현재 위치의 대기질(AQI, PM2.5, PM10)을 반환한다.
 * 캐싱은 fetchAirQuality 함수 레벨의 'use cache' + cacheLife()로 처리한다.
 */

import { type NextRequest, NextResponse } from 'next/server'
import { fetchAirQuality } from '@/lib/weather-api'
import { parseCoords } from '@/lib/coords'

export async function GET(request: NextRequest) {
  const url = new URL(request.url)

  // 1~3. 파라미터 존재 · 숫자 형식 · 범위 검증 (+ 캐시 적중을 위한 좌표 반올림)
  const parsed = parseCoords(url.searchParams)
  if (!parsed.ok) {
    return NextResponse.json({ error: parsed.error }, { status: 400 })
  }

  // 4. OpenWeatherMap API 호출
  try {
    const data = await fetchAirQuality(parsed.coords.lat, parsed.coords.lon)
    return NextResponse.json(data)
  } catch (err) {
    console.error('[GET /api/air] Failed to fetch air quality data:', err)
    return NextResponse.json(
      { error: 'Failed to fetch air quality data' },
      { status: 500 }
    )
  }
}
