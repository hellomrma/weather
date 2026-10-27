'use client';

import { useState, useEffect } from 'react';
import type { GeolocationErrorCode, GeolocationState, LocationPermission } from '@/lib/types';

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
          error: 'unsupported',
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
      let errorCode: GeolocationErrorCode;
      let permission: LocationPermission;

      switch (err.code) {
        case GeolocationPositionError.PERMISSION_DENIED:
          errorCode = 'denied';
          permission = 'denied';
          break;
        case GeolocationPositionError.POSITION_UNAVAILABLE:
          // 권한 거부가 아닌 기술적 오류 — permission은 'prompt' 유지
          errorCode = 'unavailable';
          permission = 'prompt';
          break;
        case GeolocationPositionError.TIMEOUT:
          // 권한 거부가 아닌 타임아웃 오류 — permission은 'prompt' 유지
          errorCode = 'timeout';
          permission = 'prompt';
          break;
        default:
          errorCode = 'unknown';
          permission = 'prompt';
      }

      setState({
        lat: SEOUL_DEFAULT.lat,
        lon: SEOUL_DEFAULT.lon,
        loading: false,
        error: errorCode,
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
