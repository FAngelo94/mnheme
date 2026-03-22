import { useState } from 'react';
import { useI18n } from '../i18n/index.jsx';

export default function SectionGuide({ title, children }) {
  const [open, setOpen] = useState(false);
  const { t } = useI18n();

  return (
    <div className="section-guide">
      <button
        className="section-guide-toggle"
        onClick={() => setOpen(o => !o)}
        aria-expanded={open}
      >
        <span className="section-guide-icon">?</span>
        <span>{open ? t('sectionGuide.hideGuide') : title || t('sectionGuide.defaultTitle')}</span>
        <span className={`section-guide-chevron ${open ? 'open' : ''}`}>&#9662;</span>
      </button>
      {open && (
        <div className="section-guide-body">
          {children}
        </div>
      )}
    </div>
  );
}
