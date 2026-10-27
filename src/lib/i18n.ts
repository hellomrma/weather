/**
 * i18n.ts — 다국어 지원 번역 테이블 및 로케일 유틸리티
 *
 * 지원 언어: 한국어(ko) · 영어(en) · 일본어(ja) · 중국어 간체(zh-CN) · 스페인어(es)
 * 브라우저 navigator.language 기반 자동 감지.
 */

import type { AQILevel, GeolocationErrorCode, WeatherErrorCode } from '@/lib/types';

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
  geoErrors: Record<GeolocationErrorCode, string>;
  weatherErrors: Record<WeatherErrorCode, string>;
  staleDataNotice: string;
  hourlyTitle: string;
  airQualityTitle: string;
  aqiLevels: Record<AQILevel, string>;
  pm25: string;
  pm10: string;
  approxLocation: (km: number) => string;
  changeLocation: string;
  useCurrentLocation: string;
  selectedLocation: string;
  searchLabel: string;
  searchPlaceholder: string;
  search: string;
  searchNoResults: string;
  searchError: string;
  cancel: string;
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
    geoErrors: {
      unsupported: '이 브라우저는 위치 서비스를 지원하지 않습니다.',
      denied: '위치 권한이 거부되었습니다.',
      unavailable: '위치 정보를 가져올 수 없습니다.',
      timeout: '위치 요청 시간이 초과되었습니다.',
      unknown: '위치를 가져오는 중 오류가 발생했습니다.',
    },
    weatherErrors: {
      weather: '날씨 데이터를 가져오지 못했습니다.',
      forecast: '예보 데이터를 가져오지 못했습니다.',
      network: '네트워크 오류가 발생했습니다. 연결을 확인해주세요.',
    },
    staleDataNotice: '최신 정보를 불러오지 못해 이전 데이터를 표시합니다.',
    hourlyTitle: '시간별 예보',
    airQualityTitle: '대기질',
    aqiLevels: { 1: '좋음', 2: '양호', 3: '보통', 4: '나쁨', 5: '매우 나쁨' },
    pm25: '초미세먼지',
    pm10: '미세먼지',
    approxLocation: (km) => `대략적인 위치예요 (오차 약 ${km}km). 정확하지 않다면 위치를 직접 선택하세요.`,
    changeLocation: '위치 변경',
    useCurrentLocation: '현재 위치 사용',
    selectedLocation: '선택한 위치',
    searchLabel: '도시 검색',
    searchPlaceholder: '도시 이름 (예: 성남)',
    search: '검색',
    searchNoResults: '검색 결과가 없습니다.',
    searchError: '검색 중 오류가 발생했습니다.',
    cancel: '취소',
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
    geoErrors: {
      unsupported: 'This browser does not support location services.',
      denied: 'Location permission denied.',
      unavailable: 'Unable to determine your location.',
      timeout: 'Location request timed out.',
      unknown: 'An error occurred while getting your location.',
    },
    weatherErrors: {
      weather: 'Failed to load weather data.',
      forecast: 'Failed to load forecast data.',
      network: 'A network error occurred. Please check your connection.',
    },
    staleDataNotice: 'Could not refresh — showing previous data.',
    hourlyTitle: 'Hourly Forecast',
    airQualityTitle: 'Air Quality',
    aqiLevels: { 1: 'Good', 2: 'Fair', 3: 'Moderate', 4: 'Poor', 5: 'Very Poor' },
    pm25: 'PM2.5',
    pm10: 'PM10',
    approxLocation: (km) => `Approximate location (±${km} km). If this is wrong, choose your location.`,
    changeLocation: 'Change location',
    useCurrentLocation: 'Use current location',
    selectedLocation: 'Selected location',
    searchLabel: 'Search city',
    searchPlaceholder: 'City name (e.g. London)',
    search: 'Search',
    searchNoResults: 'No results found.',
    searchError: 'An error occurred while searching.',
    cancel: 'Cancel',
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
    geoErrors: {
      unsupported: 'このブラウザは位置情報サービスに対応していません。',
      denied: '位置情報の権限が拒否されました。',
      unavailable: '位置情報を取得できません。',
      timeout: '位置情報の取得がタイムアウトしました。',
      unknown: '位置情報の取得中にエラーが発生しました。',
    },
    weatherErrors: {
      weather: '天気データを取得できませんでした。',
      forecast: '予報データを取得できませんでした。',
      network: 'ネットワークエラーが発生しました。接続を確認してください。',
    },
    staleDataNotice: '最新情報を取得できなかったため、以前のデータを表示しています。',
    hourlyTitle: '時間別予報',
    airQualityTitle: '大気質',
    aqiLevels: { 1: '良い', 2: 'やや良い', 3: '普通', 4: '悪い', 5: '非常に悪い' },
    pm25: 'PM2.5',
    pm10: 'PM10',
    approxLocation: (km) => `おおよその位置です（誤差 約${km}km）。正しくない場合は位置を選択してください。`,
    changeLocation: '位置を変更',
    useCurrentLocation: '現在地を使用',
    selectedLocation: '選択した位置',
    searchLabel: '都市を検索',
    searchPlaceholder: '都市名（例: 東京）',
    search: '検索',
    searchNoResults: '検索結果がありません。',
    searchError: '検索中にエラーが発生しました。',
    cancel: 'キャンセル',
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
    geoErrors: {
      unsupported: '此浏览器不支持位置服务。',
      denied: '位置权限被拒绝。',
      unavailable: '无法获取位置信息。',
      timeout: '位置请求超时。',
      unknown: '获取位置时发生错误。',
    },
    weatherErrors: {
      weather: '无法获取天气数据。',
      forecast: '无法获取预报数据。',
      network: '发生网络错误，请检查网络连接。',
    },
    staleDataNotice: '无法获取最新信息，正在显示之前的数据。',
    hourlyTitle: '逐时预报',
    airQualityTitle: '空气质量',
    aqiLevels: { 1: '优', 2: '良', 3: '中等', 4: '差', 5: '很差' },
    pm25: 'PM2.5',
    pm10: 'PM10',
    approxLocation: (km) => `大致位置（误差约 ${km} 公里）。如不准确，请手动选择位置。`,
    changeLocation: '更改位置',
    useCurrentLocation: '使用当前位置',
    selectedLocation: '已选位置',
    searchLabel: '搜索城市',
    searchPlaceholder: '城市名称（例如：北京）',
    search: '搜索',
    searchNoResults: '没有搜索结果。',
    searchError: '搜索时发生错误。',
    cancel: '取消',
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
    geoErrors: {
      unsupported: 'Este navegador no admite servicios de ubicación.',
      denied: 'Permiso de ubicación denegado.',
      unavailable: 'No se pudo determinar tu ubicación.',
      timeout: 'Se agotó el tiempo de la solicitud de ubicación.',
      unknown: 'Se produjo un error al obtener tu ubicación.',
    },
    weatherErrors: {
      weather: 'No se pudieron cargar los datos del tiempo.',
      forecast: 'No se pudieron cargar los datos del pronóstico.',
      network: 'Se produjo un error de red. Comprueba tu conexión.',
    },
    staleDataNotice: 'No se pudo actualizar; se muestran los datos anteriores.',
    hourlyTitle: 'Pronóstico por horas',
    airQualityTitle: 'Calidad del aire',
    aqiLevels: { 1: 'Buena', 2: 'Aceptable', 3: 'Moderada', 4: 'Mala', 5: 'Muy mala' },
    pm25: 'PM2.5',
    pm10: 'PM10',
    approxLocation: (km) => `Ubicación aproximada (±${km} km). Si no es correcta, elige tu ubicación.`,
    changeLocation: 'Cambiar ubicación',
    useCurrentLocation: 'Usar ubicación actual',
    selectedLocation: 'Ubicación seleccionada',
    searchLabel: 'Buscar ciudad',
    searchPlaceholder: 'Nombre de la ciudad (p. ej., Madrid)',
    search: 'Buscar',
    searchNoResults: 'No se encontraron resultados.',
    searchError: 'Se produjo un error al buscar.',
    cancel: 'Cancelar',
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
