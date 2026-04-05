'use client';

import { useState, useEffect } from 'react';
import type { GeolocationState, LocationPermission } from '@/lib/types';

// 서울 기본 좌표 (위치 권한 거부 시 사용)
const SEOUL_DEFAULT = {
  lat: 37.5665,
  lon: 126.978,
};

export function useGeolocation(): GeolocationState {
  const [state, setState] = useState<GeolocationState>({
    lat: SEOUL_DEFAULT.lat,
    lon: SEOUL_DEFAULT.lon,
    loading: true,
    error: null,
    permission: 'loading',
  });

  useEffect(() => {
    // 브라우저가 Geolocation을 지원하지 않는 경우
    if (!navigator.geolocation) {
      const timer = window.setTimeout(() => {
        setState({
          lat: SEOUL_DEFAULT.lat,
          lon: SEOUL_DEFAULT.lon,
          loading: false,
          error: '이 브라우저는 위치 서비스를 지원하지 않습니다.',
          permission: 'denied',
        });
      }, 0);

      return () => window.clearTimeout(timer);
    }

    const onSuccess = (position: GeolocationPosition) => {
      setState({
        lat: position.coords.latitude,
        lon: position.coords.longitude,
        loading: false,
        error: null,
        permission: 'granted',
      });
    };

    const onError = (err: GeolocationPositionError) => {
      let errorMessage: string;
      let permission: LocationPermission;

      switch (err.code) {
        case GeolocationPositionError.PERMISSION_DENIED:
          errorMessage = '위치 권한이 거부되었습니다.';
          permission = 'denied';
          break;
        case GeolocationPositionError.POSITION_UNAVAILABLE:
          // 권한 거부가 아닌 기술적 오류 — permission은 'prompt' 유지
          errorMessage = '위치 정보를 가져올 수 없습니다.';
          permission = 'prompt';
          break;
        case GeolocationPositionError.TIMEOUT:
          // 권한 거부가 아닌 타임아웃 오류 — permission은 'prompt' 유지
          errorMessage = '위치 요청 시간이 초과되었습니다.';
          permission = 'prompt';
          break;
        default:
          errorMessage = '위치를 가져오는 중 오류가 발생했습니다.';
          permission = 'prompt';
      }

      setState({
        lat: SEOUL_DEFAULT.lat,
        lon: SEOUL_DEFAULT.lon,
        loading: false,
        error: errorMessage,
        permission,
      });
    };

    navigator.geolocation.getCurrentPosition(onSuccess, onError, {
      enableHighAccuracy: false,
      timeout: 10000,
      maximumAge: 300000, // 5분 캐시
    });
  }, []);

  return state;
}
