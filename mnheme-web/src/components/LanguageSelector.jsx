import { useI18n } from '../i18n/index.jsx';

export default function LanguageSelector() {
  const { t, locale, setLocale } = useI18n();

  const languages = [
    { code: 'it', label: t('language.italian'), flag: 'IT' },
    { code: 'en', label: t('language.english'), flag: 'EN' },
  ];

  return (
    <div>
      <div className="form-card">
        <div className="section-title" style={{ marginBottom: 16 }}>{t('language.title')}</div>
        <p style={{ fontSize: 14, color: 'var(--muted)', marginBottom: 20, lineHeight: 1.6 }}>
          {t('language.desc')}
        </p>

        <div className="theme-grid">
          {languages.map(lang => {
            const isActive = lang.code === locale;
            return (
              <div
                key={lang.code}
                className={`theme-card${isActive ? ' active' : ''}`}
                onClick={() => setLocale(lang.code)}
                role="button"
                tabIndex={0}
                onKeyDown={e => e.key === 'Enter' && setLocale(lang.code)}
                aria-pressed={isActive}
              >
                {isActive && <span className="theme-check" aria-hidden="true">&#10003;</span>}
                <div className="theme-card-name">{lang.flag}</div>
                <div className="theme-card-desc">{lang.label}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
