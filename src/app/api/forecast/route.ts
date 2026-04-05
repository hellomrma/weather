/**
 * GET /api/forecast?lat={lat}&lon={lon}
 *
 * 현재 위치의 5일 예보를 일별로 집계하여 반환한다.
 * 캐싱은 fetchForecast 함수 레벨의 'use cache' + cacheLife()로 처리한다.
 * (Next.js 16: 함수 레벨 캐싱이 route 레벨 revalidate보다 lat/lon 키별 캐싱에 적합)
 */

import { type NextRequest, NextResponse } from 'next/server'
import { fetchForecast } from '@/lib/weather-api'

export async function GET(request: NextRequest) {
  const url = new URL(request.url)
  const lat = url.searchParams.get('lat')
  const lon = url.searchParams.get('lon')

  // 1. 파라미터 존재 검증
  if (!lat || !lon) {
    return NextResponse.json(
      { error: 'lat and lon query parameters are required' },
      { status: 400 }
    )
  }

  // 2. 숫자 형식 검증
  const latNum = parseFloat(lat)
  const lonNum = parseFloat(lon)
  if (isNaN(latNum) || isNaN(lonNum)) {
    return NextResponse.json(
      { error: 'lat and lon must be valid numbers' },
      { status: 400 }
    )
  }

  // 3. 범위 검증 — 위도: -90 ~ 90, 경도: -180 ~ 180
  if (latNum < -90 || latNum > 90) {
    return NextResponse.json(
      { error: 'lat must be between -90 and 90' },
      { status: 400 }
    )
  }
  if (lonNum < -180 || lonNum > 180) {
    return NextResponse.json(
      { error: 'lon must be between -180 and 180' },
      { status: 400 }
    )
  }

  // 4. OpenWeatherMap API 호출
  try {
    const data = await fetchForecast(latNum, lonNum)
    return NextResponse.json(data)
  } catch (err) {
    console.error('[GET /api/forecast] Failed to fetch forecast data:', err)
    return NextResponse.json(
      { error: 'Failed to fetch forecast data' },
      { status: 500 }
    )
  }
}
