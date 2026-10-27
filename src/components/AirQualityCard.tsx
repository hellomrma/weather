import { useLocale } from '@/lib/locale-context';
import type { AirQualityResponse, AQILevel } from '@/lib/types';

interface AirQualityCardProps {
  air: AirQualityResponse;
}

// AQI 단계별 표시 색상
const AQI_COLORS: Record<AQILevel, string> = {
  1: 'bg-emerald-400',
  2: 'bg-lime-400',
  3: 'bg-yellow-400',
  4: 'bg-orange-500',
  5: 'bg-red-500',
};

export function AirQualityCard({ air }: AirQualityCardProps) {
  const { t } = useLocale();

  return (
    <section
      aria-label={t.airQualityTitle}
      className="rounded-2xl bg-white/20 dark:bg-black/20 backdrop-blur-sm border border-white/30 dark:border-white/10 p-4"
      data-testid="air-quality-card"
    >
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-white/70 uppercase tracking-wider">
          {t.airQualityTitle}
        </h3>
        <span className="flex items-center gap-2 text-sm font-semibold text-white">
          <span className={`w-2.5 h-2.5 rounded-full ${AQI_COLORS[air.aqi]}`} aria-hidden="true" />
          {t.aqiLevels[air.aqi]}
        </span>
      </div>
      <dl className="mt-3 grid grid-cols-2 gap-3">
        <div className="flex flex-col items-center rounded-2xl bg-white/10 dark:bg-black/10 p-3">
          <dt className="text-xs text-white/60 mb-1">{t.pm25}</dt>
          <dd className="text-lg font-semibold text-white">
            {air.pm25}
            <span className="text-xs font-normal ml-0.5">μg/m³</span>
          </dd>
        </div>
        <div className="flex flex-col items-center rounded-2xl bg-white/10 dark:bg-black/10 p-3">
          <dt className="text-xs text-white/60 mb-1">{t.pm10}</dt>
          <dd className="text-lg font-semibold text-white">
            {air.pm10}
            <span className="text-xs font-normal ml-0.5">μg/m³</span>
          </dd>
        </div>
      </dl>
    </section>
  );
}
