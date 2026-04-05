import { WeatherIcon } from '@/components/WeatherIcon';
import type { WeatherResponse } from '@/lib/types';

interface WeatherCardProps {
  weather: WeatherResponse;
}

// 풍향 도(degree)를 16방위 문자열로 변환
function getWindDirection(deg: number): string {
  const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
  const index = Math.round(deg / 22.5) % 16;
  return directions[index];
}

export function WeatherCard({ weather }: WeatherCardProps) {
  const { location, current } = weather;

  return (
    <article
      className="w-full rounded-3xl bg-white/20 dark:bg-black/20 backdrop-blur-md border border-white/30 dark:border-white/10 p-6 shadow-xl"
      data-testid="weather-card"
    >
      {/* 위치 정보 */}
      <header className="mb-4">
        <h2 className="text-xl font-semibold text-white drop-shadow">
          {location.city},{' '}
          <span className="text-white/70 text-base font-normal">{location.country}</span>
        </h2>
      </header>

      {/* 온도 + 아이콘 */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <p
            className="text-8xl font-bold text-white drop-shadow-lg leading-none"
            aria-label={`현재 온도 ${Math.round(current.temp)}도`}
          >
            {Math.round(current.temp)}
            <span className="text-4xl font-light align-top mt-2 inline-block">°C</span>
          </p>
          <p className="mt-2 text-white/80 text-base capitalize">{current.description}</p>
        </div>
        <div className="shrink-0" aria-hidden="true">
          <WeatherIcon icon={current.icon} description={current.description} size={96} />
        </div>
      </div>

      {/* 세부 정보 그리드 */}
      <dl className="grid grid-cols-3 gap-3">
        <div className="flex flex-col items-center rounded-2xl bg-white/10 dark:bg-black/10 p-3">
          <dt className="text-xs text-white/60 mb-1">체감온도</dt>
          <dd className="text-lg font-semibold text-white">{Math.round(current.feelsLike)}°C</dd>
        </div>
        <div className="flex flex-col items-center rounded-2xl bg-white/10 dark:bg-black/10 p-3">
          <dt className="text-xs text-white/60 mb-1">습도</dt>
          <dd className="text-lg font-semibold text-white">{current.humidity}%</dd>
        </div>
        <div className="flex flex-col items-center rounded-2xl bg-white/10 dark:bg-black/10 p-3">
          <dt className="text-xs text-white/60 mb-1">풍속</dt>
          <dd className="text-lg font-semibold text-white">
            {current.windSpeed.toFixed(1)}
            <span className="text-xs font-normal ml-0.5">m/s</span>
          </dd>
          <dd className="text-xs text-white/60">{getWindDirection(current.windDeg)}</dd>
        </div>
      </dl>
    </article>
  );
}
