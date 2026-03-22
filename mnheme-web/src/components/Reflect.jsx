import { useState } from 'react';
import { useBrain } from '../hooks/useBrain';
import { useMemoryDB } from '../hooks/useMemoryDB';
import SectionGuide from './SectionGuide';
import { useI18n } from '../i18n/index.jsx';

export default function Reflect() {
  const { listConcepts } = useMemoryDB();
  const { reflect, loading, error } = useBrain();
  const [concept, setConcept] = useState('');
  const [result, setResult]   = useState(null);
  const { t } = useI18n();

  const concepts = listConcepts();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!concept.trim() || loading) return;
    try {
      const r = await reflect(concept.trim());
      setResult(r);
    } catch {
      // error from hook
    }
  };

  return (
    <div>
      <SectionGuide title={t('reflect.guideTitle')}>
        <p dangerouslySetInnerHTML={{ __html: t('reflect.guideIntro') }} />
        <ol className="guide-steps">
          <li dangerouslySetInnerHTML={{ __html: t('reflect.guideStep1') }} />
          <li>{t('reflect.guideStep2')}</li>
          <li dangerouslySetInnerHTML={{ __html: t('reflect.guideStep3') }} />
          <li>{t('reflect.guideStep4')}</li>
        </ol>
        <div className="guide-note" dangerouslySetInnerHTML={{ __html: t('reflect.guideNote') }} />
      </SectionGuide>

      <form onSubmit={handleSubmit} className="form-card">
        <div className="form-row">
          <div className="field">
            <label>{t('reflect.fieldLabel')}</label>
            <input
              type="text"
              value={concept}
              onChange={e => setConcept(e.target.value)}
              placeholder={t('reflect.placeholder')}
              list="concept-list"
            />
            <datalist id="concept-list">
              {concepts.map(c => (
                <option key={c.concept} value={c.concept} />
              ))}
            </datalist>
          </div>
          <div className="field" style={{ display: 'flex', alignItems: 'flex-end' }}>
            <button type="submit" className="btn-primary" disabled={loading || !concept.trim()}>
              {loading ? <><span className="loading" /> {t('reflect.btnLoading')}</> : t('reflect.btn')}
            </button>
          </div>
        </div>
      </form>

      {error && (
        <div className="response-area visible error">
          <div className="response-label">{t('reflect.error')}</div>
          {error}
        </div>
      )}

      {result && (
        <div style={{ marginTop: 16 }}>
          <div className="response-area visible">
            <div className="response-label">{t('reflect.resultLabel')} "{result.concept}"</div>
            <div style={{ whiteSpace: 'pre-wrap' }}>{result.reflection}</div>
            {result.arc && (
              <div style={{ marginTop: 12, fontSize: 11, color: 'var(--amber)' }}>
                {t('reflect.emotionalArc')}: {result.arc}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
