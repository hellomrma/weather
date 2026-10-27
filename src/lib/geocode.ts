/**
 * geocode.ts — 도시 검색 쿼리 검증 및 OWM Geocoding 응답 변환 (순수 함수)
 */

import type { OWMLang } from '@/lib/i18n';
import type { GeocodeResult, OWMGeocodeItem } from '@/lib/types';

const MAX_QUERY_LENGTH = 100;

/** OWM lang 코드 → Geocoding local_names 키 */
const LOCAL_NAME_KEY: Record<OWMLang, string> = {
  kr: 'ko',
  en: 'en',
  ja: 'ja',
  zh_cn: 'zh',
  es: 'es',
};

export type QueryResult = { ok: true; query: string } | { ok: false; error: string };

export function parseQuery(params: URLSearchParams): QueryResult {
  const query = params.get('q')?.trim();
  if (!query) {
    return { ok: false, error: 'q query parameter is required' };
  }
  if (query.length > MAX_QUERY_LENGTH) {
    return { ok: false, error: `q must be at most ${MAX_QUERY_LENGTH} characters` };
  }
  return { ok: true, query };
}

export function mapGeocodeItem(item: OWMGeocodeItem, lang: OWMLang): GeocodeResult {
  return {
    name: item.local_names?.[LOCAL_NAME_KEY[lang]] ?? item.name,
    country: item.country,
    ...(item.state ? { state: item.state } : {}),
    lat: item.lat,
    lon: item.lon,
  };
}
