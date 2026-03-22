import { useState } from 'react';
import { useBrain } from '../hooks/useBrain';
import { useMemoryDB } from '../hooks/useMemoryDB';
import { FEELINGS, FEELING_LABELS } from '../core/constants';
import SectionGuide from './SectionGuide';
import { useI18n } from '../i18n/index.jsx';

export default function Summarize() {
  const { listConcepts } = useMemoryDB();
  const { summarize, loading, error } = useBrain();
  const db = useMemoryDB();
  const { t } = useI18n();

  const concepts = listConcepts();

  const STYLES = [
    { value: 'narrativo', label: t('summarize.styleNarrative'), desc: t('summarize.styleNarrativeDesc') },
    { value: 'analitico', label: t('summarize.styleAnalytical'), desc: t('summarize.styleAnalyticalDesc') },
    { value: 'poetico', label: t('summarize.stylePoetic'), desc: t('summarize.stylePoeticDesc') },
  ];

  const [concept, setConcept] = useState('');
  const [feeling, setFeeling] = useState('');
  const [style, setStyle] = useState('narrativo');
  const [limit, setLimit] = useState(20);
  const [result, setResult] = useState(null);
  const [memoriesUsed, setMemoriesUsed] = useState(0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;
    try {
      // Gather memories based on filters
      let memories;
      if (concept.trim()) {
        memories = db.recall(concept.trim(), feeling ? { feeling } : {});
      } else if (feeling) {
        memories = db.recallByFeeling(feeling, { limit });
      } else {
        memories = db.recallAll({ limit });
      }

      if (concept.trim() || feeling) {
        memories = memories.slice(0, limit);
      }

      setMemoriesUsed(memories.length);
      const text = await summarize(memories, { style });
      setResult(text);
    } catch {
      // error from hook
    }
  };

  return (
    <div>
      <SectionGuide title={t('summarize.guideTitle')}>
        <p dangerouslySetInnerHTML={{ __html: t('summarize.guideIntro') }} />
        <ol className="guide-steps">
          <li>{t('summarize.guideStep1')}</li>
          <li dangerouslySetInnerHTML={{ __html: t('summarize.guideStep2') }} />
          <li>{t('summarize.guideStep3')}</li>
        </ol>
        <div className="guide-note">
          {t('summarize.guideNote')}
        </div>
      </SectionGuide>

      <form onSubmit={handleSubmit} className="form-card">
        <div className="form-row">
          <div className="field">
            <label>{t('summarize.conceptLabel')} <span className="optional">{t('summarize.conceptOptional')}</span></label>
            <input
              type="text"
              value={concept}
              onChange={e => setConcept(e.target.value)}
              placeholder={t('summarize.conceptPlaceholder')}
              list="sum-concept-list"
            />
            <datalist id="sum-concept-list">
              {concepts.map(c => (
                <option key={c.concept} value={c.concept} />
              ))}
            </datalist>
          </div>
          <div className="field">
            <label>{t('summarize.feelingLabel')} <span className="optional">{t('summarize.feelingOptional')}</span></label>
            <select value={feeling} onChange={e => setFeeling(e.target.value)}>
              <option value="">{t('summarize.feelingAll')}</option>
              {FEELINGS.map(f => (
                <option key={f} value={f}>
                  {FEELING_LABELS[f] || f}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="form-row">
          <div className="field">
            <label>{t('summarize.styleLabel')}</label>
            <select value={style} onChange={e => setStyle(e.target.value)}>
              {STYLES.map(s => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
            <span style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>
              {STYLES.find(s => s.value === style)?.desc}
            </span>
          </div>
          <div className="field">
            <label>{t('summarize.maxMemories')}</label>
            <input
              type="number"
              value={limit}
              onChange={e => setLimit(parseInt(e.target.value) || 20)}
              min={1}
              max={100}
            />
          </div>
        </div>

        <div className="form-actions">
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading
              ? <><span className="loading" /> {t('summarize.btnLoading')}</>
              : <><span style={{ fontWeight: 700 }}>{'\u2261'}</span> {t('summarize.btn')}</>
            }
          </button>
        </div>
      </form>

      {error && (
        <div className="response-area visible error" style={{ marginTop: 12 }}>
          <div className="response-label">{t('summarize.error')}</div>
          {error}
        </div>
      )}

      {result && (
        <div className="response-area visible" style={{ marginTop: 12 }}>
          <div className="response-label">
            {t('summarize.resultLabel')} &mdash; {style}
          </div>
          <div className="summarize-meta">
            {concept && <span>{t('summarize.resultConcept')}: {concept}</span>}
            {feeling && <span>{t('summarize.resultFeeling')}: {feeling}</span>}
            <span>{memoriesUsed} {t('summarize.memoriesUsed')}</span>
          </div>
          <div style={{ whiteSpace: 'pre-wrap', marginTop: 12 }}>{result}</div>
        </div>
      )}
    </div>
  );
}
