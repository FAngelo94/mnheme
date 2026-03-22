import { useState } from 'react';
import { FEELINGS, FEELING_LABELS } from '../core/constants';
import { useMemoryDB } from '../hooks/useMemoryDB';
import MemoryCard from './MemoryCard';
import SectionGuide from './SectionGuide';
import { useI18n } from '../i18n/index.jsx';

export default function Remember() {
  const { remember, refresh } = useMemoryDB();
  const { t } = useI18n();
  const [form, setForm] = useState({
    concept: '', feeling: '', content: '', note: '', tags: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);
  const [result, setResult]   = useState(null);

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.concept.trim() || !form.feeling || !form.content.trim()) {
      setError(t('remember.validationError'));
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const tags = form.tags.split(',').map(tg => tg.trim()).filter(Boolean);
      const mem = await remember(form.concept, form.feeling, form.content, {
        note: form.note, tags,
      });
      setResult(mem);
      setForm({ concept: '', feeling: '', content: '', note: '', tags: '' });
      refresh();
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setForm({ concept: '', feeling: '', content: '', note: '', tags: '' });
    setError(null);
    setResult(null);
  };

  const tagList = form.tags.split(',').map(tg => tg.trim()).filter(Boolean);

  return (
    <div>
      <SectionGuide title={t('remember.guideTitle')}>
        <p dangerouslySetInnerHTML={{ __html: t('remember.guideIntro') }} />
        <ol className="guide-steps">
          <li dangerouslySetInnerHTML={{ __html: t('remember.guideStep1') }} />
          <li dangerouslySetInnerHTML={{ __html: t('remember.guideStep2') }} />
          <li dangerouslySetInnerHTML={{ __html: t('remember.guideStep3') }} />
          <li>{t('remember.guideStep4')}</li>
        </ol>
        <div className="guide-note">
          {t('remember.guideNote')}
        </div>
      </SectionGuide>

      <form onSubmit={handleSubmit} className="form-card">
        <div className="form-row">
          <div className="field">
            <label>{t('remember.conceptLabel')} <span className="required">{t('remember.required')}</span></label>
            <input
              type="text" name="concept"
              value={form.concept} onChange={handleChange}
              placeholder={t('remember.conceptPlaceholder')}
              autoComplete="off"
            />
          </div>
          <div className="field">
            <label>{t('remember.feelingLabel')} <span className="required">{t('remember.required')}</span></label>
            <select name="feeling" value={form.feeling} onChange={handleChange}>
              <option value="">{t('remember.feelingSelect')}</option>
              {FEELINGS.map(f => (
                <option key={f} value={f}>{FEELING_LABELS[f]} ({f})</option>
              ))}
            </select>
          </div>
        </div>

        <div className="field">
          <label>{t('remember.contentLabel')} <span className="required">{t('remember.required')}</span></label>
          <textarea
            name="content" rows={4}
            value={form.content} onChange={handleChange}
            placeholder={t('remember.contentPlaceholder')}
          />
          <div className="char-count">{form.content.length} {t('remember.chars')}</div>
        </div>

        <div className="form-row">
          <div className="field">
            <label>{t('remember.noteLabel')} <span className="optional">{t('remember.noteOptional')}</span></label>
            <input
              type="text" name="note"
              value={form.note} onChange={handleChange}
              placeholder={t('remember.notePlaceholder')}
            />
          </div>
          <div className="field">
            <label>{t('remember.tagsLabel')} <span className="optional">{t('remember.tagsOptional')}</span></label>
            <input
              type="text" name="tags"
              value={form.tags} onChange={handleChange}
              placeholder={t('remember.tagsPlaceholder')}
            />
            {tagList.length > 0 && (
              <div className="tag-preview">
                {tagList.map((tg, i) => (
                  <span key={i} className="tag-chip">{tg}</span>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="form-actions">
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? <><span className="loading" /> {t('remember.btnLoading')}</> : t('remember.btn')}
          </button>
          <button type="button" className="btn-ghost" onClick={handleClear}>{t('remember.btnClear')}</button>
        </div>
      </form>

      {error && (
        <div className="response-area visible error">
          <div className="response-label">{t('remember.error')}</div>
          {error}
        </div>
      )}

      {result && (
        <div style={{ marginTop: 16 }}>
          <div className="response-label" style={{ marginBottom: 8 }}>{t('remember.resultLabel')}</div>
          <MemoryCard memory={result} />
        </div>
      )}
    </div>
  );
}
