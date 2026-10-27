/**
 * forecast.ts — OWM 3시간 간격 예보 집계 (순수 함수)
 *
 * weather-api.ts(server-only)에서 사용한다. 테스트를 위해 별도 모듈로 분리했다.
 */

import type { ForecastDay, ForecastHour, OWMForecastItem } from '@/lib/types';

/** UTC 타임스탬프(초)를 지역 오프셋(초)만큼 이동한 Date. getUTC* 메서드로 현지 시각을 읽는다. */
function toLocalDate(dt: number, timezoneOffset: number): Date {
  return new Date((dt + timezoneOffset) * 1000);
}

/**
 * OWM 3시간 간격 예보 목록을 현지 날짜별로 집계하여 일별 ForecastDay 배열로 변환한다.
 *
 * 집계 규칙:
 * - 날짜 기준: dt + city.timezone 으로 계산한 현지 날짜 (dt_txt는 UTC이므로 사용하지 않음)
 * - tempMax / tempMin: 그룹 내 최댓값 / 최솟값
 * - description / icon: 현지 정오(12시)에 가장 가까운 항목
 * - pop: 그룹 내 최댓값
 * - 최대 5일 반환
 */
export function aggregateForecast(
  list: OWMForecastItem[],
  timezoneOffset: number
): ForecastDay[] {
  const grouped = new Map<string, { item: OWMForecastItem; hour: number }[]>();
  for (const item of list) {
    const local = toLocalDate(item.dt, timezoneOffset);
    const date = local.toISOString().slice(0, 10); // "YYYY-MM-DD"
    const group = grouped.get(date) ?? [];
    group.push({ item, hour: local.getUTCHours() });
    grouped.set(date, group);
  }

  return Array.from(grouped.entries())
    .slice(0, 5)
    .map(([date, entries]): ForecastDay => {
      const items = entries.map((e) => e.item);
      const noon = entries.reduce((best, e) =>
        Math.abs(e.hour - 12) < Math.abs(best.hour - 12) ? e : best
      ).item;

      return {
        date,
        tempMin: Math.round(Math.min(...items.map((i) => i.main.temp_min)) * 10) / 10,
        tempMax: Math.round(Math.max(...items.map((i) => i.main.temp_max)) * 10) / 10,
        description: noon.weather[0].description,
        icon: noon.weather[0].icon,
        pop: Math.max(...items.map((i) => i.pop)),
      };
    });
}

/** 3시간 간격 예보 앞쪽 count개(기본 8개 = 24시간)를 현지 시각과 함께 반환한다. */
export function buildHourly(
  list: OWMForecastItem[],
  timezoneOffset: number,
  count: number = 8
): ForecastHour[] {
  return list.slice(0, count).map((item) => ({
    dt: item.dt,
    hour: toLocalDate(item.dt, timezoneOffset).getUTCHours(),
    temp: Math.round(item.main.temp * 10) / 10,
    description: item.weather[0].description,
    icon: item.weather[0].icon,
    pop: item.pop,
  }));
}
