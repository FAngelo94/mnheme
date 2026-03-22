/**
 * MNHEME Constants
 * ================
 * Feelings, media types, system prompt, and provider presets.
 */

export const FEELINGS = [
  'ansia', 'paura', 'sollievo', 'tristezza', 'gioia',
  'rabbia', 'vergogna', 'senso_di_colpa', 'nostalgia', 'speranza',
  'orgoglio', 'delusione', 'solitudine', 'confusione', 'gratitudine',
  'invidia', 'imbarazzo', 'eccitazione', 'rassegnazione', 'stupore',
  'amore', 'malinconia', 'serenità', 'sorpresa', 'noia', 'curiosità',
];

export const FEELING_LABELS = {
  ansia: 'Anxiety', paura: 'Fear', sollievo: 'Relief',
  tristezza: 'Sadness', gioia: 'Joy', rabbia: 'Anger',
  vergogna: 'Shame', senso_di_colpa: 'Guilt', nostalgia: 'Nostalgia',
  speranza: 'Hope', orgoglio: 'Pride', delusione: 'Disappointment',
  solitudine: 'Loneliness', confusione: 'Confusion', gratitudine: 'Gratitude',
  invidia: 'Envy', imbarazzo: 'Embarrassment', eccitazione: 'Excitement',
  rassegnazione: 'Resignation', stupore: 'Amazement', amore: 'Love',
  malinconia: 'Melancholy', serenità: 'Serenity', sorpresa: 'Surprise',
  noia: 'Boredom', curiosità: 'Curiosity',
};

export const FEELING_COLORS = {
  ansia: '#9b7fa8', paura: '#8b7db5', sollievo: '#87ceab',
  tristezza: '#6b9ec7', gioia: '#f4c430', rabbia: '#e05c3a',
  vergogna: '#9b5a5a', senso_di_colpa: '#8a6060', nostalgia: '#c47e3a',
  speranza: '#7ec88a', orgoglio: '#c4933a', delusione: '#7a7a9b',
  solitudine: '#5b6b8b', confusione: '#9a8a6a', gratitudine: '#7a9e5a',
  invidia: '#6a9a5a', imbarazzo: '#c47a7a', eccitazione: '#e0a030',
  rassegnazione: '#7a7a7a', stupore: '#c4b050', amore: '#d95f7a',
  malinconia: '#4a8fa8', serenità: '#5a9e6f', sorpresa: '#d4a017',
  noia: '#5a5a6a', curiosità: '#6a8a9b',
};

export const MEDIA_TYPES = ['text', 'image', 'video', 'audio', 'doc'];

export const SYSTEM_PROMPT =
  'Sei il cervello cognitivo di MNHEME, un sistema di memoria umana digitale.\n' +
  'Elabora ricordi, emozioni e pattern cognitivi con profondità e sensibilità.\n' +
  'Rispondi sempre in italiano.\n' +
  'Sii diretto, profondo, mai banale. Niente disclaimer né frasi introduttive generiche.';

export const PROVIDER_PRESETS = {
  'LM Studio':       { url: 'http://localhost:1234/v1/chat/completions', model: '' },
  'Ollama':          { url: 'http://localhost:11434/v1/chat/completions', model: '' },
  'OpenRouter':      { url: 'https://openrouter.ai/api/v1/chat/completions', model: '' },
  'Groq':            { url: 'https://api.groq.com/openai/v1/chat/completions', model: '' },
  'Anthropic':       { url: 'https://api.anthropic.com/v1/messages', model: 'claude-sonnet-4-20250514' },
  'Google AI Studio':{ url: 'https://generativelanguage.googleapis.com/v1beta/openai/chat/completions', model: '' },
  'Mistral':         { url: 'https://api.mistral.ai/v1/chat/completions', model: '' },
  'SambaNova':       { url: 'https://api.sambanova.ai/v1/chat/completions', model: '' },
  'Together':        { url: 'https://api.together.xyz/v1/chat/completions', model: '' },
  'Fireworks':       { url: 'https://api.fireworks.ai/inference/v1/chat/completions', model: '' },
  'Cerebras':        { url: 'https://api.cerebras.ai/v1/chat/completions', model: '' },
};
