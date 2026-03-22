import { useState } from 'react';
import { useBrain } from '../hooks/useBrain';
import { useMemoryDB } from '../hooks/useMemoryDB';
import MemoryCard from './MemoryCard';
import { useI18n } from '../i18n/index.jsx';

export default function Perceive() {
  const [text, setText] = useState('');
  const { perceive, loading, error } = useBrain();
  const { refresh } = useMemoryDB();
  const [result, setResult] = useState(null);
  const { t } = useI18n();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text.trim() || loading) return;
    try {
      const r = await perceive(text.trim());
      setResult(r);
      refresh();
      setText('');
    } catch {
      // error is in the hook
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit} className="form-card">
        <div className="field">
          <label>{t('perceive.fieldLabel')}</label>
          <textarea
            rows={4}
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder={t('perceive.placeholder')}
            disabled={loading}
          />
          <div className="char-count">{text.length} {t('perceive.chars')}</div>
        </div>
        <div className="form-actions">
          <button type="submit" className="btn-primary" disabled={loading || !text.trim()}>
            {loading ? <><span className="loading" /> {t('perceive.btnLoading')}</> : t('perceive.btn')}
          </button>
        </div>
      </form>

      {error && (
        <div className="response-area visible error">
          <div className="response-label">{t('perceive.error')}</div>
          {error}
        </div>
      )}

      {result && (
        <div style={{ marginTop: 16 }}>
          <div className="response-label" style={{ marginBottom: 8 }}>{t('perceive.resultLabel')}</div>
          <div className="result-meta">
            <span className="tag-chip">{t('perceive.resultConcept')}: {result.concept}</span>
            <span className="tag-chip">{t('perceive.resultFeeling')}: {result.feeling}</span>
            {result.tags.map((tag, i) => (
              <span key={i} className="tag-chip">#{tag}</span>
            ))}
          </div>
          <MemoryCard memory={result.memory} />
        </div>
      )}
    </div>
  );
}
