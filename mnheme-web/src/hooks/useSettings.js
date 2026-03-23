import { useState, useCallback } from 'react';
import { LLMProvider } from '../core/llm-provider.js';

const SETTINGS_KEY  = 'mnheme_settings';
const PROVIDERS_KEY = 'mnheme_providers';

let _nextId = Date.now();
function genId() { return String(_nextId++); }

/** Default shape for a new provider entry. */
function newProvider(overrides = {}) {
  return {
    id:          genId(),
    name:        '',
    url:         '',
    model:       '',
    apiKey:      '',
    temperature: 0.3,
    maxTokens:   2048,
    ...overrides,
  };
}

/** Load provider list from localStorage, with migration from old single-provider. */
function loadProviders() {
  try {
    const raw = localStorage.getItem(PROVIDERS_KEY);
    if (raw) {
      const list = JSON.parse(raw);
      if (Array.isArray(list) && list.length > 0) return list;
    }
  } catch { /* fall through */ }

  // Migrate from old single-provider format
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (raw) {
      const s = JSON.parse(raw);
      if (s.url && s.model) {
        const migrated = [newProvider({
          name:        s.url.includes('anthropic') ? 'Anthropic' : 'Provider 1',
          url:         s.url,
          model:       s.model,
          apiKey:      s.apiKey || '',
          temperature: s.temperature ?? 0.3,
          maxTokens:   s.maxTokens ?? 2048,
        })];
        localStorage.setItem(PROVIDERS_KEY, JSON.stringify(migrated));
        return migrated;
      }
    }
  } catch { /* fall through */ }

  return [];
}

function saveProviders(list) {
  localStorage.setItem(PROVIDERS_KEY, JSON.stringify(list));
}

export function useSettings() {
  const [providers, setProviders] = useState(loadProviders);

  const persist = useCallback((updater) => {
    setProviders(prev => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      saveProviders(next);
      return next;
    });
  }, []);

  const addProvider = useCallback((overrides = {}) => {
    persist(prev => [...prev, newProvider(overrides)]);
  }, [persist]);

  const removeProvider = useCallback((id) => {
    persist(prev => prev.filter(p => p.id !== id));
  }, [persist]);

  const updateProvider = useCallback((id, updates) => {
    persist(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
  }, [persist]);

  const moveProvider = useCallback((id, direction) => {
    persist(prev => {
      const list = [...prev];
      const idx = list.findIndex(p => p.id === id);
      if (idx < 0) return prev;
      const newIdx = idx + direction;
      if (newIdx < 0 || newIdx >= list.length) return prev;
      [list[idx], list[newIdx]] = [list[newIdx], list[idx]];
      return list;
    });
  }, [persist]);

  /** Replace all providers with an imported list (assigns fresh IDs). */
  const importProviders = useCallback((list) => {
    const imported = list.map(p => newProvider({
      name:        p.name || '',
      url:         p.url || '',
      model:       p.model || '',
      apiKey:      p.apiKey || '',
      temperature: p.temperature ?? 0.3,
      maxTokens:   p.maxTokens ?? 2048,
    }));
    persist(imported);
    return imported.length;
  }, [persist]);

  const testProvider = useCallback(async (providerConfig) => {
    if (!providerConfig.url || !providerConfig.model) {
      return { ok: false, error: 'URL e modello sono obbligatori.' };
    }
    const provider = new LLMProvider({
      url:         providerConfig.url,
      model:       providerConfig.model,
      apiKey:      providerConfig.apiKey || '',
      temperature: providerConfig.temperature ?? 0.3,
      maxTokens:   providerConfig.maxTokens ?? 2048,
    });
    return provider.testConnection();
  }, []);

  const isConfigured = providers.some(p => p.url && p.model);

  return {
    providers,
    addProvider,
    removeProvider,
    updateProvider,
    moveProvider,
    testProvider,
    importProviders,
    isConfigured,
  };
}
