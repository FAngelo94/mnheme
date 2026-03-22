import { useState, useEffect, useCallback, useRef } from 'react';

const DISMISS_KEY = 'mnheme-install-dismissed';
const DISMISS_DAYS = 7;

function isDismissed() {
  const raw = localStorage.getItem(DISMISS_KEY);
  if (!raw) return false;
  const dismissed = Number(raw);
  const daysSince = (Date.now() - dismissed) / (1000 * 60 * 60 * 24);
  return daysSince < DISMISS_DAYS;
}

export default function InstallBanner() {
  const [show, setShow] = useState(false);
  const deferredPrompt = useRef(null);

  const handleBeforeInstall = useCallback((e) => {
    e.preventDefault();
    deferredPrompt.current = e;
    if (!isDismissed()) {
      setShow(true);
    }
  }, []);

  useEffect(() => {
    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    // Hide banner if app gets installed
    const handleInstalled = () => {
      setShow(false);
      deferredPrompt.current = null;
    };
    window.addEventListener('appinstalled', handleInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      window.removeEventListener('appinstalled', handleInstalled);
    };
  }, [handleBeforeInstall]);

  const handleInstall = async () => {
    if (!deferredPrompt.current) return;
    deferredPrompt.current.prompt();
    const { outcome } = await deferredPrompt.current.userChoice;
    if (outcome === 'accepted') {
      setShow(false);
    }
    deferredPrompt.current = null;
  };

  const handleDismiss = () => {
    setShow(false);
    localStorage.setItem(DISMISS_KEY, String(Date.now()));
  };

  if (!show) return null;

  return (
    <div className="install-banner" role="alert">
      <div className="install-banner-content">
        <div className="install-banner-text">
          <span className="install-banner-icon">&#x1f4d6;</span>
          <div>
            <strong className="install-banner-title">Installa MNHEME</strong>
            <p className="install-banner-desc">
              Aggiungi il diario alla schermata Home per un accesso rapido, anche offline.
            </p>
          </div>
        </div>
        <div className="install-banner-actions">
          <button className="btn-primary install-banner-btn" onClick={handleInstall}>
            Installa
          </button>
          <button
            className="install-banner-close"
            onClick={handleDismiss}
            aria-label="Chiudi"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
