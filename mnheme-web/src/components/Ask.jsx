import { useState } from 'react';
import { useBrain } from '../hooks/useBrain';
import MemoryList from './MemoryList';
import SectionGuide from './SectionGuide';
import { useI18n } from '../i18n/index.jsx';

export default function Ask() {
  const [question, setQuestion] = useState('');
  const { ask, loading, error } = useBrain();
  const [result, setResult]     = useState(null);
  const { t } = useI18n();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!question.trim() || loading) return;
    try {
      const r = await ask(question.trim());
      setResult(r);
    } catch {
      // error from hook
    }
  };

  return (
    <div>
      <SectionGuide title={t('ask.guideTitle')}>
        <p dangerouslySetInnerHTML={{ __html: t('ask.guideIntro') }} />
        <ol className="guide-steps">
          <li dangerouslySetInnerHTML={{ __html: t('ask.guideStep1') }} />
          <li>{t('ask.guideStep2')}</li>
          <li>{t('ask.guideStep3')}</li>
          <li dangerouslySetInnerHTML={{ __html: t('ask.guideStep4') }} />
        </ol>
        <div className="guide-note">
          {t('ask.guideNote')}
        </div>
      </SectionGuide>

      <form onSubmit={handleSubmit} className="form-card">
        <div className="field">
          <label>{t('ask.fieldLabel')}</label>
          <textarea
            rows={3}
            value={question}
            onChange={e => setQuestion(e.target.value)}
            placeholder={t('ask.placeholder')}
            disabled={loading}
          />
        </div>
        <div className="form-actions">
          <button type="submit" className="btn-primary" disabled={loading || !question.trim()}>
            {loading ? <><span className="loading" /> {t('ask.btnLoading')}</> : t('ask.btn')}
          </button>
        </div>
      </form>

      {error && (
        <div className="response-area visible error">
          <div className="response-label">{t('ask.error')}</div>
          {error}
        </div>
      )}

      {result && (
        <div style={{ marginTop: 16 }}>
          <div className="response-area visible">
            <div className="response-label">{t('ask.resultLabel')}</div>
            {result.answer}
            {result.confidence && (
              <div style={{ marginTop: 12, fontSize: 11, color: 'var(--amber)' }}>
                {t('ask.confidence')}: {result.confidence}
              </div>
            )}
          </div>
          {result.memoriesUsed.length > 0 && (
            <div style={{ marginTop: 16 }}>
              <div className="response-label" style={{ marginBottom: 8 }}>
                {t('ask.memoriesUsed')} ({result.memoriesUsed.length})
              </div>
              <MemoryList memories={result.memoriesUsed} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
