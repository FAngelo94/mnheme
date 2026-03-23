import { useState, useRef, useCallback, useEffect } from 'react';
import { useBrain } from '../hooks/useBrain';
import { useMemoryDB } from '../hooks/useMemoryDB';
import MemoryCard from './MemoryCard';
import { useI18n } from '../i18n/index.jsx';

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

export default function Perceive() {
  const [text, setText] = useState('');
  const { perceive, loading, error } = useBrain();
  const { refresh } = useMemoryDB();
  const [result, setResult] = useState(null);
  const { t, locale } = useI18n();

  const [listening, setListening] = useState(false);
  const recognitionRef = useRef(null);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    setListening(false);
  }, []);

  const startListening = useCallback(() => {
    if (!SpeechRecognition) return;
    stopListening();

    const recognition = new SpeechRecognition();
    recognition.lang = locale === 'it' ? 'it-IT' : 'en-US';
    recognition.continuous = true;
    recognition.interimResults = false;

    recognition.onresult = (event) => {
      let transcript = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          transcript += event.results[i][0].transcript;
        }
      }
      if (transcript) {
        setText(prev => prev ? prev + ' ' + transcript : transcript);
      }
    };

    recognition.onerror = () => {
      stopListening();
    };

    recognition.onend = () => {
      setListening(false);
      recognitionRef.current = null;
    };

    recognitionRef.current = recognition;
    recognition.start();
    setListening(true);
  }, [locale, stopListening]);

  const toggleListening = useCallback(() => {
    if (listening) {
      stopListening();
    } else {
      startListening();
    }
  }, [listening, startListening, stopListening]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text.trim() || loading) return;
    stopListening();
    try {
      const r = await perceive(text.trim());
      setResult(r);
      refresh();
      setText('');
    } catch {
      // error is in the hook
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit} className="form-card">
        <div className="field">
          <div className="field-label-row">
            <label>{t('perceive.fieldLabel')}</label>
            {SpeechRecognition && (
              <button
                type="button"
                className={`btn-mic${listening ? ' btn-mic--active' : ''}`}
                onClick={toggleListening}
                disabled={loading}
                title={listening ? t('perceive.micStop') : t('perceive.micStart')}
                aria-label={listening ? t('perceive.micStop') : t('perceive.micStart')}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
                  <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
                  <line x1="12" y1="19" x2="12" y2="23"/>
                  <line x1="8" y1="23" x2="16" y2="23"/>
                </svg>
                {listening && <span className="mic-pulse"/>}
              </button>
            )}
          </div>
          <textarea
            rows={4}
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder={listening ? t('perceive.micListening') : t('perceive.placeholder')}
            disabled={loading}
          />
          <div className="char-count">{text.length} {t('perceive.chars')}</div>
        </div>
        <div className="form-actions">
          <button type="submit" className="btn-primary" disabled={loading || !text.trim()}>
            {loading ? <><span className="loading" /> {t('perceive.btnLoading')}</> : t('perceive.btn')}
          </button>
        </div>
      </form>

      {error && (
        <div className="response-area visible error">
          <div className="response-label">{t('perceive.error')}</div>
          {error}
        </div>
      )}

      {result && (
        <div style={{ marginTop: 16 }}>
          <div className="response-label" style={{ marginBottom: 8 }}>{t('perceive.resultLabel')}</div>
          <div className="result-meta">
            <span className="tag-chip">{t('perceive.resultConcept')}: {result.concept}</span>
            <span className="tag-chip">{t('perceive.resultFeeling')}: {result.feeling}</span>
            {result.tags.map((tag, i) => (
              <span key={i} className="tag-chip">#{tag}</span>
            ))}
          </div>
          <MemoryCard memory={result.memory} />
        </div>
      )}
    </div>
  );
}
