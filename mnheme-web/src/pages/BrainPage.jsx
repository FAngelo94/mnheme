import { useState } from 'react';
import Ask from '../components/Ask';
import Reflect from '../components/Reflect';
import Remember from '../components/Remember';
import Summarize from '../components/Summarize';
import SectionGuide from '../components/SectionGuide';
import { useBrain } from '../hooks/useBrain';
import { useI18n } from '../i18n/index.jsx';

function DreamPanel() {
  const { dream, loading, error } = useBrain();
  const [result, setResult] = useState(null);
  const { t } = useI18n();

  const handleDream = async () => {
    try {
      const r = await dream();
      setResult(r);
    } catch {
      // error from hook
    }
  };

  return (
    <div>
      <SectionGuide title={t('dream.guideTitle')}>
        <p dangerouslySetInnerHTML={{ __html: t('dream.guideIntro') }} />
        <ol className="guide-steps">
          <li>{t('dream.guideStep1')}</li>
          <li>{t('dream.guideStep2')}</li>
          <li>{t('dream.guideStep3')}</li>
          <li dangerouslySetInnerHTML={{ __html: t('dream.guideStep4') }} />
        </ol>
        <div className="guide-note">
          {t('dream.guideNote')}
        </div>
      </SectionGuide>

      <div className="form-card">
        <p style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 16 }}>
          {t('dream.desc')}
        </p>
        <div className="form-actions">
          <button className="btn-primary" onClick={handleDream} disabled={loading}>
            {loading ? <><span className="loading" /> {t('dream.btnLoading')}</> : t('dream.btn')}
          </button>
        </div>
      </div>

      {error && (
        <div className="response-area visible error" style={{ marginTop: 12 }}>
          <div className="response-label">{t('dream.error')}</div>
          {error}
        </div>
      )}

      {result && (
        <div className="response-area visible" style={{ marginTop: 12 }}>
          <div className="response-label">{t('dream.resultLabel')}</div>
          <div style={{ whiteSpace: 'pre-wrap' }}>{result.connections}</div>
        </div>
      )}
    </div>
  );
}

function IntrospectPanel() {
  const { introspect, loading, error } = useBrain();
  const [result, setResult] = useState(null);
  const { t } = useI18n();

  const handleIntrospect = async () => {
    try {
      const r = await introspect();
      setResult(r);
    } catch {
      // error from hook
    }
  };

  return (
    <div>
      <SectionGuide title={t('introspect.guideTitle')}>
        <p dangerouslySetInnerHTML={{ __html: t('introspect.guideIntro') }} />
        <ol className="guide-steps">
          <li>{t('introspect.guideStep1')}</li>
          <li>{t('introspect.guideStep2')}</li>
          <li>{t('introspect.guideStep3')}</li>
        </ol>
        <div className="guide-note">
          {t('introspect.guideNote')}
        </div>
      </SectionGuide>

      <div className="form-card">
        <p style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 16 }}>
          {t('introspect.desc')}
        </p>
        <div className="form-actions">
          <button className="btn-primary" onClick={handleIntrospect} disabled={loading}>
            {loading ? <><span className="loading" /> {t('introspect.btnLoading')}</> : t('introspect.btn')}
          </button>
        </div>
      </div>

      {error && (
        <div className="response-area visible error" style={{ marginTop: 12 }}>
          <div className="response-label">{t('introspect.error')}</div>
          {error}
        </div>
      )}

      {result && (
        <div className="response-area visible" style={{ marginTop: 12 }}>
          <div className="response-label">{t('introspect.resultLabel')}</div>
          <div style={{ whiteSpace: 'pre-wrap' }}>{result.portrait}</div>
          {result.dominantConcepts.length > 0 && (
            <div style={{ marginTop: 12, fontSize: 12, color: 'var(--muted)' }}>
              <strong>{t('introspect.dominantConcepts')}</strong> {result.dominantConcepts.join(', ')}
            </div>
          )}
          <div style={{ marginTop: 4, fontSize: 12, color: 'var(--muted)' }}>
            {t('introspect.basedOn')} {result.totalMemories} {t('introspect.memoriesCount')}
          </div>
        </div>
      )}
    </div>
  );
}

export default function BrainPage() {
  const [tab, setTab] = useState('ask');
  const { t } = useI18n();

  return (
    <div>
      <div className="view-header">
        <h1>{t('brain.title')}</h1>
        <p className="view-desc">
          {t('brain.desc')}
        </p>
      </div>

      <div className="tab-bar">
        <button className={`tab-btn ${tab === 'ask' ? 'active' : ''}`} onClick={() => setTab('ask')}>
          {t('brain.tabAsk')}
        </button>
        <button className={`tab-btn ${tab === 'reflect' ? 'active' : ''}`} onClick={() => setTab('reflect')}>
          {t('brain.tabReflect')}
        </button>
        <button className={`tab-btn ${tab === 'remember' ? 'active' : ''}`} onClick={() => setTab('remember')}>
          {t('brain.tabRemember')}
        </button>
        <button className={`tab-btn ${tab === 'dream' ? 'active' : ''}`} onClick={() => setTab('dream')}>
          {t('brain.tabDream')}
        </button>
        <button className={`tab-btn ${tab === 'introspect' ? 'active' : ''}`} onClick={() => setTab('introspect')}>
          {t('brain.tabIntrospect')}
        </button>
        <button className={`tab-btn ${tab === 'summarize' ? 'active' : ''}`} onClick={() => setTab('summarize')}>
          {t('brain.tabSummarize')}
        </button>
      </div>

      {tab === 'ask'        && <Ask />}
      {tab === 'reflect'    && <Reflect />}
      {tab === 'remember'   && <Remember />}
      {tab === 'dream'      && <DreamPanel />}
      {tab === 'introspect' && <IntrospectPanel />}
      {tab === 'summarize'  && <Summarize />}
    </div>
  );
}
