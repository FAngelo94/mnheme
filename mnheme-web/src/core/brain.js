/**
 * MNHEME Brain — cognitive engine
 * =================================
 * Port of brain.py. Uses LLMProvider + MemoryDB.
 * perceive, ask (RAG), reflect, dream.
 */

import { FEELINGS, SYSTEM_PROMPT } from './constants.js';
import { LLMProvider } from './llm-provider.js';

// ── Helpers ──────────────────────────────────

function memoriesToContext(memories) {
  return memories.map((m, i) => {
    const ts = m.timestamp.slice(0, 10);
    const tags = m.tags.length ? m.tags.join(', ') : '—';

    // For non-text media, don't include raw base64 in LLM context
    const mediaType = m.media_type || 'text';
    let contentDisplay;
    if (mediaType !== 'text') {
      contentDisplay = `[${mediaType.toUpperCase()} — ${m.content.length} bytes b64]`;
    } else {
      // Truncate text to 500 chars to save tokens
      contentDisplay = m.content.length > 500
        ? m.content.slice(0, 500) + '…'
        : m.content;
    }

    return (
      `[${i + 1}] ${ts} | Concetto: ${m.concept} | Sentimento: ${m.feeling}\n` +
      `    Contenuto: ${contentDisplay}\n` +
      `    Note: ${m.note || '—'}  |  Tag: ${tags}`
    );
  }).join('\n\n');
}

function parseJson(text) {
  text = text.trim();
  // Strip markdown code blocks
  if (text.startsWith('```')) {
    text = text.split('\n').filter(l => !l.trim().startsWith('```')).join('\n').trim();
  }
  try {
    return JSON.parse(text);
  } catch {
    const m = text.match(/\{[\s\S]*\}/);
    if (m) {
      try { return JSON.parse(m[0]); } catch { /* fall through */ }
    }
  }
  return {};
}

function extractTrailingLine(text, prefix) {
  const lines = text.trim().split('\n');
  for (let i = lines.length - 1; i >= 0; i--) {
    if (lines[i].trim().startsWith(prefix)) {
      const value = lines[i].trim().slice(prefix.length).trim();
      const body = lines.slice(0, i).join('\n').trim();
      return [value, body];
    }
  }
  return ['', text.trim()];
}

function closestFeeling(candidate) {
  const c = candidate.toLowerCase();
  for (const v of FEELINGS) {
    if (c.includes(v) || v.includes(c)) return v;
  }
  return 'nostalgia';
}

// ── Brain ────────────────────────────────────

export class Brain {
  constructor(db) {
    this._db = db;
  }

  _getProviders() {
    const providers = LLMProvider.fromProviderList();
    if (!providers.length) {
      throw new Error('Nessun provider LLM configurato. Vai nelle Impostazioni per configurarlo.');
    }
    return providers;
  }

  /**
   * Perceive raw input and create a structured memory.
   * Supports media/vision: pass mediaType, mediaData (base64 or data URL),
   * and mediaMime for image/doc/audio/video inputs.
   */
  async perceive(rawInput, {
    concept = null, feeling = null, tags = null, note = '',
    mediaType = 'text', mediaData = null, mediaMime = null,
  } = {}) {
    const providers = this._getProviders();
    const validFeelings = FEELINGS.join(', ');

    const prompt =
      `Analizza questo input e restituisci SOLO un JSON con questi campi:\n\n` +
      `{\n` +
      `  "concept": "concetto chiave astratto (1-3 parole, es: Debito, Famiglia, Lavoro)",\n` +
      `  "feeling": "uno ESATTO tra: ${validFeelings}",\n` +
      `  "tags": ["tag1", "tag2", "tag3"],\n` +
      `  "enriched": "il ricordo riscritto in prima persona con profondità psicologica (2-3 frasi)"\n` +
      `}\n\n` +
      `Input: ${rawInput}\n\n` +
      `Rispondi SOLO con il JSON, nessun altro testo.`;

    // Determine whether to use vision or plain text
    const isMedia = mediaType !== 'text' && !!mediaData;
    let rawJson;

    if (isMedia) {
      // Extract pure base64 if it arrives as a data URL
      let b64 = mediaData;
      let mime = mediaMime || 'application/octet-stream';
      if (typeof b64 === 'string' && b64.startsWith('data:')) {
        try {
          const [header, data] = b64.split(',', 2);
          b64 = data;
          if (!mime || mime === 'application/octet-stream') {
            mime = header.split(':')[1].split(';')[0];
          }
        } catch { /* keep original */ }
      }

      const mediaItems = [{
        type:       mediaType,
        data:       b64,
        media_type: mime,
        size_kb:    Math.round(b64.length * 3 / 4 / 1024),
      }];

      const visionPrompt =
        `Hai ricevuto un file ${mediaType.toUpperCase()} allegato.\n` +
        `Descrivi brevemente cosa vedi/senti, poi rispondi con il JSON richiesto.\n\n` +
        prompt;

      rawJson = await LLMProvider.completeVisionWithFallback(providers, SYSTEM_PROMPT, visionPrompt, mediaItems);
    } else {
      rawJson = await LLMProvider.completeWithFallback(providers, SYSTEM_PROMPT, prompt);
    }

    const parsed = parseJson(rawJson);

    let extConcept = concept || parsed.concept || 'Generale';
    let extFeeling = feeling || parsed.feeling || 'nostalgia';
    const extTags  = tags    || parsed.tags    || [];
    const enriched = parsed.enriched || rawInput;

    if (!FEELINGS.includes(extFeeling)) {
      extFeeling = closestFeeling(extFeeling);
    }

    // DB content: for media, store the data URL; for text, store enriched text
    let dbContent;
    if (isMedia && mediaData) {
      const mime = mediaMime || 'application/octet-stream';
      dbContent = mediaData.startsWith('data:')
        ? mediaData
        : `data:${mime};base64,${mediaData}`;
    } else {
      dbContent = enriched;
    }

    const memory = await this._db.remember(
      extConcept,
      extFeeling,
      dbContent,
      {
        mediaType,
        note: note || `Input originale: ${rawInput.slice(0, 200)}`,
        tags: extTags,
      }
    );

    return {
      memory,
      concept: extConcept,
      feeling: extFeeling,
      tags: extTags,
      enriched,
      rawInput,
    };
  }

  /** RAG: answer a question using personal memories as context. */
  async ask(question, { maxMemories = 15, concepts = null } = {}) {
    const providers = this._getProviders();

    // Step 1: keyword extraction
    const kwPrompt =
      `Dalla domanda seguente estrai keyword e concetti per cercare in un DB di ricordi.\n` +
      `Rispondi SOLO con JSON: {"keywords": ["kw1","kw2"], "concepts": ["Concetto1"]}\n\n` +
      `Domanda: ${question}`;

    const kwParsed = parseJson(await LLMProvider.completeWithFallback(providers, SYSTEM_PROMPT, kwPrompt));
    const keywords     = kwParsed.keywords || [];
    const llmConcepts  = concepts || kwParsed.concepts || [];

    // Step 2: retrieve memories
    const memories = [];
    const seen = new Set();

    const addMems = (mems) => {
      for (const m of mems) {
        if (!seen.has(m.memory_id)) {
          memories.push(m);
          seen.add(m.memory_id);
        }
      }
    };

    for (const c of llmConcepts) {
      addMems(this._db.recall(c, { limit: 5 }));
    }
    for (const kw of keywords) {
      addMems(this._db.search(kw, { limit: 5 }));
    }
    if (!memories.length) {
      addMems(this._db.recallAll({ limit: maxMemories }));
    }

    const usedMemories = memories.slice(0, maxMemories);
    const context = memoriesToContext(usedMemories);

    // Step 3: answer
    const answerPrompt =
      `Hai accesso a questi ricordi personali:\n\n${context}\n\n` +
      `---\nDomanda: ${question}\n\n` +
      `Rispondi basandoti ESCLUSIVAMENTE sui ricordi forniti.\n` +
      `Se le informazioni non bastano, dillo chiaramente.\n` +
      `Ultima riga: "Certezza: [alta/media/bassa] — [motivazione breve]"`;

    const raw = await LLMProvider.completeWithFallback(providers, SYSTEM_PROMPT, answerPrompt);
    const [confidence, answerText] = extractTrailingLine(raw, 'Certezza:');

    return {
      question,
      answer: answerText,
      memoriesUsed: usedMemories,
      confidence,
    };
  }

  /** Analyze the emotional evolution of a concept over time. */
  async reflect(concept) {
    const providers = this._getProviders();
    const memories = this._db.recall(concept, { oldestFirst: true });

    if (!memories.length) {
      throw new Error(`Nessun ricordo per '${concept}'`);
    }

    const timeline = this._db.conceptTimeline(concept);
    const feelingsSeq = timeline.map(t => t.feeling).join(' → ');
    const context = memoriesToContext(memories);

    const prompt =
      `Questi sono tutti i ricordi relativi al concetto "${concept}", ` +
      `in ordine cronologico:\n\n${context}\n\n` +
      `Sequenza emotiva: ${feelingsSeq}\n\n` +
      `Produci una riflessione profonda su:\n` +
      `1. Come è cambiato il rapporto emotivo con "${concept}" nel tempo\n` +
      `2. Pattern ricorrenti\n` +
      `3. Cosa resta irrisolto\n` +
      `4. Il significato psicologico del percorso\n\n` +
      `Ultima riga: "Arco: [sintesi brevissima dell'evoluzione]"`;

    const raw = await LLMProvider.completeWithFallback(providers, SYSTEM_PROMPT, prompt);
    const [arc, text] = extractTrailingLine(raw, 'Arco:');

    return {
      concept,
      reflection: text,
      memories,
      arc,
    };
  }

  /** Full psychological portrait based on all memories. */
  async introspect() {
    const providers = this._getProviders();
    const total = this._db.count();
    if (total === 0) throw new Error('Database vuoto.');

    const concepts  = this._db.listConcepts();
    const feelings  = this._db.feelingDistribution();
    const topC      = [...concepts].sort((a, b) => b.total - a.total).slice(0, 8);
    const topMems   = this._db.recallAll({ limit: 20 });

    let stats = `Totale ricordi: ${total}\n\nConcetti principali:\n`;
    for (const c of topC) {
      const fs = Object.entries(c.feelings).map(([f, n]) => `${f}(${n})`).join(', ');
      stats += `  ${c.concept}: ${c.total} ricordi [${fs}]\n`;
    }
    stats += '\nDistribuzione emotiva:\n';
    const sortedFeelings = Object.entries(feelings).sort(([, a], [, b]) => b - a);
    for (const [f, n] of sortedFeelings) {
      stats += `  ${f}: ${n} (${(n / total * 100).toFixed(1)}%)\n`;
    }

    const context = memoriesToContext(topMems);
    const prompt =
      `Analizza questo database di ricordi e produci un ritratto psicologico.\n\n` +
      `STATISTICHE:\n${stats}\n` +
      `CAMPIONE RICORDI (più recenti):\n${context}\n\n` +
      `Produci:\n` +
      `1. Ritratto della persona — chi è, come elabora il mondo emotivo\n` +
      `2. Pattern cognitivi ricorrenti\n` +
      `3. Tensioni irrisolte più evidenti\n` +
      `4. Risorse emotive e punti di forza\n` +
      `5. Una frase che cattura l'essenza di questa mente\n\n` +
      `Sii specifico, non generalizzare.`;

    const portrait = await LLMProvider.completeWithFallback(providers, SYSTEM_PROMPT, prompt);

    return {
      portrait,
      dominantConcepts: topC.map(c => c.concept),
      emotionalMap: feelings,
      totalMemories: total,
    };
  }

  /** Summarize a set of memories. Style: "narrativo" | "analitico" | "poetico". */
  async summarize(memories, { style = 'narrativo' } = {}) {
    if (!memories.length) return 'Nessun ricordo da riassumere.';

    const providers = this._getProviders();
    const styles = {
      narrativo:  'Prima persona, fluido, continuo.',
      analitico:  'Analizza pattern, cause, temi. Tono oggettivo.',
      poetico:    'Prosa poetica. Immagini, ritmo, emozione.',
    };
    const instr = styles[style] || styles.narrativo;
    const context = memoriesToContext(memories);

    return LLMProvider.completeWithFallback(
      providers,
      SYSTEM_PROMPT,
      `Riassumi questi ricordi personali.\n\n${context}\n\n` +
      `${instr}\nMantieni la complessità emotiva. Non semplificare.`
    );
  }

  /** Free association: find unexpected connections between distant memories. */
  async dream(nMemories = 8) {
    const providers = this._getProviders();
    const allMems = this._db.recallAll();

    if (allMems.length < 2) {
      throw new Error('Servono almeno 2 ricordi per sognare.');
    }

    // Sample from different feelings
    const byFeeling = {};
    for (const m of allMems) {
      (byFeeling[m.feeling] ||= []).push(m);
    }

    const sampled = [];
    const feelings = Object.keys(byFeeling);
    // Shuffle feelings
    for (let i = feelings.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [feelings[i], feelings[j]] = [feelings[j], feelings[i]];
    }

    const perF = Math.max(1, Math.floor(nMemories / feelings.length));
    for (const f of feelings) {
      const pool = byFeeling[f];
      const take = Math.min(perF, pool.length);
      // Random sample
      const shuffled = [...pool].sort(() => Math.random() - 0.5);
      sampled.push(...shuffled.slice(0, take));
    }

    // Shuffle and trim
    const final = sampled.sort(() => Math.random() - 0.5).slice(0, nMemories);
    const context = memoriesToContext(final);

    const prompt =
      `Questi ricordi sembrano non correlati. Trovane il filo nascosto.\n\n` +
      `${context}\n\n` +
      `Trova:\n` +
      `1. La connessione più inattesa e profonda\n` +
      `2. Il tema latente che li attraversa tutti\n` +
      `3. Cosa rivelano insieme che nessuno rivela da solo\n` +
      `4. Una metafora o immagine che li contenga tutti\n\n` +
      `Scrivi come un'analisi onirica — suggestiva, non banale.`;

    const connections = await LLMProvider.completeWithFallback(providers, SYSTEM_PROMPT, prompt);

    return {
      connections,
      memories: final,
    };
  }
}
