import { FEELINGS, FEELING_LABELS, FEELING_COLORS } from '../core/constants';
import { useMemoryDB } from '../hooks/useMemoryDB';
import { useI18n } from '../i18n/index.jsx';

export default function Stats() {
  const { count, listConcepts, feelingDistribution, storageInfo, listFeelings, revision } = useMemoryDB();
  const { t } = useI18n();

  const total    = count();
  const concepts = listConcepts();
  const dist     = feelingDistribution();
  const feelings = listFeelings();
  const storage  = storageInfo();
  const maxVal   = Math.max(...Object.values(dist), 1);

  const sortedDist = Object.entries(dist).sort(([, a], [, b]) => b - a);

  return (
    <div>
      {/* Stat cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-label">{t('stats.totalMemories')}</div>
          <div className="stat-value">{total.toLocaleString()}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">{t('stats.concepts')}</div>
          <div className="stat-value">{concepts.length}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">{t('stats.feelingsUsed')}</div>
          <div className="stat-value">{Object.keys(dist).length}</div>
          <div className="stat-sub">{t('stats.ofTotal')} {FEELINGS.length} {t('stats.total')}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">{t('stats.storage')}</div>
          <div className="stat-value">{storage.storage_size_kb} KB</div>
          <div className="stat-sub">localStorage</div>
        </div>
      </div>

      {/* Feeling distribution bars */}
      {sortedDist.length > 0 && (
        <div className="chart-section">
          <div className="section-title">{t('stats.emotionalDistribution')}</div>
          {sortedDist.map(([feeling, n]) => (
            <div className="bar-row" key={feeling}>
              <span className="bar-label" style={{ color: FEELING_COLORS[feeling] }}>
                {FEELING_LABELS[feeling] || feeling}
              </span>
              <div className="bar-track">
                <div
                  className="bar-fill"
                  style={{
                    width: `${Math.round(n / maxVal * 100)}%`,
                    background: FEELING_COLORS[feeling] || 'var(--accent-dim)',
                    borderRight: `2px solid ${FEELING_COLORS[feeling] || 'var(--accent)'}`,
                  }}
                />
              </div>
              <span className="bar-val">{n}</span>
            </div>
          ))}
        </div>
      )}

      {/* Concept grid */}
      {concepts.length > 0 && (
        <div className="chart-section">
          <div className="section-title">{t('stats.conceptsSection')}</div>
          <div className="concepts-grid">
            {concepts.map(c => (
              <div className="concept-card" key={c.concept}>
                <div className="concept-name">{c.concept}</div>
                <div className="concept-count">
                  {c.total} {c.total === 1 ? t('stats.memorySingular') : t('stats.memoryPlural')}
                </div>
                <div className="concept-feelings">
                  {Object.entries(c.feelings).map(([f, n]) => (
                    <span
                      key={f}
                      className="concept-feeling-tag"
                      style={{ borderColor: FEELING_COLORS[f], color: FEELING_COLORS[f] }}
                    >
                      {f} x{n}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Feelings detail */}
      {feelings.length > 0 && (
        <div className="chart-section">
          <div className="section-title">{t('stats.feelingsConceptsSection')}</div>
          <div className="feelings-grid">
            {feelings.map(f => (
              <div className="feeling-concept-card" key={f.feeling}>
                <div className="feeling-concept-name" style={{ color: FEELING_COLORS[f.feeling] }}>
                  {FEELING_LABELS[f.feeling] || f.feeling} ({f.total})
                </div>
                <div className="feeling-concept-list">
                  {f.concepts.join(' . ')}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
