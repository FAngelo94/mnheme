import { useState } from 'react';
import Ask from '../components/Ask';
import Reflect from '../components/Reflect';
import Remember from '../components/Remember';
import SectionGuide from '../components/SectionGuide';
import { useBrain } from '../hooks/useBrain';

function DreamPanel() {
  const { dream, loading, error } = useBrain();
  const [result, setResult] = useState(null);

  const handleDream = async () => {
    try {
      const r = await dream();
      setResult(r);
    } catch {
      // error from hook
    }
  };

  return (
    <div>
      <SectionGuide title="Come funziona Dream?">
        <p>
          <strong>Dream</strong> simula il processo onirico: prende ricordi apparentemente
          non collegati tra loro e cerca connessioni nascoste e sorprendenti.
        </p>
        <ol className="guide-steps">
          <li>Il sistema campiona 8 ricordi da emozioni diverse, garantendo varietà emotiva</li>
          <li>I ricordi vengono mescolati casualmente, come in un sogno</li>
          <li>L'IA cerca il filo nascosto che li unisce: temi latenti, metafore, connessioni inattese</li>
          <li>Il risultato è un'analisi onirica &mdash; suggestiva, non banale</li>
        </ol>
        <div className="guide-note">
          Ogni volta che premi Dream ottieni risultati diversi, perché il campionamento è casuale.
          Servono almeno 2 ricordi nel diario per sognare.
        </div>
      </SectionGuide>

      <div className="form-card">
        <p style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 16 }}>
          Il cervello prende ricordi distanti e cerca connessioni inattese.
          Simula il processo onirico di consolidamento della memoria.
        </p>
        <div className="form-actions">
          <button className="btn-primary" onClick={handleDream} disabled={loading}>
            {loading ? <><span className="loading" /> Dreaming...</> : '~ Dream'}
          </button>
        </div>
      </div>

      {error && (
        <div className="response-area visible error" style={{ marginTop: 12 }}>
          <div className="response-label">Errore</div>
          {error}
        </div>
      )}

      {result && (
        <div className="response-area visible" style={{ marginTop: 12 }}>
          <div className="response-label">Connessioni Oniriche</div>
          <div style={{ whiteSpace: 'pre-wrap' }}>{result.connections}</div>
        </div>
      )}
    </div>
  );
}

function IntrospectPanel() {
  const { introspect, loading, error } = useBrain();
  const [result, setResult] = useState(null);

  const handleIntrospect = async () => {
    try {
      const r = await introspect();
      setResult(r);
    } catch {
      // error from hook
    }
  };

  return (
    <div>
      <SectionGuide title="Come funziona Introspect?">
        <p>
          <strong>Introspect</strong> analizza tutti i tuoi ricordi e produce un ritratto
          psicologico completo: chi sei, come elabori le emozioni, quali pattern ricorrono.
        </p>
        <ol className="guide-steps">
          <li>Il sistema raccoglie statistiche su concetti e distribuzione emotiva</li>
          <li>Campiona i ricordi più recenti come contesto</li>
          <li>L'IA produce un ritratto della persona, identifica pattern, tensioni irrisolte e risorse</li>
        </ol>
        <div className="guide-note">
          Servono ricordi nel diario per poter fare introspezione.
          Il ritratto diventa più accurato con più ricordi.
        </div>
      </SectionGuide>

      <div className="form-card">
        <p style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 16 }}>
          Analisi psicologica completa basata su tutti i tuoi ricordi.
          Identifica pattern cognitivi, tensioni irrisolte e risorse emotive.
        </p>
        <div className="form-actions">
          <button className="btn-primary" onClick={handleIntrospect} disabled={loading}>
            {loading ? <><span className="loading" /> Analyzing...</> : '@ Introspect'}
          </button>
        </div>
      </div>

      {error && (
        <div className="response-area visible error" style={{ marginTop: 12 }}>
          <div className="response-label">Errore</div>
          {error}
        </div>
      )}

      {result && (
        <div className="response-area visible" style={{ marginTop: 12 }}>
          <div className="response-label">Ritratto Psicologico</div>
          <div style={{ whiteSpace: 'pre-wrap' }}>{result.portrait}</div>
          {result.dominantConcepts.length > 0 && (
            <div style={{ marginTop: 12, fontSize: 12, color: 'var(--muted)' }}>
              <strong>Concetti dominanti:</strong> {result.dominantConcepts.join(', ')}
            </div>
          )}
          <div style={{ marginTop: 4, fontSize: 12, color: 'var(--muted)' }}>
            Basato su {result.totalMemories} ricordi
          </div>
        </div>
      )}
    </div>
  );
}

export default function BrainPage() {
  const [tab, setTab] = useState('ask');

  return (
    <div>
      <div className="view-header">
        <h1>Brain</h1>
        <p className="view-desc">
          Il cervello cognitivo di MNHEME: interroga, rifletti, ricorda manualmente, sogna, analizza.
        </p>
      </div>

      <div className="tab-bar">
        <button className={`tab-btn ${tab === 'ask' ? 'active' : ''}`} onClick={() => setTab('ask')}>
          Ask (RAG)
        </button>
        <button className={`tab-btn ${tab === 'reflect' ? 'active' : ''}`} onClick={() => setTab('reflect')}>
          Reflect
        </button>
        <button className={`tab-btn ${tab === 'remember' ? 'active' : ''}`} onClick={() => setTab('remember')}>
          Remember
        </button>
        <button className={`tab-btn ${tab === 'dream' ? 'active' : ''}`} onClick={() => setTab('dream')}>
          Dream
        </button>
        <button className={`tab-btn ${tab === 'introspect' ? 'active' : ''}`} onClick={() => setTab('introspect')}>
          Introspect
        </button>
      </div>

      {tab === 'ask'        && <Ask />}
      {tab === 'reflect'    && <Reflect />}
      {tab === 'remember'   && <Remember />}
      {tab === 'dream'      && <DreamPanel />}
      {tab === 'introspect' && <IntrospectPanel />}
    </div>
  );
}
