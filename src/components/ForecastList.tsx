import { WeatherIcon } from '@/components/WeatherIcon';
import type { ForecastDay } from '@/lib/types';

interface ForecastListProps {
  daily: ForecastDay[];
}

// ISO 날짜 문자열(YYYY-MM-DD)을 한국어 요일로 변환
function formatDate(dateStr: string): { weekday: string; month: string; day: string } {
  const date = new Date(dateStr + 'T12:00:00'); // 정오 기준 파싱 (타임존 문제 방지)
  const weekday = date.toLocaleDateString('ko-KR', { weekday: 'short' });
  const month = date.toLocaleDateString('ko-KR', { month: 'numeric' });
  const day = date.toLocaleDateString('ko-KR', { day: 'numeric' });
  return { weekday, month, day };
}

interface ForecastItemProps {
  item: ForecastDay;
}

function ForecastItem({ item }: ForecastItemProps) {
  const { weekday, month, day } = formatDate(item.date);
  const popPercent = Math.round(item.pop * 100);

  return (
    <li
      className="flex-shrink-0 flex flex-col items-center rounded-2xl bg-white/20 dark:bg-black/20 backdrop-blur-sm border border-white/30 dark:border-white/10 p-4 min-w-[90px] sm:min-w-0 sm:flex-1"
      data-testid="forecast-item"
    >
      {/* 날짜 */}
      <time
        dateTime={item.date}
        className="text-xs font-semibold text-white/80 mb-1"
      >
        {weekday}
      </time>
      <span className="text-xs text-white/50 mb-2">
        {month}{day}
      </span>

      {/* 아이콘 */}
      <div aria-hidden="true">
        <WeatherIcon icon={item.icon} description={item.description} size={48} />
      </div>

      {/* 강수 확률 */}
      {popPercent > 0 && (
        <p className="text-xs text-sky-200 font-medium mt-1" aria-label={`강수 확률 ${popPercent}%`}>
          {popPercent}%
        </p>
      )}

      {/* 온도 */}
      <div className="mt-2 flex flex-col items-center gap-0.5">
        <span
          className="text-sm font-bold text-white"
          aria-label={`최고 기온 ${Math.round(item.tempMax)}도`}
        >
          {Math.round(item.tempMax)}°
        </span>
        <span
          className="text-xs text-white/50"
          aria-label={`최저 기온 ${Math.round(item.tempMin)}도`}
        >
          {Math.round(item.tempMin)}°
        </span>
      </div>
    </li>
  );
}

export function ForecastList({ daily }: ForecastListProps) {
  if (daily.length === 0) {
    return null;
  }

  return (
    <section aria-label="5일 예보" data-testid="forecast-list">
      <h3 className="text-sm font-semibold text-white/70 uppercase tracking-wider mb-3 px-1">
        5일 예보
      </h3>
      {/* 모바일: 수평 스크롤 / sm 이상: 그리드 */}
      <ul className="flex gap-3 overflow-x-auto pb-2 sm:grid sm:grid-cols-5 sm:overflow-visible sm:pb-0 scrollbar-hide">
        {daily.map((item) => (
          <ForecastItem key={item.date} item={item} />
        ))}
      </ul>
    </section>
  );
}
