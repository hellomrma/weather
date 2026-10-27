import { useLocale } from '@/lib/locale-context';
import { WeatherIcon } from '@/components/WeatherIcon';
import type { ForecastHour } from '@/lib/types';

interface HourlyForecastProps {
  hourly: ForecastHour[];
}

// 현지 시각(0-23)을 로케일 형식으로 변환 (예: "오후 3시", "3 PM")
function formatHour(hour: number, locale: string): string {
  return new Date(Date.UTC(2000, 0, 1, hour)).toLocaleTimeString(locale, {
    hour: 'numeric',
    timeZone: 'UTC',
  });
}

export function HourlyForecast({ hourly }: HourlyForecastProps) {
  const { t, dateLocale } = useLocale();

  if (hourly.length === 0) {
    return null;
  }

  return (
    <section aria-label={t.hourlyTitle} data-testid="hourly-forecast">
      <h3 className="text-sm font-semibold text-white/70 uppercase tracking-wider mb-3 px-1">
        {t.hourlyTitle}
      </h3>
      <ul className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide rounded-2xl bg-white/20 dark:bg-black/20 backdrop-blur-sm border border-white/30 dark:border-white/10 p-3">
        {hourly.map((item) => {
          const popPercent = Math.round(item.pop * 100);
          return (
            <li key={item.dt} className="shrink-0 flex flex-col items-center min-w-14">
              <span className="text-xs text-white/70">{formatHour(item.hour, dateLocale)}</span>
              <div aria-hidden="true">
                <WeatherIcon icon={item.icon} description={item.description} size={40} />
              </div>
              <span
                className="text-sm font-semibold text-white"
                aria-label={t.currentTempAriaLabel(Math.round(item.temp))}
              >
                {Math.round(item.temp)}°
              </span>
              <span
                className="text-[10px] text-sky-200 h-3"
                aria-label={popPercent > 0 ? t.precipAriaLabel(popPercent) : undefined}
              >
                {popPercent > 0 ? `${popPercent}%` : ''}
              </span>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
