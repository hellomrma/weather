import type { LocationPermission } from '@/lib/types';

interface LocationStatusProps {
  permission: LocationPermission;
  city?: string;
  error?: string | null;
}

export function LocationStatus({ permission, city, error }: LocationStatusProps) {
  if (permission === 'loading') {
    return (
      <div
        className="flex items-center gap-2 text-white/70 text-sm"
        role="status"
        aria-live="polite"
        data-testid="location-loading"
      >
        {/* 스피너 */}
        <span
          className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"
          aria-hidden="true"
        />
        <span>위치 확인 중...</span>
      </div>
    );
  }

  if (permission === 'denied' || error) {
    return (
      <div
        className="flex flex-col gap-1"
        role="alert"
        data-testid="location-error"
      >
        <div className="flex items-center gap-2 text-amber-200 text-sm">
          {/* 경고 아이콘 */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="w-4 h-4 shrink-0"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z"
              clipRule="evenodd"
            />
          </svg>
          <span>{error ?? '위치 권한이 거부되었습니다.'}</span>
        </div>
        <p className="text-white/50 text-xs pl-6">
          서울 날씨를 표시합니다. 정확한 위치 날씨를 보려면 브라우저 설정에서 위치 권한을 허용해주세요.
        </p>
      </div>
    );
  }

  if (permission === 'granted' && city) {
    return (
      <div
        className="flex items-center gap-2 text-white/70 text-sm"
        data-testid="location-granted"
      >
        {/* 위치 핀 아이콘 */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          className="w-4 h-4 text-white/50 shrink-0"
          aria-hidden="true"
        >
          <path
            fillRule="evenodd"
            d="M9.69 18.933l.003.001C9.89 19.02 10 19 10 19s.11.02.308-.066l.002-.001.006-.003.018-.008a5.741 5.741 0 00.281-.14c.186-.096.446-.24.757-.433.62-.384 1.445-.966 2.274-1.765C15.302 14.988 17 12.493 17 9A7 7 0 103 9c0 3.492 1.698 5.988 3.355 7.584a13.731 13.731 0 002.273 1.765 11.842 11.842 0 00.976.544l.062.029.018.008.006.003zM10 11.25a2.25 2.25 0 100-4.5 2.25 2.25 0 000 4.5z"
            clipRule="evenodd"
          />
        </svg>
        <span>현재 위치: {city}</span>
      </div>
    );
  }

  return null;
}
