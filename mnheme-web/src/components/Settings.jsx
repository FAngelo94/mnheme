import { useState } from 'react';
import { useSettings } from '../hooks/useSettings';
import { PROVIDER_PRESETS } from '../core/constants';
import SectionGuide from './SectionGuide';
import { useI18n } from '../i18n/index.jsx';

export default function Settings() {
  const { settings, updateSettings, testConnection, isConfigured } = useSettings();
  const { t } = useI18n();
  const [testing, setTesting]     = useState(false);
  const [testResult, setTestResult] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    updateSettings({ [name]: name === 'temperature' || name === 'maxTokens'
      ? Number(value) : value });
  };

  const handlePreset = (e) => {
    const name = e.target.value;
    if (!name) return;
    const preset = PROVIDER_PRESETS[name];
    if (preset) {
      updateSettings({ url: preset.url, model: preset.model || settings.model || '' });
    }
  };

  const handleTest = async () => {
    setTesting(true);
    setTestResult(null);
    const result = await testConnection();
    setTestResult(result);
    setTesting(false);
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

      <div className="form-card">
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
              value={settings.url || ''}
              onChange={handleChange}
              placeholder="https://api.openrouter.ai/v1/chat/completions"
            />
          </div>
          <div className="field">
            <label>{t('settings.modelLabel')} <span className="required">*</span></label>
            <input
              type="text" name="model"
              value={settings.model || ''}
              onChange={handleChange}
              placeholder="gpt-4, claude-3-opus, llama-3..."
            />
          </div>
        </div>

        <div className="field">
          <label>{t('settings.apiKeyLabel')} <span className="optional">{t('settings.apiKeyOptional')}</span></label>
          <input
            type="password" name="apiKey"
            value={settings.apiKey || ''}
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
              value={settings.temperature ?? 0.3}
              onChange={handleChange}
              min="0" max="2" step="0.1"
            />
          </div>
          <div className="field">
            <label>{t('settings.maxTokensLabel')}</label>
            <input
              type="number" name="maxTokens"
              value={settings.maxTokens ?? 2048}
              onChange={handleChange}
              min="100" max="16384" step="100"
            />
          </div>
        </div>

        <div className="form-actions">
          <button
            className="btn-primary"
            onClick={handleTest}
            disabled={testing || !isConfigured}
          >
            {testing ? <><span className="loading" /> {t('settings.btnTesting')}</> : t('settings.btnTest')}
          </button>
        </div>
      </div>

      {testResult && (
        <div className={`response-area visible ${testResult.ok ? '' : 'error'}`}>
          <div className="response-label">
            {testResult.ok ? t('settings.testSuccess') : t('settings.testFail')}
          </div>
          {testResult.ok
            ? `${t('settings.testReply')} "${testResult.reply}"`
            : testResult.error
          }
        </div>
      )}

      <div className="form-card" style={{ marginTop: 20 }}>
        <div className="section-title" style={{ marginBottom: 12 }}>{t('settings.configTitle')}</div>
        <div className="storage-row">
          <span className="storage-key">{t('settings.configProvider')}</span>
          <span className="storage-val">
            {settings.url ? (settings.url.includes('anthropic') ? 'Anthropic' : 'OpenAI-compatible') : '\u2014'}
          </span>
        </div>
        <div className="storage-row">
          <span className="storage-key">{t('settings.configUrl')}</span>
          <span className="storage-val">{settings.url || '\u2014'}</span>
        </div>
        <div className="storage-row">
          <span className="storage-key">{t('settings.configModel')}</span>
          <span className="storage-val">{settings.model || '\u2014'}</span>
        </div>
        <div className="storage-row">
          <span className="storage-key">{t('settings.configApiKey')}</span>
          <span className="storage-val">{settings.apiKey ? '****' + settings.apiKey.slice(-4) : '\u2014'}</span>
        </div>
      </div>
    </div>
  );
}
