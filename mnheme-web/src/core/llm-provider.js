/**
 * MNHEME LLM Provider — simplified browser-side
 * ================================================
 * Port of llm_provider.py. Uses fetch() for HTTP calls.
 * Supports OpenAI-compatible and Anthropic formats.
 */

const SETTINGS_KEY  = 'mnheme_settings';
const PROVIDERS_KEY = 'mnheme_providers';

export class LLMError extends Error {
  constructor(message, { provider = '', statusCode = 0 } = {}) {
    super(message);
    this.name = 'LLMError';
    this.provider = provider;
    this.statusCode = statusCode;
  }
}

export class LLMProvider {
  constructor({ url, model, apiKey = '', temperature = 0.3, maxTokens = 2048 }) {
    this.url         = url;
    this.model       = model;
    this.apiKey      = apiKey;
    this.temperature = temperature;
    this.maxTokens   = maxTokens;
    this.isAnthropic = url.toLowerCase().includes('anthropic.com');
    this.name        = this.isAnthropic ? 'anthropic' : 'openai-compat';
  }

  /** Create from localStorage settings. */
  static fromSettings() {
    try {
      const raw = localStorage.getItem(SETTINGS_KEY);
      if (!raw) return null;
      const settings = JSON.parse(raw);
      if (!settings.url || !settings.model) return null;
      return new LLMProvider({
        url:         settings.url,
        model:       settings.model,
        apiKey:      settings.apiKey || '',
        temperature: settings.temperature ?? 0.3,
        maxTokens:   settings.maxTokens ?? 2048,
      });
    } catch {
      return null;
    }
  }

  /**
   * Create an ordered array of LLMProvider instances from the provider list
   * in localStorage. Falls back to fromSettings() for backward compatibility.
   */
  static fromProviderList() {
    try {
      const raw = localStorage.getItem(PROVIDERS_KEY);
      if (raw) {
        const list = JSON.parse(raw);
        if (Array.isArray(list) && list.length > 0) {
          return list
            .filter(p => p.url && p.model)
            .map(p => new LLMProvider({
              url:         p.url,
              model:       p.model,
              apiKey:      p.apiKey || '',
              temperature: p.temperature ?? 0.3,
              maxTokens:   p.maxTokens ?? 2048,
            }));
        }
      }
    } catch { /* fall through */ }

    // Backward compat: try the old single-provider format
    const single = LLMProvider.fromSettings();
    return single ? [single] : [];
  }

  /**
   * Try providers in order. Return the first successful response.
   * Throws an LLMError listing all failures only if every provider fails.
   */
  static async completeWithFallback(providers, system, user) {
    if (!providers.length) {
      throw new LLMError('Nessun provider LLM configurato.');
    }
    const errors = [];
    for (const provider of providers) {
      try {
        return await provider.complete(system, user);
      } catch (e) {
        errors.push(`[${provider.name}] ${e.message}`);
      }
    }
    throw new LLMError(
      `Tutti i provider hanno fallito:\n${errors.join('\n')}`,
      { provider: 'fallback-chain' }
    );
  }

  /**
   * Vision fallback across providers.
   */
  static async completeVisionWithFallback(providers, system, user, mediaItems) {
    if (!providers.length) {
      throw new LLMError('Nessun provider LLM configurato.');
    }
    const errors = [];
    for (const provider of providers) {
      try {
        return await provider.completeVision(system, user, mediaItems);
      } catch (e) {
        errors.push(`[${provider.name}] ${e.message}`);
      }
    }
    throw new LLMError(
      `Tutti i provider hanno fallito:\n${errors.join('\n')}`,
      { provider: 'fallback-chain' }
    );
  }

  /** Complete a system+user prompt. Returns the response text. */
  async complete(system, user) {
    let payload, headers;

    if (this.isAnthropic) {
      payload = {
        model:       this.model,
        max_tokens:  this.maxTokens,
        temperature: this.temperature,
        system:      system,
        messages:    [{ role: 'user', content: user }],
      };
      headers = {
        'Content-Type':      'application/json',
        'x-api-key':         this.apiKey,
        'anthropic-version': '2023-06-01',
      };
    } else {
      payload = {
        model:       this.model,
        max_tokens:  this.maxTokens,
        temperature: this.temperature,
        messages: [
          { role: 'system', content: system },
          { role: 'user',   content: user },
        ],
      };
      headers = {
        'Content-Type': 'application/json',
      };
      if (this.apiKey) {
        headers['Authorization'] = `Bearer ${this.apiKey}`;
      }
    }

    let res;
    try {
      res = await fetch(this.url, {
        method:  'POST',
        headers,
        body:    JSON.stringify(payload),
      });
    } catch (e) {
      throw new LLMError(
        `Connessione fallita a ${this.url}: ${e.message}`,
        { provider: this.name }
      );
    }

    if (!res.ok) {
      const errText = await res.text().catch(() => '');
      throw new LLMError(
        `HTTP ${res.status} da ${this.name}: ${errText.slice(0, 300)}`,
        { provider: this.name, statusCode: res.status }
      );
    }

    const body = await res.json();

    try {
      if (this.isAnthropic) {
        return body.content[0].text;
      } else {
        return body.choices[0].message.content;
      }
    } catch (e) {
      throw new LLMError(
        `Risposta malformata da ${this.name}: ${JSON.stringify(body).slice(0, 200)}`,
        { provider: this.name }
      );
    }
  }

  /**
   * Complete a vision/media prompt. mediaItems is an array of
   * { type, data (base64), media_type (MIME), size_kb }.
   * Falls back to complete() if the provider doesn't support vision natively.
   */
  async completeVision(system, user, mediaItems = []) {
    // For OpenAI-compatible endpoints, build multi-part content blocks
    // For Anthropic, use the native image_url block format
    if (!mediaItems.length) {
      return this.complete(system, user);
    }

    const contentBlocks = [];
    for (const item of mediaItems) {
      if (this.isAnthropic) {
        contentBlocks.push({
          type: 'image',
          source: {
            type: 'base64',
            media_type: item.media_type,
            data: item.data,
          },
        });
      } else {
        // OpenAI vision format
        contentBlocks.push({
          type: 'image_url',
          image_url: {
            url: `data:${item.media_type};base64,${item.data}`,
          },
        });
      }
    }
    contentBlocks.push({ type: 'text', text: user });

    let payload, headers;
    if (this.isAnthropic) {
      payload = {
        model:       this.model,
        max_tokens:  this.maxTokens,
        temperature: this.temperature,
        system:      system,
        messages:    [{ role: 'user', content: contentBlocks }],
      };
      headers = {
        'Content-Type':      'application/json',
        'x-api-key':         this.apiKey,
        'anthropic-version': '2023-06-01',
      };
    } else {
      payload = {
        model:       this.model,
        max_tokens:  this.maxTokens,
        temperature: this.temperature,
        messages: [
          { role: 'system', content: system },
          { role: 'user',   content: contentBlocks },
        ],
      };
      headers = { 'Content-Type': 'application/json' };
      if (this.apiKey) {
        headers['Authorization'] = `Bearer ${this.apiKey}`;
      }
    }

    let res;
    try {
      res = await fetch(this.url, {
        method:  'POST',
        headers,
        body:    JSON.stringify(payload),
      });
    } catch (e) {
      throw new LLMError(
        `Connessione fallita a ${this.url}: ${e.message}`,
        { provider: this.name }
      );
    }

    if (!res.ok) {
      const errText = await res.text().catch(() => '');
      throw new LLMError(
        `HTTP ${res.status} da ${this.name}: ${errText.slice(0, 300)}`,
        { provider: this.name, statusCode: res.status }
      );
    }

    const body = await res.json();
    try {
      if (this.isAnthropic) {
        return body.content[0].text;
      } else {
        return body.choices[0].message.content;
      }
    } catch (e) {
      throw new LLMError(
        `Risposta malformata da ${this.name}: ${JSON.stringify(body).slice(0, 200)}`,
        { provider: this.name }
      );
    }
  }

  /** Quick connection test. Returns { ok: true } or { ok: false, error: string }. */
  async testConnection() {
    try {
      const reply = await this.complete(
        'You are a test assistant.',
        'Reply with just the word OK.'
      );
      return { ok: true, reply: reply.trim() };
    } catch (e) {
      return { ok: false, error: e.message };
    }
  }
}
