'use client';

import { useCallback, useMemo, useSyncExternalStore } from 'react';
import type { GeocodeResult } from '@/lib/types';

const STORAGE_KEY = 'weather-now:location';

// 같은 탭 내 변경 알림용 (storage 이벤트는 다른 탭에서만 발생)
const listeners = new Set<() => void>();

function subscribe(callback: () => void): () => void {
  listeners.add(callback);
  window.addEventListener('storage', callback);
  return () => {
    listeners.delete(callback);
    window.removeEventListener('storage', callback);
  };
}

// 시크릿 모드·저장소 차단 시 접근 자체가 throw 할 수 있다
function readRaw(): string | null {
  try {
    return window.localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

function writeRaw(value: string | null): void {
  try {
    if (value === null) window.localStorage.removeItem(STORAGE_KEY);
    else window.localStorage.setItem(STORAGE_KEY, value);
  } catch {
    // 저장 실패 시에도 현재 세션 동작에는 영향 없음
  }
  listeners.forEach((listener) => listener());
}

/** 손상되었거나 형식이 다른 값은 무시한다 */
export function parseSavedLocation(raw: string | null): GeocodeResult | null {
  if (!raw) return null;
  try {
    const value: unknown = JSON.parse(raw);
    if (
      typeof value === 'object' && value !== null &&
      'name' in value && typeof value.name === 'string' &&
      'country' in value && typeof value.country === 'string' &&
      'lat' in value && typeof value.lat === 'number' && Number.isFinite(value.lat) &&
      'lon' in value && typeof value.lon === 'number' && Number.isFinite(value.lon)
    ) {
      return { name: value.name, country: value.country, lat: value.lat, lon: value.lon };
    }
  } catch {
    // JSON 파싱 실패 — 무시
  }
  return null;
}

export interface UseSavedLocationResult {
  location: GeocodeResult | null;
  save: (location: GeocodeResult) => void;
  clear: () => void;
}

/** 사용자가 직접 선택한 위치 (localStorage에 유지) */
export function useSavedLocation(): UseSavedLocationResult {
  const raw = useSyncExternalStore(subscribe, readRaw, () => null);
  const location = useMemo(() => parseSavedLocation(raw), [raw]);

  const save = useCallback((value: GeocodeResult) => {
    const { name, country, lat, lon } = value;
    writeRaw(JSON.stringify({ name, country, lat, lon }));
  }, []);
  const clear = useCallback(() => writeRaw(null), []);

  return { location, save, clear };
}
