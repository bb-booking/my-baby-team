# Melo Parents — CLAUDE.md

Projektinstruktioner til Claude Code. Denne fil læses automatisk i starten af hver session.

## Workflow — VIGTIGT

Hver gang vi laver kodeændringer køres disse trin i rækkefølge:

```bash
npm run build                          # byg React-koden → /dist
npx cap sync ios                       # kopiér dist ind i Xcode-projektet + generer Package.swift
xcodebuild -project ios/App/App.xcodeproj \
  -scheme App -configuration Release \
  -destination generic/platform=iOS \
  archive -archivePath /tmp/MeloApp.xcarchive   # bekræft lokal build
git add <ændrede filer>
git commit -m "beskrivelse"
git push origin main                   # trigger Xcode Cloud automatisk
```

### Xcode Cloud — VIGTIGT
- Xcode Cloud kører `ios/App/ci_scripts/ci_post_clone.sh` automatisk ved hvert build
- Scriptet kører `npm install` + `npx cap sync ios` på Apples servere (node_modules er ikke i git)
- Builds 26–34 fejlede fordi `.xcodeproj` og `ci_post_clone.sh` manglede — begge er nu i git
- iOS deployment target: **16.0** (ikke 26.4 — Xcode 26 satte det forkert automatisk)

### Første gang på ny Mac
```bash
sudo xcode-select -s /Applications/Xcode.app/Contents/Developer
```
Skal køres én gang for at `xcodebuild` virker fra terminal.

## Teknisk stack

- **Framework**: React + TypeScript + Vite
- **Styling**: Tailwind CSS + CSS custom properties
- **Native**: Capacitor (iOS via `ios/App/`)
- **Backend**: Supabase
- **i18n**: react-i18next (da + en)
- **Routing**: React Router

## Design system

### Farver (CSS custom properties i `src/index.css`)
- `--moss`: Forest green `#264236` = HSL `154 27% 20%` (primærfarve)
- `--sage`, `--sage-light`, `--sage-dark`: Hue 140 (harmonerer med moss)
- `--clay`: Varm terracotta (sekundær accent)
- `--bark`: Mørk brun
- `--cream`, `--warm-white`: Baggrunde i day mode

### Typografi
- **Serif** (overskrifter, `font-serif`): **Fraunces**
- **Sans** (brødtekst, default): **Inter**
- Loaded via Google Fonts i `src/index.css`

### Knapper
- Primære CTA-knapper: `rounded-full` (IKKE `rounded-xl`)
- Input-felter og kort: `rounded-xl` eller `rounded-2xl`

## App-ikoner
- iOS-ikonet ligger i `ios/App/App/Assets.xcassets/AppIcon.appiconset/AppIcon-512@2x.png`
- Skal være fuld bleed (grøn helt til kanten) — iOS clipper selv til rundet hjørne
- Opdateret: hvid kant fjernet april 2026

## Appstruktur

```
src/
  pages/          # sider (Dashboard, BarnPage, SammenPage, ...)
  components/     # genanvendelige komponenter
  context/        # FamilyContext (profile, tasks, diary-state)
  i18n/locales/   # da.json + en.json — ALTID opdater begge ved ny tekst
  lib/            # phaseData, utils
  hooks/          # custom hooks
  plugins/        # Capacitor plugins (liveActivity)
```

## FamilyContext — vigtige felter

```ts
profile.phase: "pregnant" | "newborn" | "baby"
profile.role: "mor" | "far"
profile.dueOrBirthDate: string  // ISO dato — fremtid = gravid, fortid = baby
profile.hasPartner: boolean
profile.languages: { mor: "da"|"en", far: "da"|"en" }
```

## i18n-regel

- Tilføj altid nye tekststrenge til **både** `da.json` og `en.json`
- Brug `t("nøgle")` og `t("nøgle", { variabel })` i komponenter
- Store indholdsarrays (DEV_STAGES, getLevelUpMessages) bruges inline med `en: boolean`-parameter

## Navigation (Bottom Nav)

5 tabs: Home `/` · Baby `/barn` · Chat `/chat` · Sammen `/sammen` · Mere `/mere`

- **Dagbog** ligger KUN under `/mere` (burger-menuen) — IKKE i bottom nav
- `/mere` er selve burger-menuen

## Live Activity / Søvntracker

- Implementeret via `src/plugins/liveActivity.ts`
- Virker KUN når skærmen er aktiv (WebView-begrænsning — se nedenfor)
- Søvntracking med låst skærm kræver native Swift background task — ikke implementeret endnu
