import { useState, useRef } from 'react';
import { useSettings } from '../hooks/useSettings';
import { PROVIDER_PRESETS } from '../core/constants';
import SectionGuide from './SectionGuide';
import { useI18n } from '../i18n/index.jsx';

/* ── Single provider card (collapsible) ── */
function ProviderCard({ provider, index, total, onUpdate, onRemove, onMove, onTest, t }) {
  const [expanded, setExpanded] = useState(!provider.url);
  const [testing, setTesting]     = useState(false);
  const [testResult, setTestResult] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    onUpdate(provider.id, {
      [name]: name === 'temperature' || name === 'maxTokens' ? Number(value) : value,
    });
  };

  const handlePreset = (e) => {
    const presetName = e.target.value;
    if (!presetName) return;
    const preset = PROVIDER_PRESETS[presetName];
    if (preset) {
      onUpdate(provider.id, {
        url:  preset.url,
        model: preset.model || provider.model || '',
        name: provider.name || presetName,
      });
    }
  };

  const handleTest = async () => {
    setTesting(true);
    setTestResult(null);
    const result = await onTest(provider);
    setTestResult(result);
    setTesting(false);
  };

  const isValid = Boolean(provider.url && provider.model);
  const displayName = provider.name || provider.url || t('settings.providerUntitled');

  return (
    <div className="provider-card form-card">
      <div className="provider-card-header" onClick={() => setExpanded(!expanded)}>
        <div className="provider-card-left">
          <span className="provider-priority">{index + 1}</span>
          <span className="provider-card-name">{displayName}</span>
          {provider.model && <span className="provider-card-model">{provider.model}</span>}
        </div>
        <div className="provider-card-actions" onClick={e => e.stopPropagation()}>
          <button
            className="btn-icon"
            onClick={() => onMove(provider.id, -1)}
            disabled={index === 0}
            title={t('settings.moveUp')}
          >&#9650;</button>
          <button
            className="btn-icon"
            onClick={() => onMove(provider.id, 1)}
            disabled={index === total - 1}
            title={t('settings.moveDown')}
          >&#9660;</button>
          <button
            className="btn-icon btn-icon--danger"
            onClick={() => onRemove(provider.id)}
            title={t('settings.removeProvider')}
          >&#10005;</button>
          <span className="provider-chevron">{expanded ? '\u25B4' : '\u25BE'}</span>
        </div>
      </div>

      {expanded && (
        <div className="provider-card-body">
          <div className="field">
            <label>{t('settings.providerName')}</label>
            <input
              type="text" name="name"
              value={provider.name || ''}
              onChange={handleChange}
              placeholder="My Provider"
            />
          </div>

          <div className="field">
            <label>{t('settings.presetLabel')}</label>
            <select onChange={handlePreset} defaultValue="">
              <option value="">{t('settings.presetPlaceholder')}</option>
              {Object.keys(PROVIDER_PRESETS).map(name => (
                <option key={name} value={name}>{name}</option>
              ))}
            </select>
          </div>

          <div className="form-row">
            <div className="field">
              <label>{t('settings.urlLabel')} <span className="required">*</span></label>
              <input
                type="text" name="url"
                value={provider.url || ''}
                onChange={handleChange}
                placeholder="https://api.openrouter.ai/v1/chat/completions"
              />
            </div>
            <div className="field">
              <label>{t('settings.modelLabel')} <span className="required">*</span></label>
              <input
                type="text" name="model"
                value={provider.model || ''}
                onChange={handleChange}
                placeholder="gpt-4, claude-3-opus, llama-3..."
              />
            </div>
          </div>

          <div className="field">
            <label>{t('settings.apiKeyLabel')} <span className="optional">{t('settings.apiKeyOptional')}</span></label>
            <input
              type="password" name="apiKey"
              value={provider.apiKey || ''}
              onChange={handleChange}
              placeholder="sk-..."
              autoComplete="off"
            />
          </div>

          <div className="form-row">
            <div className="field">
              <label>{t('settings.temperatureLabel')}</label>
              <input
                type="number" name="temperature"
                value={provider.temperature ?? 0.3}
                onChange={handleChange}
                min="0" max="2" step="0.1"
              />
            </div>
            <div className="field">
              <label>{t('settings.maxTokensLabel')}</label>
              <input
                type="number" name="maxTokens"
                value={provider.maxTokens ?? 2048}
                onChange={handleChange}
                min="100" max="16384" step="100"
              />
            </div>
          </div>

          <div className="form-actions">
            <button
              className="btn-primary"
              onClick={handleTest}
              disabled={testing || !isValid}
            >
              {testing ? <><span className="loading" /> {t('settings.btnTesting')}</> : t('settings.btnTest')}
            </button>
          </div>

          {testResult && (
            <div className={`response-area visible ${testResult.ok ? '' : 'error'}`} style={{ marginTop: 12 }}>
              <div className="response-label">
                {testResult.ok ? t('settings.testSuccess') : t('settings.testFail')}
              </div>
              {testResult.ok
                ? `${t('settings.testReply')} "${testResult.reply}"`
                : testResult.error
              }
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ── Main Settings component ── */
export default function Settings() {
  const { providers, addProvider, removeProvider, updateProvider, moveProvider, testProvider, importProviders } = useSettings();
  const { t } = useI18n();
  const fileRef = useRef(null);
  const [exportImportStatus, setExportImportStatus] = useState(null);

  const handleExportProviders = () => {
    const blob = new Blob([JSON.stringify(providers, null, 2)], { type: 'application/json' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = 'mnheme-providers.json';
    a.click();
    URL.revokeObjectURL(url);
    setExportImportStatus({
      type: 'success',
      msg: t('settings.exportProvidersSuccess').replace('{count}', providers.length),
    });
  };

  const handleImportProviders = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setExportImportStatus(null);

    try {
      const text = await file.text();
      const data = JSON.parse(text);

      if (!Array.isArray(data)) {
        throw new Error(t('settings.importProvidersInvalidFormat'));
      }
      for (const item of data) {
        if (typeof item !== 'object' || item === null || !item.url || !item.model) {
          throw new Error(t('settings.importProvidersInvalidProvider'));
        }
      }

      const count = importProviders(data);
      setExportImportStatus({
        type: 'success',
        msg: t('settings.importProvidersSuccess').replace('{count}', count),
      });
    } catch (err) {
      setExportImportStatus({
        type: 'error',
        msg: t('settings.importProvidersError').replace('{error}', err.message),
      });
    } finally {
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  return (
    <div>
      <SectionGuide title={t('settings.guideTitle')}>
        <p dangerouslySetInnerHTML={{ __html: t('settings.guideIntro') }} />

        <p style={{ marginTop: 12, marginBottom: 4 }}><strong>{t('settings.guideFreeLocal')}</strong></p>
        <div className="guide-provider-grid">
          <div className="guide-provider-card">
            <div className="guide-provider-name">LM Studio</div>
            <div className="guide-provider-detail">{t('settings.lmStudioDesc')}</div>
            <div className="guide-provider-tag free">{t('settings.tagFree')}</div>
          </div>
          <div className="guide-provider-card">
            <div className="guide-provider-name">Ollama</div>
            <div className="guide-provider-detail">{t('settings.ollamaDesc')}</div>
            <div className="guide-provider-tag free">{t('settings.tagFree')}</div>
          </div>
        </div>

        <p style={{ marginTop: 16, marginBottom: 4 }}><strong>{t('settings.guideFreeCloud')}</strong></p>
        <div className="guide-provider-grid">
          <div className="guide-provider-card">
            <div className="guide-provider-name">Google AI Studio</div>
            <div className="guide-provider-detail">{t('settings.googleDesc')}</div>
            <div className="guide-provider-tag free">{t('settings.tagFree')}</div>
          </div>
          <div className="guide-provider-card">
            <div className="guide-provider-name">Mistral</div>
            <div className="guide-provider-detail">{t('settings.mistralDesc')}</div>
            <div className="guide-provider-tag free">{t('settings.tagFree')}</div>
          </div>
          <div className="guide-provider-card">
            <div className="guide-provider-name">Groq</div>
            <div className="guide-provider-detail">{t('settings.groqDesc')}</div>
            <div className="guide-provider-tag free">{t('settings.tagFree')}</div>
          </div>
          <div className="guide-provider-card">
            <div className="guide-provider-name">Cerebras</div>
            <div className="guide-provider-detail">{t('settings.cerebrasDesc')}</div>
            <div className="guide-provider-tag free">{t('settings.tagFree')}</div>
          </div>
          <div className="guide-provider-card">
            <div className="guide-provider-name">OpenRouter</div>
            <div className="guide-provider-detail">{t('settings.openrouterDesc')}</div>
            <div className="guide-provider-tag free">{t('settings.tagFree')}</div>
          </div>
        </div>

        <p style={{ marginTop: 16, marginBottom: 4 }}><strong>{t('settings.guideCredits')}</strong></p>
        <div className="guide-provider-grid">
          <div className="guide-provider-card">
            <div className="guide-provider-name">Together AI</div>
            <div className="guide-provider-detail">{t('settings.togetherDesc')}</div>
            <div className="guide-provider-tag credits">{t('settings.tagCredits100')}</div>
          </div>
          <div className="guide-provider-card">
            <div className="guide-provider-name">Anthropic</div>
            <div className="guide-provider-detail">{t('settings.anthropicDesc')}</div>
            <div className="guide-provider-tag credits">{t('settings.tagCredits5')}</div>
          </div>
          <div className="guide-provider-card">
            <div className="guide-provider-name">SambaNova</div>
            <div className="guide-provider-detail">{t('settings.sambanovaDesc')}</div>
            <div className="guide-provider-tag credits">{t('settings.tagCredits5_30')}</div>
          </div>
          <div className="guide-provider-card">
            <div className="guide-provider-name">Fireworks AI</div>
            <div className="guide-provider-detail">{t('settings.fireworksDesc')}</div>
            <div className="guide-provider-tag credits">{t('settings.tagCredits1')}</div>
          </div>
        </div>

        <div className="guide-note" style={{ marginTop: 14 }} dangerouslySetInnerHTML={{ __html: t('settings.guideTip') }} />
      </SectionGuide>

      <div className="provider-list-header">
        <div className="section-title">{t('settings.providerListTitle')}</div>
        <p className="provider-list-desc">{t('settings.providerListDesc')}</p>
      </div>

      {providers.length === 0 && (
        <div className="form-card" style={{ textAlign: 'center', color: 'var(--muted)' }}>
          {t('settings.noProviders')}
        </div>
      )}

      {providers.map((p, i) => (
        <ProviderCard
          key={p.id}
          provider={p}
          index={i}
          total={providers.length}
          onUpdate={updateProvider}
          onRemove={removeProvider}
          onMove={moveProvider}
          onTest={testProvider}
          t={t}
        />
      ))}

      <div className="form-actions" style={{ justifyContent: 'center', paddingTop: 8 }}>
        <button className="btn-primary" onClick={() => addProvider()}>
          + {t('settings.addProvider')}
        </button>
      </div>

      {/* ── Export / Import Providers ── */}
      <div className="form-card" style={{ marginTop: 32 }}>
        <div className="section-title" style={{ marginBottom: 12 }}>{t('settings.exportImportTitle')}</div>

        <div className="guide-note" style={{ marginBottom: 16 }}>
          {t('settings.exportApiKeyWarning')}
        </div>

        <div className="form-actions" style={{ marginBottom: 16 }}>
          <button
            className="btn-primary"
            onClick={handleExportProviders}
            disabled={providers.length === 0}
          >
            {t('settings.exportProvidersBtn')}
          </button>
          {providers.length === 0 && (
            <span style={{ fontSize: 12, color: 'var(--muted)', alignSelf: 'center' }}>
              {t('settings.exportProvidersEmpty')}
            </span>
          )}
        </div>

        <div className="field">
          <label>{t('settings.importProvidersFileLabel')}</label>
          <input
            type="file"
            accept=".json"
            ref={fileRef}
            onChange={handleImportProviders}
            style={{ padding: 8 }}
          />
        </div>

        {exportImportStatus && (
          <div
            className={`response-area visible ${exportImportStatus.type === 'error' ? 'error' : ''}`}
            style={{ marginTop: 12 }}
          >
            <div className="response-label">
              {exportImportStatus.type === 'success' ? t('settings.exportImportCompleted') : t('settings.exportImportErrorLabel')}
            </div>
            {exportImportStatus.msg}
          </div>
        )}
      </div>
    </div>
  );
}
