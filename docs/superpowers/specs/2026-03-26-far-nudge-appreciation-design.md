# Design: "Vis hende du ser det" — Father Appreciation Nudge System

**Date:** 2026-03-26
**Project:** our-family-compass (bb-booking/our-family-compass)
**Area:** Collaboration / Partner relationship

---

## Problem

New mothers in the postpartum period frequently report feeling **invisible** — not because of sleep deprivation, but because their invisible labor goes unacknowledged. The baby cannot say thank you. Fathers often want to help but don't know how, creating paralysis.

The right approach: **educate and nudge the father** to notice and act proactively, without the mother having to ask. Equally, fathers are under pressure too — the feature must motivate and acknowledge him, never add guilt.

---

## Solution Overview

A daily, scheduled appreciation nudge on the **father's dashboard only**. One nudge per day from a curated library. The mother never sees the prompt — she only experiences the result.

Each nudge has two text layers:
- **`body`** — what to do and why it matters for her (~2 sentences)
- **`credit`** — affirming text about who he is when he does it (~1 sentence, rendered green italic)

The feature includes a compassionate skip message and a pause option for rough patches.

---

## Architecture

### New files

**`src/lib/nudgeData.ts`**

```ts
export interface FarNudge {
  id: string;
  emoji: string;
  title: string;
  body: string;      // What to do + why it matters. ~2 sentences.
  credit: string;    // Who he is when he chooses to do this. ~1 sentence, green italic in UI.
  category: 'gave' | 'ord' | 'handling' | 'frirum' | 'detalje';
  phase: 'newborn' | 'baby' | 'all';  // 'pregnant' deferred to v2
}

export interface NudgeLogEntry {
  // MUST be produced via new Date().toLocaleDateString('sv') — always YYYY-MM-DD.
  // Never store a JS Date object or ISO timestamp here.
  date: string;
  nudgeId: string;   // references FarNudge.id
  status: 'done' | 'skipped';
}

export interface NudgePause {
  until: string | null;  // YYYY-MM-DD local date (exclusive upper bound), or null = indefinite
  pausedAt: string;      // YYYY-MM-DD local date
}

// Returns today's scheduled nudge. Deterministic for the full calendar day.
// Does NOT consult the log — scheduling is index-based only (intentional: predictable, simple).
// Throws Error if eligible pool is empty (should never happen post-assertion).
export function getTodayNudge(phase: 'newborn' | 'baby'): FarNudge

// Returns tomorrow's scheduled nudge for the tomorrow-peek UI.
export function getTomorrowNudge(phase: 'newborn' | 'baby'): FarNudge

// Streak = consecutive calendar days (going backward from today) with status 'done'.
// A 'skipped' entry OR a day with no entry breaks the streak.
// If today has no entry yet, streak is calculated from yesterday backward.
// One entry per date (last-write-wins). See log deduplication rule below.
export function getStreakCount(log: NudgeLogEntry[]): number

// Count of unique dates with status 'done' in the current ISO calendar week (Mon–Sun local).
// Uses the week containing today at call time.
export function getWeeklyDoneCount(log: NudgeLogEntry[]): number

// Pure function. Returns true if pause is active.
// Semantics: paused UNTIL 'until' date (exclusive) — user resumes ON the until date.
// todayStr < until → still paused. todayStr >= until → expired.
// Does NOT mutate state.
export function isPaused(pause: NudgePause | null): boolean
```

**Implementations:**

```ts
// UTC day index — stable across timezones because 'sv' locale always produces ISO 8601
// date string, which new Date() parses as UTC midnight. The resulting epoch-day index
// is therefore consistent globally. Add this comment in source to prevent future "fixes".
function utcDayIndex(): number {
  const todayStr = new Date().toLocaleDateString('sv'); // e.g. "2026-03-26"
  return Math.floor(new Date(todayStr).getTime() / (1000 * 60 * 60 * 24));
}

function getScheduledNudge(phase: 'newborn' | 'baby', offsetDays = 0): FarNudge {
  const eligible = nudges.filter(n => n.phase === phase || n.phase === 'all');
  // This should never be zero after module-level assertion, but guard defensively:
  if (eligible.length === 0) throw new Error(`Empty nudge pool for phase: ${phase}`);
  return eligible[(utcDayIndex() + offsetDays) % eligible.length];
}

export const getTodayNudge    = (phase: 'newborn' | 'baby') => getScheduledNudge(phase, 0);
export const getTomorrowNudge = (phase: 'newborn' | 'baby') => getScheduledNudge(phase, 1);

export function isPaused(pause: NudgePause | null): boolean {
  if (pause === null) return false;
  if (pause.until === null) return true; // indefinite
  const todayStr = new Date().toLocaleDateString('sv');
  return todayStr < pause.until; // paused until exclusive upper bound
}

export function getStreakCount(log: NudgeLogEntry[]): number {
  const todayStr = new Date().toLocaleDateString('sv');
  const doneSet = new Set(log.filter(e => e.status === 'done').map(e => e.date));
  let streak = 0;
  // If today has no done entry yet, start counting from yesterday
  const startDate = new Date(doneSet.has(todayStr)
    ? todayStr
    : (() => { const d = new Date(todayStr); d.setDate(d.getDate() - 1); return d.toLocaleDateString('sv'); })()
  );
  let cursor = startDate;
  while (true) {
    const dateStr = cursor.toLocaleDateString('sv');
    if (doneSet.has(dateStr)) {
      streak++;
      cursor.setDate(cursor.getDate() - 1); // JS Date handles DST correctly for calendar days
    } else {
      break;
    }
  }
  return streak;
}

export function getWeeklyDoneCount(log: NudgeLogEntry[]): number {
  // ISO week: Mon–Sun. All comparisons use YYYY-MM-DD strings (sv locale) for consistency.
  const todayStr = new Date().toLocaleDateString('sv');
  const today = new Date(todayStr); // parsed as UTC midnight — consistent with utcDayIndex
  const daysFromMonday = (today.getUTCDay() + 6) % 7; // Mon=0 … Sun=6
  const monday = new Date(today);
  monday.setUTCDate(today.getUTCDate() - daysFromMonday);
  const sunday = new Date(monday);
  sunday.setUTCDate(monday.getUTCDate() + 6);
  const mondayStr = monday.toLocaleDateString('sv');
  const sundayStr = sunday.toLocaleDateString('sv');

  // Count unique dates with 'done' in [mondayStr, sundayStr] — string comparison is safe for YYYY-MM-DD
  return new Set(
    log
      .filter(e => e.status === 'done' && e.date >= mondayStr && e.date <= sundayStr)
      .map(e => e.date)
  ).size;
}
```

**Module-level assertion (dev + production, non-crashing):**
```ts
const newbornPool = nudges.filter(n => n.phase === 'newborn' || n.phase === 'all');
const babyPool    = nudges.filter(n => n.phase === 'baby'    || n.phase === 'all');
if (newbornPool.length < 30 || babyPool.length < 30) {
  console.error(`[nudgeData] Pool too small: newborn=${newbornPool.length}, baby=${babyPool.length}. Minimum 30 required.`);
  // Does NOT throw — degraded experience (potential repetition) is preferable to app crash.
}
```

**`src/components/FarNudgeCard.tsx`**

Props:
```ts
interface FarNudgeCardProps {
  phase: 'newborn' | 'baby';
  morName: string;   // used in affirming done-messages e.g. "Det ser [morName]."
}
```

Reads from localStorage: `melo-far-nudges`, `melo-far-nudge-pause`, `melo-far-nudge-milestones`.

**Error boundary:** Component wraps its render in a try/catch. If `getTodayNudge` throws, the component returns `null` silently (no crash, no visible card).

**Log deduplication rule:** The log is append-only. Before appending a new entry, remove any existing entry for the same date: `log.filter(e => e.date !== todayStr)`. This enforces one active entry per date (last-write-wins). A user can therefore change from skipped to done within the same day (unlikely UX but handled).

**Pause auto-clear (mount only — v1 limitation):**
```ts
useEffect(() => {
  const stored = localStorage.getItem('melo-far-nudge-pause');
  if (!stored) return;
  const pause: NudgePause = JSON.parse(stored);
  const todayStr = new Date().toLocaleDateString('sv');
  if (pause.until !== null && pause.until <= todayStr) {
    localStorage.removeItem('melo-far-nudge-pause');
  }
}, []);
```
**Accepted v1 limitation:** If the app is left open overnight (no remount), the paused state persists until the user navigates away and back. A page reload always clears an expired pause. This is acceptable for a mobile-first daily-use app.

**Midnight / live-session date change:** `isPaused()` and `getTodayNudge()` are called on each render. If the app remains open past midnight with no navigation, the displayed nudge and pause state may be stale until next render trigger. Accepted v1 limitation — same pattern as existing `NærværTips` and check-in features.

### Modified files

**`src/pages/Dashboard.tsx`**
`profile.phase` and `morName` come from `useFamily()`. Render `<FarNudgeCard phase={profile.phase as 'newborn' | 'baby'} morName={morName} />` when `profile.role === "far"` and `profile.phase` is `"newborn"` or `"baby"`. Positioned above task list.

**`src/pages/SammenPage.tsx`**
`SammenPage` reads `melo-far-nudge-pause` from localStorage directly (or via a shared hook) and calls `isPaused()` to gate the weekly count card. It does not depend on `FarNudgeCard` for pause state. Render weekly count card when `profile.role === "far"` AND `!isPaused(pause)`. Zero-state ("Ny uge — ny chance 💛") visible from the user's very first session.

### localStorage keys

| Key | Type | Notes |
|-----|------|-------|
| `melo-far-nudges` | `NudgeLogEntry[]` | One entry per date (last-write-wins) |
| `melo-far-nudge-pause` | `NudgePause \| null` | null = not paused |
| `melo-far-nudge-milestones` | `string[]` | Dismissed milestone keys; one-time-per-key forever |

All dates: `new Date().toLocaleDateString('sv')` → `"2026-03-26"`

---

## Role detection

`profile.role` from `FamilyContext` / `localStorage` key `lille-family`. Set during onboarding.

**Shared device:** Card respects active role. Accepted v1 limitation.
**Same-sex/non-binary:** Deferred to v2.

---

## Nudge Library (45 entries)

Target: 15 `newborn` + 15 `baby` + 15 `all` = 45 total.
Newborn pool: 30. Baby pool: 30. Both ≥ 30. ✓

### Categories

| Key | Label | Description |
|-----|-------|-------------|
| `gave` | 🌸 Gave | Small physical gifts, no planning required |
| `ord` | 💬 Ord | Specific words of affirmation, said out loud |
| `handling` | 🤲 Handling | Proactive acts of care without being asked |
| `frirum` | 🎁 Frirum | Giving her unasked-for time and space |
| `detalje` | ✨ Detalje | Noticing and naming something specific she did |

### Newborn (15 entries)

| id | emoji | title | body | credit |
|----|-------|-------|------|--------|
| `n-01` | 🌸 | Tag blomster med hjem i dag | Ingen grund nødvendig — det er netop pointen. Hun har givet alt til babyen i dag. | Mænd der gør den slags ting vælger det aktivt. Det er dig. |
| `n-02` | 💬 | Sig det højt: "Du er den bedste mor" | Barnet kan ikke sige det. Det kan du — i dag. | Fædre der siger det højt og mener det er sjældne. Du er en af dem. |
| `n-03` | 🥤 | Bring vand og en snack næste gang hun ammer | Hun sidder stille og giver alt til barnet. Sørg for hun har noget at drikke og spise. | Mænd der lægger mærke til den slags øjeblikke — dem husker man. |
| `n-04` | 🎁 | Tag babyen i 2 timer. Sig: "Du skal bare hvile" | Ikke fordi du bliver bedt om det. Tag bare over uden spørgsmål. | Den slags far tager ansvar uden at tælle point. Det er dig. |
| `n-05` | ✨ | Nævn én ting hun konkret har gjort for babyen i dag | Generel ros er let. At se én bestemt ting kræver nærvær. | Det er den slags opmærksomhed parforhold overlever på. |
| `n-06` | 💬 | Send hende en besked midt på dagen: "Jeg er stolt af dig" | Ikke om logistik. Bare hende. | Du ser hende som person — ikke kun som medforælder. Det mærkes. |
| `n-07` | 🤲 | Tag hele aftenroutinen i dag | Bad, aftensmad, putning — det hele. Inden hun overhovedet spørger. | Fædre der handler uden at blive bedt om det — dem fortæller man om med varme år efter. |
| `n-08` | 🎁 | Book en eftermiddag hun kan bruge på sig selv | Pasningen er din. Hun finder selv ud af hvad hun vil gøre med tiden. | Du ved hvad hun har brug for inden hun siger det. Det er nærvær. |
| `n-09` | 💬 | Sig: "Du er utrolig. Jeg ser hvad du gør." | Ikke som svar på noget. Bare fordi det er sandt. | Ord der kommer uden grund har mere vægt end dem der bliver bedt om. |
| `n-10` | 🤲 | Stå op til den næste nattevagt — uden at hun spørger | Sæt en alarm. Tag den. Lad hende sove. | Det er ikke et offer. Det er hvem du er som far. |
| `n-11` | ✨ | Læg mærke til at hun er træt — og sig det højt | "Jeg kan se du har haft en hård dag. Hvad kan jeg gøre?" | At spørge i stedet for at vente er en styrke. |
| `n-12` | 🌸 | Køb noget til hende — ikke til barnet, til hende | En bog, hendes yndlingschokolade, noget der er hende. | Du husker hvem hun er udover at være mor. Det er større end du tror. |
| `n-13` | 🤲 | Ryd op mens hun hviler — sig ingenting om det | Bare gør det. Ingen kredit, ingen kommentar. | Stille handlinger uden forventning om tak er kærlighed i sin reneste form. |
| `n-14` | 💬 | Skriv en lille note og læg den et sted hun finder den | "Jeg er glad for at gøre dette med dig." Tre linjer er nok. | En note siger at du tænkte på hende — selv når ingen så det. |
| `n-15` | 🎁 | Giv hende en time alene i morgen tidlig | Sig det aftenen før: "I morgen morges har du fri." | Du planlægger hendes pause inden hun beder om den. Det er omsorg. |

### Baby (15 entries)

| id | emoji | title | body | credit |
|----|-------|-------|------|--------|
| `b-01` | 🌸 | Tag blomster med hjem i dag | Ingen grund nødvendig. Hun har givet alt — og hun fortjener at blive set. | Mænd der gør den slags ting vælger det aktivt. Det er dig. |
| `b-02` | 💬 | Sig: "Du er en fantastisk mor for vores barn" | Barnet kan ikke sige det endnu. Men du kan. | Fædre der siger det og mener det — dem husker børn. |
| `b-03` | 🤲 | Tag hele aftenroutinen alene i aften | Bad, aftensmad, putning. Sæt hende fri — ingen diskussion. | Du giver hende en aften tilbage. Det husker hun. |
| `b-04` | ✨ | Nævn én ting hun har gjort godt som mor denne uge | Vær specifik: ikke "du er god" men "jeg så at du..." | Synlighed er kærlighed. Du ser hende. |
| `b-05` | 🎁 | Book en aftale kun for hende — frisør, veninde, noget hun nyder | Pasningen er din. Ingen spørgsmål. | Du giver hende tid til at være sig selv. Det er en gave. |
| `b-06` | 💬 | Send en besked i dag: "Jeg er glad for at være far med dig" | Ikke om barnet. Om jer. | I er stadig et par. En sætning kan minde hende om det. |
| `b-07` | 🤲 | Lav aftensmad i aften — og ryd op bagefter | Tre handlinger i én aften. Uden at gøre det til en sag. | Det er nærvær i praksis. |
| `b-08` | 🌸 | Køb hendes yndlingssnack på vej hjem | Lille og uventet — ingen grund. | Det er den slags detaljer kærlighed er lavet af. Du husker dem. |
| `b-09` | ✨ | Spørg hende: "Hvad har du brug for fra mig denne uge?" | Og lyt. Skriv det ned hvis du skal. | At spørge i stedet for at gætte er modenhed. Det er dig. |
| `b-10` | 💬 | Sig det højt mens I spiser: "Du er min yndlingsperson" | Barnet hører det. Det er også godt. | Du viser dit barn hvad kærlighed ser ud. |
| `b-11` | 🤲 | Tag barnet en hel eftermiddag — hun skal ingenting | Ikke "ring hvis du har brug for hjælp." Bare tag over. | Den slags far bygger tryghed — i barnet og i hende. |
| `b-12` | 🌸 | Bestil hendes yndlingsrestaurant til en aften næste uge | Planlæg det. Book det. Fortæl hende. | Du investerer i jer to. Det er ikke småting. |
| `b-13` | ✨ | Læg mærke til noget nyt barnet kan — og giv hende æren | "Det er fordi du har arbejdet så meget med det." | Du deler glæden og giver hende kredit. Begge dele tæller. |
| `b-14` | 🎁 | Giv hende en morgen i sengen | Stå op med barnet. Luk døren. Lad hende sove. | En times ekstra søvn kan ændre hele hendes dag. Du ved det. |
| `b-15` | 💬 | Skriv tre ting du sætter pris på ved hende — og læs dem op | Ikke generelt. Tre specifikke ting fra den seneste uge. | At sætte ord på hvad man holder af kræver mod. Du har det. |

### All phases (15 entries)

| id | emoji | title | body | credit |
|----|-------|-------|------|--------|
| `a-01` | 🍫 | Køb hendes yndlingssnack | Lille og uventet — ingen grund. | Det viser at du tænker på hende midt i hverdagen. Det gør du. |
| `a-02` | ☕ | Lav kaffe til hende — uden at sige et ord | Sæt den bare ved siden af hende. Sig ingenting. | Små handlinger uden forventning om tak er nærvær i sin reneste form. |
| `a-03` | 🤲 | Tag alle huslige opgaver i dag | Ingen kommentar, ingen liste, ingen kredit. Bare gør det. | Det er den slags handling der opbygger tillid over tid — mere end store gester. |
| `a-04` | 💬 | Sig: "Jeg er glad for at gøre dette med dig" | I er stadig et par — ikke kun forældre. | En sætning der minder hende om det kan ændre hele hendes dag. Du valgte at sige den. |
| `a-05` | 🎁 | Giv hende en time alene — uden at blive bedt | Sig det direkte: "Jeg har styr på det — tag den tid du vil." | Du ved hvad hun har brug for inden hun siger det. Det er nærvær. |
| `a-06` | 🌸 | Tag blomster med hjem i dag | Bare fordi du kan. | Mænd der gør den slags ting er ikke født til det. De vælger det. |
| `a-07` | 💬 | Ring til hende midt på dagen — bare for at høre hendes stemme | Ikke om praktik. Bare hende. | Du viser at hun er i dine tanker selv når I ikke er sammen. |
| `a-08` | ✨ | Sig én konkret ting du beundrer ved hende som person | Ikke "du er god til det hele" — men én ting, specifik. | At se et menneske præcist er en gave. Du giver den. |
| `a-09` | 🤲 | Tag morgenen alene med barnet i morgen | Stå op. Tag over. Lad hende sove eller have ro. | Det koster dig en times søvn. Det giver hende meget mere. |
| `a-10` | 💬 | Skriv: "Jeg er stolt af os" | To ord der siger at I er et team — og at du ser det. | Du holder øje med jeres forhold. Det er ikke givet. |
| `a-11` | 🌸 | Bestil noget hun vil nyde — noget hun selv nævnte engang | Du lytter. Det viser sig i de ting du husker. | Opmærksomhed er kærlighed i handling. |
| `a-12` | 🎁 | Giv hende en aften med vennerne — pasningen er din | Book det for hende hvis du skal. Ingen spørgsmål. | Du minder hende om at hun er mere end mor. Det er en gave. |
| `a-13` | ✨ | Spørg: "Hvad var det sværeste ved din dag?" — og lyt | Ingen løsninger. Bare lyt og vær til stede. | At modtage et menneskes dag uden at fikse det er en styrke. |
| `a-14` | 🤲 | Lav hendes yndlingsret til aftensmad | Ikke fordi det er din tur. Fordi du ville. | Handlinger uden grund er dem der betyder mest. |
| `a-15` | 💬 | Sig det hun ikke hører nok: "Du er en god mor" | Simpelt. Direkte. Ment. | Det koster ingenting og betyder alt. Du sagde det. |

---

## Component: `FarNudgeCard`

### Props
```ts
interface FarNudgeCardProps {
  phase: 'newborn' | 'baby';
  morName: string;
}
```

### Error boundary
If `getTodayNudge()` throws, the component returns `null`. App does not crash.

### Four visual states

**Active**
- Warm cream/sand gradient
- Emoji + `title` (large)
- `body` text (dark) + `credit` text (green italic)
- "Det gør jeg ✓" → logs `{ date: todayStr, nudgeId, status: 'done' }` (dedup first)
- "Ikke i dag" → logs `{ date: todayStr, nudgeId, status: 'skipped' }` (dedup first)
- Tomorrow-peek: `getTomorrowNudge(phase).emoji + .title` (subtle)

**Done today**
- Affirming message selected by `utcDayIndex() % 4`:
  1. `"Du er den slags far der gør en forskel. 💛"`
  2. `"Det kræver ingenting at lade være. Du valgte at gøre det. Det ser ${morName}."`
  3. `"Stærkt. Sådan bygger man noget varigt."`
  4. `"Den slags far er du nu. Barnet vokser op og ser det."`
- Streak milestone badge if applicable (see below)
- Tomorrow-peek (more prominent than active state)

**Skipped**
- Message: "Det er helt okay. Du gør allerede meget mere end du tror. I morgen er en ny chance."
- Tomorrow-peek
- Quiet text link: "Har du brug for en pause fra forslagene?" → opens pause dialog

**Paused**
- "Du er på pause"
- If timed: "Forslagene vender tilbage [formatted `until` date]"
- "At passe på sig selv er også at passe på familien."
- "Søvnmangel og pres kan gøre det svært at give af sig selv. Det er normalt — og det går over."
- "Jeg er klar igen" → calls `localStorage.removeItem('melo-far-nudge-pause')` and re-renders to Active state
- No tomorrow-peek (deliberate — irrelevant while paused)

### Streak milestone badge

Shown in Done state only.

Milestone keys: `"streak-3"`, `"streak-7"`, `"streak-14"`

Logic:
```ts
const streak = getStreakCount(log);
const milestoneMap = { 3: 'streak-3', 7: 'streak-7', 14: 'streak-14' } as const;
const key = milestoneMap[streak as keyof typeof milestoneMap] ?? null;
const dismissed: string[] = JSON.parse(localStorage.getItem('melo-far-nudge-milestones') || '[]');
const showMilestone = key !== null && !dismissed.includes(key);
```

**One-time-per-key forever:** Once dismissed, the key remains in the dismissed array permanently. If the user loses the streak and re-earns it, the milestone is not shown again. This is intentional — milestones are achievements, not repeating rewards.

Milestone badge texts:
| Key | Text |
|-----|------|
| `streak-3` | "3 dage i træk 🌱 Du er ved at blive den far du gerne vil være" |
| `streak-7` | "En hel uge 💛 Det her er ikke tilfældigt — det er dig" |
| `streak-14` | "14 dage 🌿 Den slags far er du. Det ser hun." |

Dismiss on tap: append key to `melo-far-nudge-milestones`.

### Pause dialog

Triggered from skip state quiet link.

Options:
| Label | `until` value |
|-------|--------------|
| "3 dage" | `todayStr + 3 days` |
| "En uge" | `todayStr + 7 days` |
| "Indtil jeg slår til igen" | `null` |

Writes `{ until, pausedAt: todayStr }` to `melo-far-nudge-pause`.

---

## SammenPage Integration

Shown when `profile.role === "far"` AND `!isPaused(pause)`.

**Zero-state (count = 0, including first-ever session):** "Ny uge — ny chance 💛" — visible from day one.
**Paused:** Section hidden entirely (no zero-state guilt).

```
Opmærksomhed denne uge
[Name] har markeret [N] handlinger 💛
● ● ○ ○ ○ ○ ○   (Mon–Sun dots, filled = done that day)
```

---

## Accepted v1 limitations

| Limitation | Notes |
|-----------|-------|
| Stale state on open-overnight session | Nudge/pause state updates on next render trigger. Acceptable for daily-use mobile app. |
| Phase transition mid-cycle | No onboarding nudge at newborn→baby transition. dayIndex continues uninterrupted. |
| Shared device | Nudge card visible to whoever has the far role active. ProfileSwitcher workaround. |
| Milestone not re-shown after streak loss | One-time-per-key forever. Intentional. |
| No cross-device sync | SammenPage count only on father's own device. |

---

## Out of scope (v1)

- Pregnant phase nudges
- Backend sync / cross-device visibility
- Push notifications
- Gender-neutral / same-sex couple roles
- Mother-facing nudges (v2)

---

## Success criteria

| Criterion | How to verify |
|-----------|---------------|
| One stable nudge per calendar day | `getTodayNudge()` called at 00:01 and 23:59 same date returns same value |
| No repeats within 30 days | `newbornPool.length >= 30` logged at module init |
| No nudge UI on mother's dashboard | Render with `role = "mor"` → `FarNudgeCard` absent |
| Log persists across reload | `melo-far-nudges` in localStorage survives page reload |
| Timed pause auto-clears on mount | Set `until = yesterday` → remount → card shows Active state |
| Expired pause does not clear mid-session | Set `until = yesterday`, mount, leave open past midnight → state unchanged until next mount |
| Milestone shown once only | Reach streak-3, dismiss → lose streak → re-earn streak-3 → badge not shown |
| Zero-state weekly card visible day one | New user, no log → SammenPage shows "Ny uge — ny chance 💛" |
| Skipped does not count toward streak | Log skipped 5 days → `getStreakCount` returns 0 |

---

## Files changed

| File | Change |
|------|--------|
| `src/lib/nudgeData.ts` | New — 45-entry library + all helper functions with full implementations |
| `src/components/FarNudgeCard.tsx` | New — 4-state card, streak, milestone, pause dialog, error boundary |
| `src/pages/Dashboard.tsx` | Add `<FarNudgeCard />` for far role, newborn/baby phase |
| `src/pages/SammenPage.tsx` | Add weekly count section for far role, not paused |
