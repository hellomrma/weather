'use client';

/**
 * locale-context.tsx — 앱 전체에 로케일과 번역을 공급하는 React Context
 *
 * LocaleProvider를 최상위 클라이언트 컴포넌트에 감싸고,
 * 하위 컴포넌트에서 useLocale()로 번역 객체와 로케일 정보를 사용한다.
 */

import { createContext, useContext, useSyncExternalStore } from 'react';
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
  /** 브라우저 로케일 감지 완료 여부. false인 동안 API 호출을 미뤄 ko → 실제 언어 중복 요청을 막는다. */
  ready: boolean;
}

// navigator.language는 세션 중 바뀌지 않으므로 구독할 이벤트가 없다.
const subscribeNoop = (): (() => void) => () => {};

const LocaleContext = createContext<LocaleContextValue | null>(null);

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  // 서버/hydration 렌더에서는 false('ko' 사용), 클라이언트에서는 true — hydration 불일치 방지
  const ready = useSyncExternalStore(subscribeNoop, () => true, () => false);
  const locale: Locale = ready ? detectLocale() : 'ko';

  const value: LocaleContextValue = {
    locale,
    t: getTranslations(locale),
    dateLocale: locale,
    owmLang: OWM_LANG[locale],
    ready,
  };

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useLocale(): LocaleContextValue {
  const ctx = useContext(LocaleContext);
  if (!ctx) throw new Error('useLocale must be used within <LocaleProvider>');
  return ctx;
}
