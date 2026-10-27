/**
 * GET /api/geocode?q={query}&lang={lang}
 *
 * 도시 이름으로 위치를 검색한다 (위치 직접 선택용).
 * 캐싱은 searchLocations 함수 레벨의 'use cache' + cacheLife()로 처리한다.
 */

import { type NextRequest, NextResponse } from 'next/server'
import { searchLocations } from '@/lib/weather-api'
import { resolveOWMLang } from '@/lib/i18n'
import { parseQuery } from '@/lib/geocode'

export async function GET(request: NextRequest) {
  const url = new URL(request.url)
  const lang = resolveOWMLang(url.searchParams.get('lang'))

  // 1. 검색어 존재 · 길이 검증
  const parsed = parseQuery(url.searchParams)
  if (!parsed.ok) {
    return NextResponse.json({ error: parsed.error }, { status: 400 })
  }

  // 2. OpenWeatherMap Geocoding API 호출
  try {
    const data = await searchLocations(parsed.query, lang)
    return NextResponse.json(data)
  } catch (err) {
    console.error('[GET /api/geocode] Failed to search locations:', err)
    return NextResponse.json(
      { error: 'Failed to search locations' },
      { status: 500 }
    )
  }
}
