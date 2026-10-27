/**
 * GET /api/weather?lat={lat}&lon={lon}
 *
 * 현재 위치의 실시간 날씨 정보를 반환한다.
 * 캐싱은 fetchCurrentWeather 함수 레벨의 'use cache' + cacheLife()로 처리한다.
 * (Next.js 16: 함수 레벨 캐싱이 route 레벨 revalidate보다 lat/lon 키별 캐싱에 적합)
 */

import { type NextRequest, NextResponse } from 'next/server'
import { fetchCurrentWeather } from '@/lib/weather-api'
import { resolveOWMLang } from '@/lib/i18n'
import { parseCoords } from '@/lib/coords'

export async function GET(request: NextRequest) {
  // Next.js 16: Route Handler에서 URL 파라미터는 request.url로 파싱한다.
  // request.nextUrl.searchParams는 동기적이나 Next.js 16 비동기 API 패턴과
  // 일관성을 유지하기 위해 URL 생성자를 사용한다.
  const url = new URL(request.url)
  const lang = resolveOWMLang(url.searchParams.get('lang'))

  // 1~3. 파라미터 존재 · 숫자 형식 · 범위 검증 (+ 캐시 적중을 위한 좌표 반올림)
  const parsed = parseCoords(url.searchParams)
  if (!parsed.ok) {
    return NextResponse.json({ error: parsed.error }, { status: 400 })
  }

  // 4. OpenWeatherMap API 호출
  try {
    const data = await fetchCurrentWeather(parsed.coords.lat, parsed.coords.lon, lang)
    return NextResponse.json(data)
  } catch (err) {
    console.error('[GET /api/weather] Failed to fetch weather data:', err)
    return NextResponse.json(
      { error: 'Failed to fetch weather data' },
      { status: 500 }
    )
  }
}
