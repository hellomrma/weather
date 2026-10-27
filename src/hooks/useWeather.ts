'use client';

import { useState, useEffect, useCallback } from 'react';
import type { WeatherState, WeatherErrorCode, WeatherResponse, ForecastResponse } from '@/lib/types';

export interface UseWeatherResult extends WeatherState {
  /** 위치 재요청 없이 API만 다시 호출한다 */
  refetch: () => void;
}

class WeatherFetchError extends Error {
  constructor(readonly code: WeatherErrorCode) {
    super(code);
  }
}

export function useWeather(lat: number, lon: number, lang: string = 'kr'): UseWeatherResult {
  const [state, setState] = useState<WeatherState>({
    weather: null,
    forecast: null,
    loading: true,
    error: null,
  });
  const [reloadKey, setReloadKey] = useState(0);
  const refetch = useCallback(() => setReloadKey((k) => k + 1), []);

  useEffect(() => {
    // lat, lon이 유효한 숫자인지 확인
    if (!isFinite(lat) || !isFinite(lon)) {
      return;
    }

    let cancelled = false;

    const fetchWeatherData = async () => {
      setState((prev) => ({ ...prev, loading: true, error: null }));

      try {
        // /api/weather와 /api/forecast를 병렬로 호출 (async-parallel 규칙)
        const [weatherRes, forecastRes] = await Promise.all([
          fetch(`/api/weather?lat=${lat}&lon=${lon}&lang=${lang}`),
          fetch(`/api/forecast?lat=${lat}&lon=${lon}&lang=${lang}`),
        ]);

        if (!weatherRes.ok) throw new WeatherFetchError('weather');
        if (!forecastRes.ok) throw new WeatherFetchError('forecast');

        const [weather, forecast]: [WeatherResponse, ForecastResponse] = await Promise.all([
          weatherRes.json(),
          forecastRes.json(),
        ]);

        if (!cancelled) {
          setState({ weather, forecast, loading: false, error: null });
        }
      } catch (err) {
        if (!cancelled) {
          // 이전 데이터는 유지한다 — 재시도 실패 시 빈 화면 대신 마지막 데이터를 보여준다
          setState((prev) => ({
            ...prev,
            loading: false,
            error: err instanceof WeatherFetchError ? err.code : 'network',
          }));
        }
      }
    };

    fetchWeatherData();

    return () => {
      cancelled = true;
    };
  }, [lat, lon, lang, reloadKey]);

  return { ...state, refetch };
}
