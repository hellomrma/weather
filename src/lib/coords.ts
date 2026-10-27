/**
 * coords.ts — Route Handler 공용 lat/lon 쿼리 파라미터 검증
 */

export interface Coords {
  lat: number;
  lon: number;
}

export type CoordsResult = { ok: true; coords: Coords } | { ok: false; error: string };

/**
 * 좌표를 소수 2자리(약 1km)로 반올림한다.
 * 'use cache' 캐시 키가 좌표 단위로 생성되므로, 반올림하지 않으면 사용자마다
 * 키가 달라져 캐시가 재사용되지 않고 OWM 호출 한도를 빠르게 소진한다.
 */
function roundCoord(value: number): number {
  return Math.round(value * 100) / 100;
}

/** 존재 여부 → 숫자 형식 → 범위 순서로 검증하고, 통과하면 반올림된 좌표를 반환한다. */
export function parseCoords(params: URLSearchParams): CoordsResult {
  const lat = params.get('lat');
  const lon = params.get('lon');

  if (!lat || !lon) {
    return { ok: false, error: 'lat and lon query parameters are required' };
  }

  const latNum = parseFloat(lat);
  const lonNum = parseFloat(lon);
  if (isNaN(latNum) || isNaN(lonNum)) {
    return { ok: false, error: 'lat and lon must be valid numbers' };
  }

  if (latNum < -90 || latNum > 90) {
    return { ok: false, error: 'lat must be between -90 and 90' };
  }
  if (lonNum < -180 || lonNum > 180) {
    return { ok: false, error: 'lon must be between -180 and 180' };
  }

  return { ok: true, coords: { lat: roundCoord(latNum), lon: roundCoord(lonNum) } };
}
