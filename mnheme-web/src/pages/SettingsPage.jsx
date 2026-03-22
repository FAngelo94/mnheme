import Settings from '../components/Settings';
import ExportImport from '../components/ExportImport';
import ThemeSelector from '../components/ThemeSelector';
import LanguageSelector from '../components/LanguageSelector';
import SectionGuide from '../components/SectionGuide';
import { useState } from 'react';
import { useI18n } from '../i18n/index.jsx';

export default function SettingsPage() {
  const [tab, setTab] = useState('appearance');
  const { t } = useI18n();

  return (
    <div>
      <div className="view-header">
        <h1>{t('settingsPage.title')}</h1>
        <p className="view-desc">{t('settingsPage.desc')}</p>
      </div>

      <SectionGuide title={t('settingsPage.guideTitle')}>
        <p dangerouslySetInnerHTML={{ __html: t('settingsPage.guideAppearance') }} />
        <p dangerouslySetInnerHTML={{ __html: t('settingsPage.guideLLM') }} />
        <p dangerouslySetInnerHTML={{ __html: t('settingsPage.guideExport') }} />
        <div className="guide-note">
          {t('settingsPage.guideNote')}
        </div>
      </SectionGuide>

      <div className="tab-bar">
        <button className={`tab-btn ${tab === 'appearance' ? 'active' : ''}`} onClick={() => setTab('appearance')}>
          {t('settingsPage.tabAppearance')}
        </button>
        <button className={`tab-btn ${tab === 'provider' ? 'active' : ''}`} onClick={() => setTab('provider')}>
          {t('settingsPage.tabProvider')}
        </button>
        <button className={`tab-btn ${tab === 'data' ? 'active' : ''}`} onClick={() => setTab('data')}>
          {t('settingsPage.tabData')}
        </button>
        <button className={`tab-btn ${tab === 'language' ? 'active' : ''}`} onClick={() => setTab('language')}>
          {t('settingsPage.tabLanguage')}
        </button>
      </div>

      {tab === 'appearance' && <ThemeSelector />}
      {tab === 'provider'   && <Settings />}
      {tab === 'data'       && <ExportImport />}
      {tab === 'language'   && <LanguageSelector />}
    </div>
  );
}
