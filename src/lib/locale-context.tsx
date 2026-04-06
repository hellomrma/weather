'use client';

/**
 * locale-context.tsx — 앱 전체에 로케일과 번역을 공급하는 React Context
 *
 * LocaleProvider를 최상위 클라이언트 컴포넌트에 감싸고,
 * 하위 컴포넌트에서 useLocale()로 번역 객체와 로케일 정보를 사용한다.
 */

import { createContext, useContext, useEffect, useState } from 'react';
import {
  type Locale,
  type Translations,
  type OWMLang,
  detectLocale,
  getTranslations,
  OWM_LANG,
} from '@/lib/i18n';

interface LocaleContextValue {
  locale: Locale;
  t: Translations;
  /** toLocaleDateString / toLocaleTimeString 에 전달할 BCP 47 태그 */
  dateLocale: string;
  /** OWM API lang 파라미터 값 */
  owmLang: OWMLang;
}

const LocaleContext = createContext<LocaleContextValue | null>(null);

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  // 초기값 'ko': SSR/hydration 불일치 방지 (navigator는 브라우저에서만 사용 가능)
  const [locale, setLocale] = useState<Locale>('ko');

  useEffect(() => {
    setLocale(detectLocale());
  }, []);

  const value: LocaleContextValue = {
    locale,
    t: getTranslations(locale),
    dateLocale: locale,
    owmLang: OWM_LANG[locale],
  };

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useLocale(): LocaleContextValue {
  const ctx = useContext(LocaleContext);
  if (!ctx) throw new Error('useLocale must be used within <LocaleProvider>');
  return ctx;
}
