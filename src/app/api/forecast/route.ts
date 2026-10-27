/**
 * GET /api/forecast?lat={lat}&lon={lon}
 *
 * 현재 위치의 5일 예보를 일별로 집계하여 반환한다.
 * 캐싱은 fetchForecast 함수 레벨의 'use cache' + cacheLife()로 처리한다.
 * (Next.js 16: 함수 레벨 캐싱이 route 레벨 revalidate보다 lat/lon 키별 캐싱에 적합)
 */

import { type NextRequest, NextResponse } from 'next/server'
import { fetchForecast } from '@/lib/weather-api'
import { resolveOWMLang } from '@/lib/i18n'
import { parseCoords } from '@/lib/coords'

export async function GET(request: NextRequest) {
  const url = new URL(request.url)
  const lang = resolveOWMLang(url.searchParams.get('lang'))

  // 1~3. 파라미터 존재 · 숫자 형식 · 범위 검증 (+ 캐시 적중을 위한 좌표 반올림)
  const parsed = parseCoords(url.searchParams)
  if (!parsed.ok) {
    return NextResponse.json({ error: parsed.error }, { status: 400 })
  }

  // 4. OpenWeatherMap API 호출
  try {
    const data = await fetchForecast(parsed.coords.lat, parsed.coords.lon, lang)
    return NextResponse.json(data)
  } catch (err) {
    console.error('[GET /api/forecast] Failed to fetch forecast data:', err)
    return NextResponse.json(
      { error: 'Failed to fetch forecast data' },
      { status: 500 }
    )
  }
}
