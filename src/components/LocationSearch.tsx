import { useState, type FormEvent } from 'react';
import { useLocale } from '@/lib/locale-context';
import type { GeocodeResult } from '@/lib/types';

interface LocationSearchProps {
  onSelect: (location: GeocodeResult) => void;
  onCancel: () => void;
}

type SearchStatus = 'idle' | 'loading' | 'error';

// 도시 이름 검색 → 결과 선택 패널 (제출 시에만 검색하여 API 호출 최소화)
export function LocationSearch({ onSelect, onCancel }: LocationSearchProps) {
  const { t, owmLang } = useLocale();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<GeocodeResult[] | null>(null);
  const [status, setStatus] = useState<SearchStatus>('idle');

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;

    setStatus('loading');
    try {
      const res = await fetch(`/api/geocode?q=${encodeURIComponent(q)}&lang=${owmLang}`);
      if (!res.ok) throw new Error(`geocode responded ${res.status}`);
      setResults((await res.json()) as GeocodeResult[]);
      setStatus('idle');
    } catch {
      setResults(null);
      setStatus('error');
    }
  };

  return (
    <div
      className="rounded-2xl bg-white/20 dark:bg-black/30 backdrop-blur-md border border-white/30 dark:border-white/10 p-4"
      data-testid="location-search"
    >
      <form role="search" onSubmit={handleSubmit} className="flex gap-2">
        <label htmlFor="location-search-input" className="sr-only">
          {t.searchLabel}
        </label>
        <input
          id="location-search-input"
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t.searchPlaceholder}
          maxLength={100}
          autoFocus
          className="min-w-0 flex-1 rounded-full bg-white/90 px-4 py-2 text-sm text-slate-900 placeholder:text-slate-500 focus-visible:outline-2 focus-visible:outline-white"
        />
        <button
          type="submit"
          disabled={status === 'loading'}
          className="shrink-0 px-4 py-2 rounded-full bg-white/30 hover:bg-white/40 disabled:opacity-60 text-white text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-white"
        >
          {t.search}
        </button>
      </form>

      <div aria-live="polite" className="mt-3 text-sm">
        {status === 'error' && <p className="text-amber-200">{t.searchError}</p>}
        {status !== 'error' && results?.length === 0 && (
          <p className="text-white/70">{t.searchNoResults}</p>
        )}
        {results && results.length > 0 && (
          <ul className="flex flex-col gap-1">
            {results.map((r) => (
              <li key={`${r.lat},${r.lon}`}>
                <button
                  type="button"
                  onClick={() => onSelect(r)}
                  className="w-full text-left rounded-xl px-3 py-2 hover:bg-white/20 text-white transition-colors focus-visible:outline-2 focus-visible:outline-white"
                >
                  <span className="font-medium">{r.name}</span>
                  <span className="ml-2 text-xs text-white/60">
                    {[r.state, r.country].filter(Boolean).join(', ')}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <button
        type="button"
        onClick={onCancel}
        className="mt-2 text-xs text-white/70 hover:text-white underline underline-offset-2"
      >
        {t.cancel}
      </button>
    </div>
  );
}
