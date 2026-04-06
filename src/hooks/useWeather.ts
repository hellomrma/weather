'use client';

import { useState, useEffect } from 'react';
import type { WeatherState, WeatherResponse, ForecastResponse } from '@/lib/types';

export function useWeather(lat: number, lon: number, lang: string = 'kr'): WeatherState {
  const [state, setState] = useState<WeatherState>({
    weather: null,
    forecast: null,
    loading: true,
    error: null,
  });

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

        if (!weatherRes.ok) {
          const body = await weatherRes.json().catch(() => ({}));
          throw new Error(body.error ?? '날씨 데이터를 가져오지 못했습니다.');
        }
        if (!forecastRes.ok) {
          const body = await forecastRes.json().catch(() => ({}));
          throw new Error(body.error ?? '예보 데이터를 가져오지 못했습니다.');
        }

        const [weather, forecast]: [WeatherResponse, ForecastResponse] = await Promise.all([
          weatherRes.json(),
          forecastRes.json(),
        ]);

        if (!cancelled) {
          setState({ weather, forecast, loading: false, error: null });
        }
      } catch (err) {
        if (!cancelled) {
          setState({
            weather: null,
            forecast: null,
            loading: false,
            error: err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.',
          });
        }
      }
    };

    fetchWeatherData();

    return () => {
      cancelled = true;
    };
  }, [lat, lon, lang]);

  return state;
}
