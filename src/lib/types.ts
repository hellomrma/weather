// =============================================================================
// App Types (Route Handler → 클라이언트 응답 타입)
// =============================================================================

export interface WeatherResponse {
  location: {
    city: string;     // 도시명 (예: "Seoul")
    country: string;  // 국가 코드 (예: "KR")
  };
  current: {
    temp: number;         // 현재 온도 (섭씨)
    feelsLike: number;    // 체감 온도 (섭씨)
    humidity: number;     // 습도 (%, 0-100)
    windSpeed: number;    // 풍속 (m/s)
    windDeg: number;      // 풍향 (도, 0-360)
    description: string;  // 날씨 설명 (예: "few clouds")
    icon: string;         // OWM 아이콘 코드 (예: "01d", "10n")
    condition: string;    // 날씨 주요 상태 (예: "Clear" | "Clouds" | "Rain" | "Snow" | "Thunderstorm" | "Drizzle" | "Mist")
  };
}

export interface ForecastDay {
  date: string;        // ISO 날짜 문자열 (예: "2026-04-06")
  tempMin: number;     // 일 최저 기온 (섭씨)
  tempMax: number;     // 일 최고 기온 (섭씨)
  description: string; // 대표 날씨 설명 (예: "light rain")
  icon: string;        // OWM 아이콘 코드 (예: "10d")
  pop: number;         // 최대 강수 확률 (0.0 ~ 1.0)
}

export interface ForecastHour {
  dt: number;          // UTC 타임스탬프 (초)
  hour: number;        // 현지 시각 (0-23)
  temp: number;        // 기온 (섭씨)
  description: string; // 날씨 설명
  icon: string;        // OWM 아이콘 코드
  pop: number;         // 강수 확률 (0.0 ~ 1.0)
}

export interface ForecastResponse {
  daily: ForecastDay[];   // 최대 5개 항목
  hourly: ForecastHour[]; // 향후 24시간 (3시간 간격 8개)
}

// OWM 대기질 지수 — 1: 좋음 ~ 5: 매우 나쁨 (유럽 CAQI 기반, 국내 환경부 기준과 다름)
export type AQILevel = 1 | 2 | 3 | 4 | 5;

export interface AirQualityResponse {
  aqi: AQILevel;
  pm25: number; // 초미세먼지 PM2.5 (μg/m³)
  pm10: number; // 미세먼지 PM10 (μg/m³)
}

// =============================================================================
// Client State Types (React hook 상태 타입)
// =============================================================================

// 위치 상태 타입
export type LocationPermission = 'prompt' | 'granted' | 'denied' | 'loading';

export type GeolocationStatus = 'idle' | 'loading' | 'granted' | 'denied' | 'error';

// 에러는 코드로 전달하고 UI에서 번역한다 (i18n 일관성)
export type GeolocationErrorCode = 'unsupported' | 'denied' | 'unavailable' | 'timeout' | 'unknown';

export type WeatherErrorCode = 'weather' | 'forecast' | 'network';

export interface GeolocationState {
  lat: number;
  lon: number;
  loading: boolean;
  error: GeolocationErrorCode | null;
  permission: LocationPermission;
}

export interface WeatherState {
  weather: WeatherResponse | null;
  forecast: ForecastResponse | null;
  loading: boolean;
  error: WeatherErrorCode | null;
}

// =============================================================================
// OpenWeatherMap API 원본 응답 타입 (서버사이드 전용 — weather-api.ts 사용)
// =============================================================================

export interface OWMWeatherItem {
  id: number;
  main: string;
  description: string;
  icon: string;
}

export interface OWMCurrentWeatherResponse {
  name: string;
  sys: {
    country: string;
  };
  main: {
    temp: number;
    feels_like: number;
    humidity: number;
    temp_min: number;
    temp_max: number;
  };
  wind: {
    speed: number;
    deg: number;
  };
  weather: OWMWeatherItem[];
}

export interface OWMForecastItem {
  dt: number;
  dt_txt: string; // "YYYY-MM-DD HH:MM:SS" (UTC)
  main: {
    temp: number;
    feels_like: number;
    humidity: number;
    temp_min: number;
    temp_max: number;
  };
  weather: OWMWeatherItem[];
  wind: {
    speed: number;
    deg: number;
  };
  pop: number; // 강수 확률 (0.0 ~ 1.0)
}

export interface OWMAirPollutionResponse {
  list: {
    dt: number;
    main: { aqi: AQILevel };
    components: {
      pm2_5: number;
      pm10: number;
    };
  }[];
}

export interface OWMForecastResponse {
  list: OWMForecastItem[];
  city: {
    name: string;
    country: string;
    timezone: number; // UTC 기준 오프셋 (초, 예: KST = 32400)
  };
}
