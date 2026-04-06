/**
 * i18n.ts — 다국어 지원 번역 테이블 및 로케일 유틸리티
 *
 * 지원 언어: 한국어(ko) · 영어(en) · 일본어(ja) · 중국어 간체(zh-CN) · 스페인어(es)
 * 브라우저 navigator.language 기반 자동 감지.
 */

export const SUPPORTED_LOCALES = ['ko', 'en', 'ja', 'zh-CN', 'es'] as const;
export type Locale = (typeof SUPPORTED_LOCALES)[number];

/** OWM API lang 파라미터 허용 값 (화이트리스트) */
export const OWM_LANG_VALUES = ['kr', 'en', 'ja', 'zh_cn', 'es'] as const;
export type OWMLang = (typeof OWM_LANG_VALUES)[number];

/** 로케일 → OWM lang 코드 매핑 */
export const OWM_LANG: Record<Locale, OWMLang> = {
  ko: 'kr',
  en: 'en',
  ja: 'ja',
  'zh-CN': 'zh_cn',
  es: 'es',
};

/**
 * lang 쿼리 파라미터를 OWMLang으로 검증하여 반환.
 * 허용되지 않은 값이면 기본값 'kr'을 반환.
 */
export function resolveOWMLang(lang: string | null): OWMLang {
  if (lang && (OWM_LANG_VALUES as readonly string[]).includes(lang)) {
    return lang as OWMLang;
  }
  return 'kr';
}

// =============================================================================
// 번역 테이블
// =============================================================================

export interface Translations {
  appTitle: string;
  weatherLoadingAria: string;
  retry: string;
  demoModeBanner: string;
  locationLoading: string;
  locationDenied: string;
  locationFallback: string;
  currentLocation: string;
  feelsLike: string;
  humidity: string;
  windSpeed: string;
  forecastTitle: string;
  currentTempAriaLabel: (temp: number) => string;
  highTempAriaLabel: (temp: number) => string;
  lowTempAriaLabel: (temp: number) => string;
  precipAriaLabel: (pct: number) => string;
  currentTimeAriaLabel: (time: string) => string;
}

const translations: Record<Locale, Translations> = {
  ko: {
    appTitle: '날씨',
    weatherLoadingAria: '날씨 정보 로딩 중',
    retry: '다시 시도',
    demoModeBanner: '샘플 데이터 미리보기 — API 키 설정 후 실제 날씨를 확인하세요',
    locationLoading: '위치 확인 중...',
    locationDenied: '위치 권한이 거부되었습니다.',
    locationFallback:
      '서울 날씨를 표시합니다. 정확한 위치 날씨를 보려면 브라우저 설정에서 위치 권한을 허용해주세요.',
    currentLocation: '현재 위치',
    feelsLike: '체감온도',
    humidity: '습도',
    windSpeed: '풍속',
    forecastTitle: '5일 예보',
    currentTempAriaLabel: (temp) => `현재 온도 ${temp}도`,
    highTempAriaLabel: (temp) => `최고 기온 ${temp}도`,
    lowTempAriaLabel: (temp) => `최저 기온 ${temp}도`,
    precipAriaLabel: (pct) => `강수 확률 ${pct}%`,
    currentTimeAriaLabel: (time) => `현재 시각 ${time}`,
  },

  en: {
    appTitle: 'Weather',
    weatherLoadingAria: 'Loading weather information',
    retry: 'Retry',
    demoModeBanner: 'Sample data preview — Set up your API key to see real weather',
    locationLoading: 'Getting location...',
    locationDenied: 'Location permission denied.',
    locationFallback:
      'Showing Seoul weather. To see your local weather, allow location access in browser settings.',
    currentLocation: 'Current location',
    feelsLike: 'Feels like',
    humidity: 'Humidity',
    windSpeed: 'Wind',
    forecastTitle: '5-Day Forecast',
    currentTempAriaLabel: (temp) => `Current temperature ${temp}°`,
    highTempAriaLabel: (temp) => `High ${temp}°`,
    lowTempAriaLabel: (temp) => `Low ${temp}°`,
    precipAriaLabel: (pct) => `${pct}% chance of rain`,
    currentTimeAriaLabel: (time) => `Current time ${time}`,
  },

  ja: {
    appTitle: '天気',
    weatherLoadingAria: '天気情報を読み込み中',
    retry: 'もう一度試す',
    demoModeBanner: 'サンプルデータのプレビュー — APIキーを設定して実際の天気を確認してください',
    locationLoading: '位置情報を取得中...',
    locationDenied: '位置情報の権限が拒否されました。',
    locationFallback:
      'ソウルの天気を表示しています。正確な位置の天気を確認するには、ブラウザの設定で位置情報の許可を有効にしてください。',
    currentLocation: '現在地',
    feelsLike: '体感温度',
    humidity: '湿度',
    windSpeed: '風速',
    forecastTitle: '5日間予報',
    currentTempAriaLabel: (temp) => `現在の気温 ${temp}度`,
    highTempAriaLabel: (temp) => `最高気温 ${temp}度`,
    lowTempAriaLabel: (temp) => `最低気温 ${temp}度`,
    precipAriaLabel: (pct) => `降水確率 ${pct}%`,
    currentTimeAriaLabel: (time) => `現在時刻 ${time}`,
  },

  'zh-CN': {
    appTitle: '天气',
    weatherLoadingAria: '正在加载天气信息',
    retry: '重试',
    demoModeBanner: '示例数据预览 — 设置 API 密钥后查看实际天气',
    locationLoading: '正在获取位置...',
    locationDenied: '位置权限被拒绝。',
    locationFallback:
      '正在显示首尔天气。要查看当前位置的天气，请在浏览器设置中允许位置访问。',
    currentLocation: '当前位置',
    feelsLike: '体感温度',
    humidity: '湿度',
    windSpeed: '风速',
    forecastTitle: '5天预报',
    currentTempAriaLabel: (temp) => `当前温度 ${temp}度`,
    highTempAriaLabel: (temp) => `最高温度 ${temp}度`,
    lowTempAriaLabel: (temp) => `最低温度 ${temp}度`,
    precipAriaLabel: (pct) => `降水概率 ${pct}%`,
    currentTimeAriaLabel: (time) => `当前时间 ${time}`,
  },

  es: {
    appTitle: 'Tiempo',
    weatherLoadingAria: 'Cargando información del tiempo',
    retry: 'Reintentar',
    demoModeBanner:
      'Vista previa de datos de muestra — Configure la clave API para ver el tiempo real',
    locationLoading: 'Obteniendo ubicación...',
    locationDenied: 'Permiso de ubicación denegado.',
    locationFallback:
      'Mostrando el tiempo de Seúl. Para ver el tiempo de tu ubicación, permite el acceso a la ubicación en la configuración del navegador.',
    currentLocation: 'Ubicación actual',
    feelsLike: 'Sensación',
    humidity: 'Humedad',
    windSpeed: 'Viento',
    forecastTitle: 'Pronóstico 5 días',
    currentTempAriaLabel: (temp) => `Temperatura actual ${temp}°`,
    highTempAriaLabel: (temp) => `Máxima ${temp}°`,
    lowTempAriaLabel: (temp) => `Mínima ${temp}°`,
    precipAriaLabel: (pct) => `${pct}% de probabilidad de lluvia`,
    currentTimeAriaLabel: (time) => `Hora actual ${time}`,
  },
};

// =============================================================================
// 유틸리티
// =============================================================================

/** navigator.language 기반 로케일 자동 감지 (서버사이드 호출 시 'ko' 반환) */
export function detectLocale(): Locale {
  if (typeof navigator === 'undefined') return 'ko';
  const lang = navigator.language;
  if (lang.startsWith('ko')) return 'ko';
  if (lang.startsWith('ja')) return 'ja';
  if (lang.startsWith('zh')) return 'zh-CN';
  if (lang.startsWith('es')) return 'es';
  return 'en';
}

export function getTranslations(locale: Locale): Translations {
  return translations[locale];
}
