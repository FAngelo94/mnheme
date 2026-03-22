# Task: Full Upstream Sync from aatel-license/mnheme

## Plan
- [x] Phase 1: Get upstream file listing (73 blob files in upstream tree)
- [x] Phase 2: Get local file listing and compare
- [x] Phase 3: Download and sync ALL upstream files
  - [x] 3a: Compared all 22 shared text files via SHA-256 checksums
  - [x] 3b: Downloaded all 45+ new text files (apps/, generators, docs, i18n)
  - [x] 3c: Downloaded 3 new binary files (2 PDFs, 1 PNG)
  - [x] 3d: Handled special cases (fsprobe.py, start.sh kept local; index.html added alongside api.html)
- [x] Phase 4: Applied all changes — 0 checksum mismatches across all synced files
- [x] Phase 5: Verified mnheme-web builds clean (no core Python changes since last sync)

## Review

### Files UPDATED from upstream (4 files changed):
- `.env.example` — upstream had new content
- `README.md` — upstream had new content
- `localwebapp/api.css` — upstream had changes (77,149 bytes)
- `localwebapp/api.js` — upstream had changes (89,087 bytes)

### Files ADDED from upstream (49 new files):
- `.python-version` — Python 3.11
- `advanced_human_simulator_memories_generator.py` (40,088 bytes)
- `simple_memories_generator.py` (28,120 bytes)
- `localwebapp/i18n.js` (34,990 bytes)
- `localwebapp/index.html` (29,508 bytes) — upstream name for what was locally api.html
- `docs/README_advanced_human_simulator_memories_generator.md` (12,205 bytes)
- `docs/README_advanced_human_simulator_memories_generator.pdf` (376,902 bytes)
- `docs/README_simple_memories_generator.md` (8,013 bytes)
- `docs/README_simple_memories_generator.pdf` (302,619 bytes)
- `imgs/mnheme_eng_dark.png` (3,338,226 bytes)
- `apps/conversation_ingester/` — README.md, conversation_ingester.py
- `apps/drift/` — README.md, app.js, index.html, style.css
- `apps/echo/` — README.md, app.js, index.html, style.css
- `apps/memoria/` — README.md, app.js, index.html, style.css
- `apps/phantom_archive/` — README.md, app.js, index.html, style.css
- `apps/strata/` — README.md, app.js, index.html, style.css
- `apps/twin/` — README.md, digital_twin.py, twin_api.py, twin_ui.css, twin_ui.html, twin_ui.js, run.sh, 3 character profiles, mnheme.mnheme (copy)
- `apps/worldbrain/` — REDME.md, app.js, index.html, style.css

### Files UNCHANGED from upstream (17 files already in sync):
- brain.py, mnheme.py, storage.py, index.py, llm_provider.py, filestore.py
- mnheme_api.py, mnheme_benchmark.py, examples.py
- .gitignore, LICENSE.md, start.bat, violations
- test_fsprobe.py, test_integration.py, test_llm_provider.py, test_local_provider.py
- All binary images (mnheme.jpg, imgs/mnheme_dark.png, mnheme_light.png, mnheme_ultra_dark.png)

### Files KEPT with local patches (2 files):
- `fsprobe.py` — local has lazy `import fcntl` (Windows compat); upstream has top-level import
- `start.sh` — local has Windows paths (cygpath), Windows venv activation, PYTHONUTF8=1

### Files only local (preserved, not touched):
- `.env`, `.mnheme_api.pid`, `mnheme-web/`, `.claude/`, `docs/cognitive-functions.md`,
  `docs/llm-providers-free-tiers.md`, `logs/`, `mente.*`, `tasks/`, `__pycache__/`,
  `localwebapp/api.html` (kept alongside new index.html)

### Verification
- All 63 synced text files: SHA-256 checksum match with upstream (0 mismatches)
- All 3 new binary files: size match with upstream
- mnheme-web React app: `vite build` passes clean (56 modules, 0 errors)
