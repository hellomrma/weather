import { describe, expect, it } from 'vitest'
import { mapGeocodeItem, parseQuery } from '@/lib/geocode'
import { parseSavedLocation } from '@/hooks/useSavedLocation'

describe('parseQuery', () => {
  it('trims the query', () => {
    expect(parseQuery(new URLSearchParams('q=%20성남%20'))).toEqual({ ok: true, query: '성남' })
  })

  it.each([
    ['', 'q query parameter is required'],
    ['q=%20%20', 'q query parameter is required'],
    [`q=${'a'.repeat(101)}`, 'q must be at most 100 characters'],
  ])('rejects %j', (query, error) => {
    expect(parseQuery(new URLSearchParams(query))).toEqual({ ok: false, error })
  })
})

describe('mapGeocodeItem', () => {
  const item = {
    name: 'Seongnam-si',
    local_names: { ko: '성남시', en: 'Seongnam' },
    lat: 37.42,
    lon: 127.13,
    country: 'KR',
  }

  it('uses the local name for the requested language', () => {
    expect(mapGeocodeItem(item, 'kr')).toEqual({ name: '성남시', country: 'KR', lat: 37.42, lon: 127.13 })
  })

  it('falls back to the default name when no local name exists', () => {
    expect(mapGeocodeItem(item, 'ja').name).toBe('Seongnam-si')
  })
})

describe('parseSavedLocation', () => {
  it('parses a valid saved location', () => {
    const raw = JSON.stringify({ name: '성남시', country: 'KR', lat: 37.42, lon: 127.13 })
    expect(parseSavedLocation(raw)).toEqual({ name: '성남시', country: 'KR', lat: 37.42, lon: 127.13 })
  })

  it.each([null, '', 'not json', '{"name":"x"}', '{"name":"x","country":"KR","lat":"1","lon":2}'])(
    'ignores invalid value %j',
    (raw) => {
      expect(parseSavedLocation(raw)).toBeNull()
    }
  )
})
