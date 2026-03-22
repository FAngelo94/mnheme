import { useState } from 'react';
import { useBrain } from '../hooks/useBrain';
import { useMemoryDB } from '../hooks/useMemoryDB';
import { FEELINGS, FEELING_LABELS } from '../core/constants';
import SectionGuide from './SectionGuide';

const STYLES = [
  { value: 'narrativo', label: 'Narrativo', desc: 'Prima persona, fluido, continuo.' },
  { value: 'analitico', label: 'Analitico', desc: 'Pattern, cause, temi. Tono oggettivo.' },
  { value: 'poetico', label: 'Poetico', desc: 'Prosa poetica. Immagini, ritmo, emozione.' },
];

export default function Summarize() {
  const { listConcepts } = useMemoryDB();
  const { summarize, loading, error } = useBrain();
  const db = useMemoryDB();

  const concepts = listConcepts();

  const [concept, setConcept] = useState('');
  const [feeling, setFeeling] = useState('');
  const [style, setStyle] = useState('narrativo');
  const [limit, setLimit] = useState(20);
  const [result, setResult] = useState(null);
  const [memoriesUsed, setMemoriesUsed] = useState(0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;
    try {
      // Gather memories based on filters
      let memories;
      if (concept.trim()) {
        memories = db.recall(concept.trim(), feeling ? { feeling } : {});
      } else if (feeling) {
        memories = db.recallByFeeling(feeling, { limit });
      } else {
        memories = db.recallAll({ limit });
      }

      if (concept.trim() || feeling) {
        memories = memories.slice(0, limit);
      }

      setMemoriesUsed(memories.length);
      const text = await summarize(memories, { style });
      setResult(text);
    } catch {
      // error from hook
    }
  };

  return (
    <div>
      <SectionGuide title="Come funziona Summarize?">
        <p>
          <strong>Summarize</strong> prende un gruppo di ricordi e li riassume in uno dei tre stili
          disponibili, mantenendo la complessità emotiva senza semplificare.
        </p>
        <ol className="guide-steps">
          <li>Scegli opzionalmente un concetto e/o un sentimento per filtrare i ricordi</li>
          <li>Seleziona lo stile: <em>Narrativo</em> (racconto in prima persona),
              <em>Analitico</em> (analisi di pattern) o <em>Poetico</em> (prosa evocativa)</li>
          <li>L'IA elabora tutti i ricordi selezionati e produce un riassunto coerente</li>
        </ol>
        <div className="guide-note">
          Senza filtri, il sistema usa i ricordi più recenti (fino al limite impostato).
          Puoi combinare concetto e sentimento per un riassunto molto specifico.
        </div>
      </SectionGuide>

      <form onSubmit={handleSubmit} className="form-card">
        <div className="form-row">
          <div className="field">
            <label>CONCETTO <span className="optional">opzionale</span></label>
            <input
              type="text"
              value={concept}
              onChange={e => setConcept(e.target.value)}
              placeholder="tutti i concetti"
              list="sum-concept-list"
            />
            <datalist id="sum-concept-list">
              {concepts.map(c => (
                <option key={c.concept} value={c.concept} />
              ))}
            </datalist>
          </div>
          <div className="field">
            <label>SENTIMENTO <span className="optional">opzionale</span></label>
            <select value={feeling} onChange={e => setFeeling(e.target.value)}>
              <option value="">Tutti</option>
              {FEELINGS.map(f => (
                <option key={f} value={f}>
                  {FEELING_LABELS[f] || f}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="form-row">
          <div className="field">
            <label>STILE</label>
            <select value={style} onChange={e => setStyle(e.target.value)}>
              {STYLES.map(s => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
            <span style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>
              {STYLES.find(s => s.value === style)?.desc}
            </span>
          </div>
          <div className="field">
            <label>MAX RICORDI</label>
            <input
              type="number"
              value={limit}
              onChange={e => setLimit(parseInt(e.target.value) || 20)}
              min={1}
              max={100}
            />
          </div>
        </div>

        <div className="form-actions">
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading
              ? <><span className="loading" /> Riassumendo...</>
              : <><span style={{ fontWeight: 700 }}>{'\u2261'}</span> Summarize</>
            }
          </button>
        </div>
      </form>

      {error && (
        <div className="response-area visible error" style={{ marginTop: 12 }}>
          <div className="response-label">Errore</div>
          {error}
        </div>
      )}

      {result && (
        <div className="response-area visible" style={{ marginTop: 12 }}>
          <div className="response-label">
            Riassunto &mdash; {style}
          </div>
          <div className="summarize-meta">
            {concept && <span>Concetto: {concept}</span>}
            {feeling && <span>Sentimento: {feeling}</span>}
            <span>{memoriesUsed} ricordi utilizzati</span>
          </div>
          <div style={{ whiteSpace: 'pre-wrap', marginTop: 12 }}>{result}</div>
        </div>
      )}
    </div>
  );
}
