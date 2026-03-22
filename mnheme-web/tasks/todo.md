# Task: Multilingual i18n (EN/IT) for mnheme-web

## Plan
- [x] Step 1: Create `src/i18n/it.js` — Italian translation file with ALL hardcoded strings
- [x] Step 2: Create `src/i18n/en.js` — English translation file
- [x] Step 3: Create `src/i18n/index.jsx` — I18nProvider context + useI18n hook (localStorage persistence)
- [x] Step 4: Update `src/main.jsx` — Wrap App with I18nProvider
- [x] Step 5: Update all components and pages to use t() calls
- [x] Step 6: Add language selector to SettingsPage (new LanguageSelector component)
- [x] Step 7: Build and verify — `npm run build` — PASS (629 modules, 0 errors, 0 warnings)

## Progress Notes
- All hardcoded Italian/English strings extracted from 18 component/page files
- Created 3 new files: it.js (Italian), en.js (English), i18n/index.jsx (provider + hook)
- Created LanguageSelector.jsx component (uses theme-card style for consistency)
- SectionGuide guides use dangerouslySetInnerHTML for HTML tags in translations (bold, em, etc.)
- MemoryCard and Timeline now use locale-aware date formatting (it-IT vs en-GB)
- brain.js / constants.js LLM prompts left in Italian (they are AI instructions, not UI)
- FEELING_LABELS kept as English display names (they are data labels, not UI chrome)
- Default locale: 'it', persisted in localStorage as 'mnheme_locale'
- Grep confirmed zero hardcoded Italian strings remain in components/pages

## Review
- Build: PASS (vite v8.0.1, 629 modules, 0 errors)
- Files created: src/i18n/it.js, src/i18n/en.js, src/i18n/index.jsx, src/components/LanguageSelector.jsx
- Files modified: main.jsx, App.jsx (unchanged), Layout.jsx, Sidebar.jsx, SectionGuide.jsx, InstallBanner.jsx, Perceive.jsx, Remember.jsx, Reflect.jsx, Ask.jsx, Search.jsx, MemoryList.jsx, MemoryCard.jsx, Stats.jsx, Timeline.jsx, Graph.jsx, Summarize.jsx, Settings.jsx, ThemeSelector.jsx, ExportImport.jsx, HomePage.jsx, MemoriesPage.jsx, BrainPage.jsx, StatsPage.jsx, SettingsPage.jsx
