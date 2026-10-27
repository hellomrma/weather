import { describe, expect, it } from 'vitest'
import { aggregateForecast, buildHourly } from '@/lib/forecast'
import type { OWMForecastItem } from '@/lib/types'

const KST = 9 * 3600

function item(utc: string, temp: number, icon: string, pop = 0): OWMForecastItem {
  const dt = Date.parse(`${utc}Z`) / 1000
  return {
    dt,
    dt_txt: utc.replace('T', ' '),
    main: { temp, feels_like: temp, humidity: 50, temp_min: temp, temp_max: temp },
    weather: [{ id: 800, main: 'Clear', description: icon, icon }],
    wind: { speed: 1, deg: 0 },
    pop,
  }
}

describe('aggregateForecast', () => {
  it('groups by local date using the city timezone offset, not UTC', () => {
    // UTC 2026-04-05 15:00 = KST 2026-04-06 00:00 → 4월 6일로 묶여야 한다
    const list = [
      item('2026-04-05T12:00:00', 10, '01n'), // KST 04-05 21:00
      item('2026-04-05T15:00:00', 5, '01n'), // KST 04-06 00:00
      item('2026-04-06T03:00:00', 20, '01d'), // KST 04-06 12:00
    ]
    const days = aggregateForecast(list, KST)

    expect(days.map((d) => d.date)).toEqual(['2026-04-05', '2026-04-06'])
    expect(days[1]).toMatchObject({ tempMin: 5, tempMax: 20 })
  })

  it('picks the item closest to local noon as the representative icon', () => {
    // UTC 12:00 은 KST 21:00(밤) — 기존 로직은 이 항목을 골라 밤 아이콘이 표시됐다
    const list = [
      item('2026-04-06T00:00:00', 15, '02d'), // KST 09:00
      item('2026-04-06T03:00:00', 18, '01d'), // KST 12:00
      item('2026-04-06T12:00:00', 12, '01n'), // KST 21:00
    ]
    expect(aggregateForecast(list, KST)[0].icon).toBe('01d')
  })

  it('uses the max pop of the day and returns at most 5 days', () => {
    const list = Array.from({ length: 7 * 8 }, (_, i) =>
      item(new Date(Date.UTC(2026, 3, 6) + i * 3 * 3600 * 1000).toISOString().slice(0, 19), 10, '01d', i % 8 === 4 ? 0.7 : 0.1)
    )
    const days = aggregateForecast(list, 0)

    expect(days).toHaveLength(5)
    expect(days.every((d) => d.pop === 0.7)).toBe(true)
  })
})

describe('buildHourly', () => {
  it('returns the next 8 slots with local hours', () => {
    const list = Array.from({ length: 10 }, (_, i) =>
      item(new Date(Date.UTC(2026, 3, 6) + i * 3 * 3600 * 1000).toISOString().slice(0, 19), 10 + i, '01d')
    )
    const hourly = buildHourly(list, KST)

    expect(hourly).toHaveLength(8)
    expect(hourly.map((h) => h.hour)).toEqual([9, 12, 15, 18, 21, 0, 3, 6])
  })
})
