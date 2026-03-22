import { useState } from 'react';
import { useMemoryDB } from '../hooks/useMemoryDB';
import MemoryList from './MemoryList';
import { useI18n } from '../i18n/index.jsx';

export default function Search() {
  const { search, recallByTag } = useMemoryDB();
  const { t } = useI18n();
  const [query, setQuery]       = useState('');
  const [tagQuery, setTagQuery] = useState('');
  const [results, setResults]   = useState(null);
  const [info, setInfo]         = useState('');

  const doSearch = (e) => {
    e?.preventDefault();
    if (!query.trim()) return;
    const mems = search(query.trim(), { limit: 50 });
    setResults(mems);
    setInfo(`${mems.length} ${t('search.resultsFor')} "${query.trim()}"`);
  };

  const doTagSearch = () => {
    if (!tagQuery.trim()) return;
    const mems = recallByTag(tagQuery.trim(), { limit: 50 });
    setResults(mems);
    setInfo(`${mems.length} ${t('search.memoriesWithTag')} #${tagQuery.trim()}`);
  };

  return (
    <div>
      <form onSubmit={doSearch} className="search-bar">
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder={t('search.placeholder')}
          autoComplete="off"
        />
        <button type="submit" className="btn-primary">{t('search.btn')}</button>
      </form>

      <div className="tag-search-row">
        <span className="tag-search-label">{t('search.tagLabel')}</span>
        <input
          type="text"
          value={tagQuery}
          onChange={e => setTagQuery(e.target.value)}
          placeholder={t('search.tagPlaceholder')}
          onKeyDown={e => e.key === 'Enter' && doTagSearch()}
        />
        <button className="btn-ghost" onClick={doTagSearch} type="button">{t('search.tagBtn')}</button>
      </div>

      {info && (
        <div style={{ marginBottom: 12, fontSize: 11, color: 'var(--muted)', letterSpacing: '0.1em' }}>
          {info}
        </div>
      )}

      {results !== null && <MemoryList memories={results} />}
    </div>
  );
}
