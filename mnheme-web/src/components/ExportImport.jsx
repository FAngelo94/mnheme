import { useState, useRef } from 'react';
import { useMemoryDB } from '../hooks/useMemoryDB';
import { useI18n } from '../i18n/index.jsx';

export default function ExportImport() {
  const { exportJSON, importJSON, refresh } = useMemoryDB();
  const { t } = useI18n();
  const fileRef = useRef(null);
  const [status, setStatus]   = useState(null);
  const [loading, setLoading] = useState(false);

  const handleExport = () => {
    const data = exportJSON();
    const count = data.memories.length;
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = `mnheme_export_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setStatus({ type: 'success', msg: t('exportImport.exportSuccess').replace('{count}', count) });
  };

  const handleImport = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setStatus(null);

    try {
      const text = await file.text();
      const data = JSON.parse(text);
      const count = await importJSON(data);
      refresh();
      setStatus({ type: 'success', msg: t('exportImport.importSuccess').replace('{count}', count) });
    } catch (err) {
      setStatus({ type: 'error', msg: t('exportImport.importError').replace('{error}', err.message) });
    } finally {
      setLoading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  return (
    <div>
      <div className="form-card">
        <div className="section-title" style={{ marginBottom: 16 }}>{t('exportImport.exportTitle')}</div>
        <p style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 16 }}>
          {t('exportImport.exportDesc')}
        </p>
        <div className="form-actions">
          <button className="btn-primary" onClick={handleExport}>
            {t('exportImport.exportBtn')}
          </button>
        </div>
      </div>

      <div className="form-card" style={{ marginTop: 20 }}>
        <div className="section-title" style={{ marginBottom: 16 }}>{t('exportImport.importTitle')}</div>
        <p style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 16 }}>
          {t('exportImport.importDesc')}
        </p>
        <div className="field">
          <label>{t('exportImport.importFileLabel')}</label>
          <input
            type="file"
            accept=".json"
            ref={fileRef}
            onChange={handleImport}
            disabled={loading}
            style={{ padding: 8 }}
          />
        </div>
        {loading && (
          <div style={{ fontSize: 12, color: 'var(--amber)' }}>
            <span className="loading" /> {t('exportImport.importLoading')}
          </div>
        )}
      </div>

      {status && (
        <div className={`response-area visible ${status.type === 'error' ? 'error' : ''}`}
             style={{ marginTop: 16 }}>
          <div className="response-label">
            {status.type === 'success' ? t('exportImport.completed') : t('exportImport.errorLabel')}
          </div>
          {status.msg}
        </div>
      )}
    </div>
  );
}
