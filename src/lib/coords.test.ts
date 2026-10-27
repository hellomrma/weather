import { describe, expect, it } from 'vitest'
import { parseCoords } from '@/lib/coords'

const parse = (query: string) => parseCoords(new URLSearchParams(query))

describe('parseCoords', () => {
  it('rounds coordinates to 2 decimals so nearby users share a cache key', () => {
    expect(parse('lat=37.566535&lon=126.977969')).toEqual({
      ok: true,
      coords: { lat: 37.57, lon: 126.98 },
    })
  })

  it.each([
    ['', 'lat and lon query parameters are required'],
    ['lat=abc&lon=1', 'lat and lon must be valid numbers'],
    ['lat=91&lon=0', 'lat must be between -90 and 90'],
    ['lat=0&lon=-181', 'lon must be between -180 and 180'],
  ])('rejects %j', (query, error) => {
    expect(parse(query)).toEqual({ ok: false, error })
  })
})
