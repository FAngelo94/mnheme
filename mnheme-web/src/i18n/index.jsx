/**
 * MNHEME i18n — lightweight context-based internationalization
 * =============================================================
 * Provides I18nProvider and useI18n hook.
 * Persists locale in localStorage under 'mnheme_locale'.
 * Default locale: 'it' (Italian).
 */

import { createContext, useContext, useState, useCallback, useMemo } from 'react';
import it from './it.js';
import en from './en.js';

const LOCALE_KEY = 'mnheme_locale';
const LOCALES = { it, en };
const SUPPORTED = Object.keys(LOCALES);
const DEFAULT_LOCALE = 'it';

function loadLocale() {
  try {
    const stored = localStorage.getItem(LOCALE_KEY);
    return SUPPORTED.includes(stored) ? stored : DEFAULT_LOCALE;
  } catch {
    return DEFAULT_LOCALE;
  }
}

/**
 * Resolve a dot-separated key from a nested object.
 * e.g. t('perceive.title') => translations.perceive.title
 */
function resolve(obj, path) {
  const keys = path.split('.');
  let current = obj;
  for (const key of keys) {
    if (current == null || typeof current !== 'object') return undefined;
    current = current[key];
  }
  return current;
}

const I18nContext = createContext(null);

export function I18nProvider({ children }) {
  const [locale, setLocaleState] = useState(loadLocale);

  const setLocale = useCallback((newLocale) => {
    if (!SUPPORTED.includes(newLocale)) return;
    localStorage.setItem(LOCALE_KEY, newLocale);
    setLocaleState(newLocale);
  }, []);

  const translations = LOCALES[locale] || LOCALES[DEFAULT_LOCALE];

  const t = useCallback((key) => {
    const value = resolve(translations, key);
    if (value !== undefined) return value;
    // Fallback to Italian if key missing in current locale
    const fallback = resolve(LOCALES[DEFAULT_LOCALE], key);
    if (fallback !== undefined) return fallback;
    // Return the key itself as last resort (helps spot missing translations)
    return key;
  }, [translations]);

  const value = useMemo(() => ({
    t,
    locale,
    setLocale,
    locales: SUPPORTED,
  }), [t, locale, setLocale]);

  return (
    <I18nContext.Provider value={value}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useI18n must be inside <I18nProvider>');
  return ctx;
}
