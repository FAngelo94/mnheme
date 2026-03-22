import Stats from '../components/Stats';
import Timeline from '../components/Timeline';
import Graph from '../components/Graph';
import SectionGuide from '../components/SectionGuide';
import { useState } from 'react';
import { useI18n } from '../i18n/index.jsx';

export default function StatsPage() {
  const [tab, setTab] = useState('stats');
  const { t } = useI18n();

  return (
    <div>
      <div className="view-header">
        <h1>{t('statsPage.title')}</h1>
        <p className="view-desc">{t('statsPage.desc')}</p>
      </div>

      <SectionGuide title={t('statsPage.guideTitle')}>
        <p dangerouslySetInnerHTML={{ __html: t('statsPage.guideDashboard') }} />
        <p dangerouslySetInnerHTML={{ __html: t('statsPage.guideTimeline') }} />
        <p dangerouslySetInnerHTML={{ __html: t('statsPage.guideGraph') }} />
        <div className="guide-note">
          {t('statsPage.guideNote')}
        </div>
      </SectionGuide>

      <div className="tab-bar">
        <button className={`tab-btn ${tab === 'stats' ? 'active' : ''}`} onClick={() => setTab('stats')}>
          {t('statsPage.tabDashboard')}
        </button>
        <button className={`tab-btn ${tab === 'timeline' ? 'active' : ''}`} onClick={() => setTab('timeline')}>
          {t('statsPage.tabTimeline')}
        </button>
        <button className={`tab-btn ${tab === 'graph' ? 'active' : ''}`} onClick={() => setTab('graph')}>
          {t('statsPage.tabGraph')}
        </button>
      </div>

      {tab === 'stats'    && <Stats />}
      {tab === 'timeline' && <Timeline />}
      {tab === 'graph'    && <Graph />}
    </div>
  );
}
