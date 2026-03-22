# Task: Transform mnheme-web into a PWA with Install Banner

## Plan
- [x] Step 1: Install vite-plugin-pwa dependency
- [x] Step 2: Configure vite.config.js with VitePWA plugin (manifest, service worker, workbox caching)
- [x] Step 3: Update index.html with apple-touch-icon meta tag
- [x] Step 4: Create InstallBanner.jsx component (beforeinstallprompt, Italian text, localStorage dismissal)
- [x] Step 5: Add InstallBanner CSS to index.css (diary aesthetic)
- [x] Step 6: Integrate InstallBanner into Layout.jsx
- [x] Step 7: Verify the build succeeds

## Progress Notes
- vite-plugin-pwa@1.2.0 installed with --legacy-peer-deps (peer dep declares up to vite 7, we use vite 8)
- Build succeeds — dist/ contains: manifest.webmanifest, sw.js, registerSW.js, workbox runtime
- vite-plugin-pwa auto-injects manifest link and SW registration script into built HTML

## Review
- All 7 steps completed and verified
- Build produces valid manifest, service worker, and registration script
- Manifest includes app name, icons (192/512/maskable), theme/bg colors, standalone display
- Service worker caches static assets (globPatterns) and Google Fonts (runtime caching)
- Install banner uses native beforeinstallprompt API with 7-day dismissal in localStorage
- Banner styled to match diary aesthetic (accent border-left, serif fonts, card shadow)
- Banner text in Italian as required
