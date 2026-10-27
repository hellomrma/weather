'use client';

import { useState, useEffect } from 'react';
import type { AirQualityResponse } from '@/lib/types';

/**
 * 대기질은 보조 정보이므로 실패해도 에러 상태를 노출하지 않고 null을 반환한다.
 * (날씨/예보 표시에 영향을 주지 않도록 useWeather와 분리)
 */
export function useAirQuality(lat: number, lon: number): AirQualityResponse | null {
  const [air, setAir] = useState<AirQualityResponse | null>(null);

  useEffect(() => {
    if (!isFinite(lat) || !isFinite(lon)) {
      return;
    }

    let cancelled = false;

    fetch(`/api/air?lat=${lat}&lon=${lon}`)
      .then((res) => (res.ok ? (res.json() as Promise<AirQualityResponse>) : null))
      .catch(() => null)
      .then((data) => {
        if (!cancelled && data) setAir(data);
      });

    return () => {
      cancelled = true;
    };
  }, [lat, lon]);

  return air;
}
