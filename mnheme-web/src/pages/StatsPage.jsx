import Stats from '../components/Stats';
import Timeline from '../components/Timeline';
import Graph from '../components/Graph';
import SectionGuide from '../components/SectionGuide';
import { useState } from 'react';

export default function StatsPage() {
  const [tab, setTab] = useState('stats');

  return (
    <div>
      <div className="view-header">
        <h1>Stats, Timeline & Graph</h1>
        <p className="view-desc">Statistiche del database, timeline emotiva e grafo delle connessioni.</p>
      </div>

      <SectionGuide title="Cosa trovo qui?">
        <p>
          <strong>Dashboard</strong> &mdash; Una panoramica del tuo diario: quanti ricordi hai,
          quanti concetti e sentimenti diversi hai esplorato, e quanto spazio occupa il database.
          Include la distribuzione emotiva (quali emozioni prevalgono) e la mappa dei concetti.
        </p>
        <p>
          <strong>Timeline</strong> &mdash; Scegli un concetto e visualizza come le tue emozioni
          a riguardo si sono evolute nel tempo, in ordine cronologico. Ogni punto della timeline
          mostra il sentimento, la data e le note associate.
        </p>
        <p>
          <strong>Graph</strong> &mdash; Una visualizzazione interattiva a rete dei tuoi ricordi.
          I nodi rappresentano ricordi individuali, collegati da concetti, sentimenti o tag condivisi.
          Puoi trascinare, zoomare e cliccare per esplorare le connessioni.
        </p>
        <div className="guide-note">
          La timeline è particolarmente utile prima di usare Reflect: ti dà un colpo d'occhio
          visivo sull'evoluzione emotiva, mentre Reflect ne fa un'analisi profonda con l'IA.
          Il grafo mostra le relazioni strutturali tra i ricordi.
        </div>
      </SectionGuide>

      <div className="tab-bar">
        <button className={`tab-btn ${tab === 'stats' ? 'active' : ''}`} onClick={() => setTab('stats')}>
          Dashboard
        </button>
        <button className={`tab-btn ${tab === 'timeline' ? 'active' : ''}`} onClick={() => setTab('timeline')}>
          Timeline
        </button>
        <button className={`tab-btn ${tab === 'graph' ? 'active' : ''}`} onClick={() => setTab('graph')}>
          Graph
        </button>
      </div>

      {tab === 'stats'    && <Stats />}
      {tab === 'timeline' && <Timeline />}
      {tab === 'graph'    && <Graph />}
    </div>
  );
}
