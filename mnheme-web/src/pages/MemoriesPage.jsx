import { useState } from 'react';
import { FEELINGS, FEELING_LABELS } from '../core/constants';
import { useMemoryDB } from '../hooks/useMemoryDB';
import MemoryList from '../components/MemoryList';
import Search from '../components/Search';
import SectionGuide from '../components/SectionGuide';
import { useI18n } from '../i18n/index.jsx';

export default function MemoriesPage() {
  const { recallAll, recallByFeeling, recall, revision } = useMemoryDB();
  const { t } = useI18n();
  const [filter, setFilter]       = useState({ feeling: '', concept: '', limit: 50, oldestFirst: false });
  const [memories, setMemories]   = useState(null);
  const [tab, setTab]             = useState('browse');

  const handleBrowse = () => {
    let mems;
    if (filter.concept.trim() && filter.feeling) {
      mems = recall(filter.concept.trim(), {
        feeling: filter.feeling, limit: filter.limit, oldestFirst: filter.oldestFirst
      });
    } else if (filter.concept.trim()) {
      mems = recall(filter.concept.trim(), { limit: filter.limit, oldestFirst: filter.oldestFirst });
    } else if (filter.feeling) {
      mems = recallByFeeling(filter.feeling, { limit: filter.limit, oldestFirst: filter.oldestFirst });
    } else {
      mems = recallAll({ limit: filter.limit, oldestFirst: filter.oldestFirst });
    }
    setMemories(mems);
  };

  return (
    <div>
      <div className="view-header">
        <h1>{t('memories.title')}</h1>
        <p className="view-desc">{t('memories.desc')}</p>
      </div>

      <SectionGuide title={t('memories.guideTitle')}>
        <p>
          {t('memories.guideIntro')}
        </p>
        <p dangerouslySetInnerHTML={{ __html: t('memories.guideBrowse') }} />
        <p dangerouslySetInnerHTML={{ __html: t('memories.guideSearch') }} />
        <div className="guide-note" dangerouslySetInnerHTML={{ __html: t('memories.guideNote') }} />
      </SectionGuide>

      <div className="tab-bar">
        <button className={`tab-btn ${tab === 'browse' ? 'active' : ''}`} onClick={() => setTab('browse')}>
          {t('memories.tabBrowse')}
        </button>
        <button className={`tab-btn ${tab === 'search' ? 'active' : ''}`} onClick={() => setTab('search')}>
          {t('memories.tabSearch')}
        </button>
      </div>

      {tab === 'browse' && (
        <div>
          <div className="filter-bar">
            <div className="filter-group">
              <label>{t('memories.filterConcept')}</label>
              <input
                type="text"
                value={filter.concept}
                onChange={e => setFilter(p => ({ ...p, concept: e.target.value }))}
                placeholder={t('memories.filterConceptPlaceholder')}
              />
            </div>
            <div className="filter-group">
              <label>{t('memories.filterFeeling')}</label>
              <select
                value={filter.feeling}
                onChange={e => setFilter(p => ({ ...p, feeling: e.target.value }))}
              >
                <option value="">{t('memories.filterFeelingAll')}</option>
                {FEELINGS.map(f => (
                  <option key={f} value={f}>{FEELING_LABELS[f]}</option>
                ))}
              </select>
            </div>
            <div className="filter-group">
              <label>{t('memories.filterLimit')}</label>
              <input
                type="number"
                value={filter.limit}
                onChange={e => setFilter(p => ({ ...p, limit: Number(e.target.value) }))}
                min={1} max={500}
                style={{ width: 72 }}
              />
            </div>
            <div className="filter-group">
              <label>{t('memories.filterOrder')}</label>
              <select
                value={filter.oldestFirst ? 'asc' : 'desc'}
                onChange={e => setFilter(p => ({ ...p, oldestFirst: e.target.value === 'asc' }))}
              >
                <option value="desc">{t('memories.orderNewest')}</option>
                <option value="asc">{t('memories.orderOldest')}</option>
              </select>
            </div>
            <button className="btn-primary" onClick={handleBrowse}>{t('memories.btnFetch')}</button>
          </div>

          {memories !== null && (
            <div>
              <div style={{ marginBottom: 8, fontSize: 11, color: 'var(--muted)' }}>
                {memories.length} {t('memories.results')}
              </div>
              <MemoryList memories={memories} />
            </div>
          )}
        </div>
      )}

      {tab === 'search' && <Search />}
    </div>
  );
}
