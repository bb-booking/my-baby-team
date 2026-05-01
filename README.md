# Melo Parents

En iOS-app til forældre i graviditet og det første år med baby.

## Stack
- React + TypeScript + Vite
- Tailwind CSS + CSS custom properties
- Capacitor (iOS)
- Supabase (backend + realtime)
- React Router + react-i18next (da/en)

## Lokal udvikling

```bash
npm install
npm run dev
```

## Byg til iOS

```bash
npm run build
npx cap sync ios
xcodebuild -project ios/App/App.xcodeproj -scheme App \
  -configuration Release -destination generic/platform=iOS \
  archive -archivePath /tmp/MeloApp.xcarchive
```

## Xcode Cloud
Push til `main` trigger automatisk et Xcode Cloud build.
`ios/App/ci_scripts/ci_post_clone.sh` installerer npm-pakker på CI-serveren.

## Design system
Se `CLAUDE.md` for farver, typografi og komponentregler.
