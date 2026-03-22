import Perceive from '../components/Perceive';
import MemoryList from '../components/MemoryList';
import SectionGuide from '../components/SectionGuide';
import { useMemoryDB } from '../hooks/useMemoryDB';
import { useI18n } from '../i18n/index.jsx';

export default function HomePage() {
  const { recallAll, revision } = useMemoryDB();
  const { t } = useI18n();
  const recentMemories = recallAll({ limit: 5 });

  return (
    <div>
      <div className="view-header">
        <h1>{t('perceive.title')}</h1>
        <p className="view-desc">
          {t('perceive.desc')}
        </p>
      </div>

      <SectionGuide title={t('perceive.guideTitle')}>
        <p dangerouslySetInnerHTML={{ __html: t('perceive.guideIntro') }} />
        <ol className="guide-steps">
          <li>{t('perceive.guideStep1')}</li>
          <li dangerouslySetInnerHTML={{ __html: t('perceive.guideStep2') }} />
          <li>{t('perceive.guideStep3')}</li>
          <li dangerouslySetInnerHTML={{ __html: t('perceive.guideStep4') }} />
        </ol>
        <div className="guide-note">
          {t('perceive.guideNote')}
        </div>
      </SectionGuide>

      <Perceive />

      {recentMemories.length > 0 && (
        <div style={{ marginTop: 32 }}>
          <div className="section-title">{t('perceive.recentTitle')}</div>
          <MemoryList memories={recentMemories} />
        </div>
      )}
    </div>
  );
}
