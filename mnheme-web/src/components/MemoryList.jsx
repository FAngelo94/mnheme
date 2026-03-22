import MemoryCard from './MemoryCard';
import { useI18n } from '../i18n/index.jsx';

export default function MemoryList({ memories, emptyMessage }) {
  const { t } = useI18n();
  const msg = emptyMessage || t('memoryList.empty');

  if (!memories || memories.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-state-icon">*</div>
        {msg}
      </div>
    );
  }

  return (
    <div className="memories-grid">
      {memories.map((m, i) => (
        <MemoryCard
          key={m.memory_id}
          memory={m}
          style={{ animationDelay: `${i * 30}ms` }}
        />
      ))}
    </div>
  );
}
