'use client';

import { Suspense, useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useGeolocation } from '@/hooks/useGeolocation';
import { useWeather } from '@/hooks/useWeather';
import { WeatherCard } from '@/components/WeatherCard';
import { ForecastList } from '@/components/ForecastList';
import { LocationStatus } from '@/components/LocationStatus';
import { MOCK_WEATHER, MOCK_FORECAST } from '@/lib/mock-data';
import { WeatherBackground } from '@/components/WeatherBackground';
import { LocaleProvider, useLocale } from '@/lib/locale-context';

// 현재 시각 표시 훅
// 마운트 후에만 활성화하여 서버/클라이언트 hydration 불일치 방지
function useCurrentTime(dateLocale: string): string {
  const [time, setTime] = useState('');

  useEffect(() => {
    const format = () =>
      new Date().toLocaleTimeString(dateLocale, { hour: '2-digit', minute: '2-digit' });

    const initialTimer = window.setTimeout(() => setTime(format()), 0);
    const timer = setInterval(() => setTime(format()), 60_000);

    return () => {
      window.clearTimeout(initialTimer);
      clearInterval(timer);
    };
  }, [dateLocale]);

  return time;
}

// 스켈레톤 로딩 UI
function WeatherSkeleton() {
  const { t } = useLocale();
  return (
    <div className="animate-pulse space-y-4" aria-label={t.weatherLoadingAria} role="status">
      <div className="rounded-3xl bg-white/20 p-6 space-y-4">
        <div className="h-5 w-32 bg-white/30 rounded-full" />
        <div className="h-20 w-40 bg-white/30 rounded-2xl" />
        <div className="grid grid-cols-3 gap-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-16 bg-white/20 rounded-2xl" />
          ))}
        </div>
      </div>
      <div className="rounded-2xl bg-white/10 p-4">
        <div className="h-4 w-16 bg-white/30 rounded-full mb-3" />
        <div className="flex gap-3">
          {[0, 1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 w-20 bg-white/20 rounded-2xl shrink-0" />
          ))}
        </div>
      </div>
    </div>
  );
}

// 에러 UI
interface ErrorViewProps {
  message: string;
  onRetry: () => void;
}

function ErrorView({ message, onRetry }: ErrorViewProps) {
  const { t } = useLocale();
  return (
    <div
      className="flex flex-col items-center gap-4 py-12 text-center"
      role="alert"
      data-testid="error-view"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="currentColor"
        className="w-12 h-12 text-white/50"
        aria-hidden="true"
      >
        <path
          fillRule="evenodd"
          d="M9.401 3.003c1.155-2 4.043-2 5.197 0l7.355 12.748c1.154 2-.29 4.5-2.599 4.5H4.645c-2.309 0-3.752-2.5-2.598-4.5L9.4 3.003zM12 8.25a.75.75 0 01.75.75v3.75a.75.75 0 01-1.5 0V9a.75.75 0 01.75-.75zm0 8.25a.75.75 0 100-1.5.75.75 0 000 1.5z"
          clipRule="evenodd"
        />
      </svg>
      <p className="text-white/80 text-base">{message}</p>
      <button
        type="button"
        onClick={onRetry}
        className="px-5 py-2 rounded-full bg-white/20 hover:bg-white/30 active:bg-white/40 text-white text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-white"
      >
        {t.retry}
      </button>
    </div>
  );
}

function HomePageContent() {
  const searchParams = useSearchParams();
  const isDemo = searchParams.get('demo') === 'true';
  const { lat, lon, loading: geoLoading, error: geoError, permission } = useGeolocation();
  const { t, dateLocale, owmLang } = useLocale();
  const realWeatherState = useWeather(isDemo ? NaN : lat, isDemo ? NaN : lon, owmLang);
  const currentTime = useCurrentTime(dateLocale);

  const weather = isDemo ? MOCK_WEATHER : realWeatherState.weather;
  const forecast = isDemo ? MOCK_FORECAST : realWeatherState.forecast;
  const weatherError = isDemo ? null : realWeatherState.error;

  // 전체 로딩: 위치 로딩 또는 날씨 데이터 로딩 중
  const isLoading = isDemo ? false : (geoLoading || realWeatherState.loading);

  // 재시도: 페이지 새로고침
  const handleRetry = () => window.location.reload();

  return (
    <div className="relative min-h-screen">
      <WeatherBackground
        condition={weather?.current.condition}
        icon={weather?.current.icon}
      />
      <div className="relative z-10 min-h-screen flex flex-col items-center px-4 py-8">
        {/* 헤더 */}
        <header className="w-full max-w-md flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-white tracking-tight drop-shadow">
            {t.appTitle}
          </h1>
          {currentTime && (
            <time
              className="text-white/60 text-sm tabular-nums"
              aria-label={t.currentTimeAriaLabel(currentTime)}
            >
              {currentTime}
            </time>
          )}
        </header>

        {/* 데모 모드 배너 */}
        {isDemo && (
          <div className="w-full max-w-md mb-2 px-3 py-1.5 rounded-full bg-yellow-400/20 border border-yellow-300/30 text-yellow-100 text-xs text-center">
            {t.demoModeBanner}
          </div>
        )}

        {/* 위치 상태 */}
        <div className="w-full max-w-md mb-4">
          <LocationStatus
            permission={isDemo ? 'granted' : (geoLoading ? 'loading' : permission)}
            city={weather?.location.city}
            error={isDemo ? null : geoError}
          />
        </div>

        {/* 본문 */}
        <main className="w-full max-w-md flex flex-col gap-4 animate-fade-in">
          {isLoading ? (
            <WeatherSkeleton />
          ) : weatherError ? (
            <ErrorView message={weatherError} onRetry={handleRetry} />
          ) : weather && forecast ? (
            <>
              <WeatherCard weather={weather} />
              <ForecastList daily={forecast.daily} />
            </>
          ) : null}
        </main>
      </div>
    </div>
  );
}

export function HomePageClient() {
  return (
    <LocaleProvider>
      <Suspense fallback={null}>
        <HomePageContent />
      </Suspense>
    </LocaleProvider>
  );
}
