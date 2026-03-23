# Task: Add Export/Import for LLM Provider Configurations

## Plan
- [x] Step 1: Add `importProviders` function to `useSettings.js` hook (accepts an array, validates, assigns fresh IDs, persists)
- [x] Step 2: Add export/import UI section at bottom of `Settings.jsx` (export button, file input, status messages, API key warning)
- [x] Step 3: Add i18n strings to `en.js` and `it.js` for all new UI text
- [x] Step 4: Verify correctness — review all changes for bugs, missing translations, style consistency

## Design Decisions
- Export: download all providers as JSON array, filename `mnheme-providers.json`
- Import: validate that parsed JSON is an array of objects with required shape, assign fresh IDs to avoid collisions, REPLACE current providers
- Reuse existing CSS classes: `form-card`, `form-actions`, `btn-primary`, `response-area`, `guide-note`, `field`
- No new CSS needed — existing classes cover everything
- Security warning uses `guide-note` style (amber left-border callout)
- Follow ExportImport.jsx patterns for file handling, status messages, blob download

## Progress Notes
- Step 1: Added `importProviders` to useSettings.js — maps each item through `newProvider()` to get fresh IDs, persists via `persist()`
- Step 2: Added export/import section in Settings.jsx with export button (disabled when no providers), file input, validation, status messages, and API key warning
- Step 3: Added 12 translation keys to both en.js and it.js
- Step 4: Build verified (629 modules, 0 errors). All 12 i18n keys confirmed present in both language files.

## Review
- **useSettings.js**: Added `importProviders(list)` function — sanitizes each provider through `newProvider()`, assigns fresh IDs, persists to localStorage. Returned from hook.
- **Settings.jsx**: Added `useRef` import, `fileRef`, `exportImportStatus` state, `handleExportProviders` (blob download), `handleImportProviders` (file read + validate + import). UI section at bottom with guide-note warning, export button, file input, and response-area status.
- **en.js**: 12 new strings under `settings.*` namespace
- **it.js**: 12 new strings under `settings.*` namespace (Italian translations)
- No new CSS files or classes needed — reused existing `form-card`, `guide-note`, `form-actions`, `btn-primary`, `field`, `response-area`
- Build: 0 errors
