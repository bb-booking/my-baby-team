import { useState, useRef } from "react";
import { useFamily } from "@/context/FamilyContext";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { Heart, X, RotateCcw, Plus, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useEffect } from "react";

// ── Curated Danish names ───────────────────────────────────────────────────

const NAMES_PIGE = [
  "Alma","Freja","Ella","Clara","Emma","Olivia","Maja","Isabella","Sofia","Victoria",
  "Anna","Agnes","Nora","Astrid","Lærke","Ida","Sara","Emilie","Laura","Mathilde",
  "Josefine","Karoline","Cecilie","Julie","Camille","Sofie","Amalie","Katrine","Line",
  "Helena","Aurora","Frida","Nova","Mia","Luna","Elise","Nanna","Asta","Filippa",
  "Ronja","Sigrid","Ellen","Liva","Signe","Tuva","Ingrid","Birthe","Rosa","Vera","Klara",
];

const NAMES_DRENG = [
  "Noah","Elias","Oliver","William","Alfred","Viktor","Emil","Viggo","Magnus","Liam",
  "Alexander","Sebastian","Mikkel","Christian","Lucas","Marcus","Tobias","Mathias",
  "Jonas","Simon","Rasmus","Frederik","Oscar","Benjamin","Malthe","Elliot","Theo",
  "Thor","Axel","Felix","Hugo","Mads","Adam","Kasper","Nikolaj","Daniel","Jakob",
  "Villads","Bertram","Tristan","Augustin","Konrad","Birk","Søren","Kai","Emil",
  "Anton","Carl","Hans","Valdemar","Ludvig",
];

type Gender = "pige" | "dreng" | "begge";
type View = "swipe" | "matches" | "custom";

const LIKES_KEY = (role: string) => `melo-name-likes-${role}`;
const SEEN_KEY  = (role: string) => `melo-name-seen-${role}`;

function loadArr(key: string): string[] {
  try { return JSON.parse(localStorage.getItem(key) || "[]"); } catch { return []; }
}
function saveArr(key: string, arr: string[]) {
  localStorage.setItem(key, JSON.stringify(arr));
}

// ── Sync likes to Supabase partner profile ─────────────────────────────────

async function pushLikesToSupabase(userId: string, likes: string[]) {
  await supabase.from("profiles").update({ active_need: { nameLikes: likes } as any }).eq("user_id", userId);
}

async function fetchPartnerLikes(familyId: string, myUserId: string): Promise<string[]> {
  const { data } = await supabase
    .from("profiles")
    .select("user_id, active_need")
    .eq("family_id", familyId)
    .neq("user_id", myUserId);
  if (!data || data.length === 0) return [];
  const partner = data[0];
  return (partner.active_need as any)?.nameLikes ?? [];
}

// ── Swipe card ─────────────────────────────────────────────────────────────

function NameCard({ name, onLike, onSkip, isTop }: {
  name: string; onLike: () => void; onSkip: () => void; isTop: boolean;
}) {
  const [dir, setDir] = useState<"left" | "right" | null>(null);

  const animate = (d: "left" | "right", cb: () => void) => {
    setDir(d);
    setTimeout(() => { setDir(null); cb(); }, 280);
  };

  return (
    <div
      className="absolute inset-0 flex flex-col items-center justify-center rounded-3xl transition-all duration-280"
      style={{
        background: "hsl(var(--warm-white))",
        border: "1.5px solid hsl(var(--stone-light))",
        transform: dir === "right" ? "translateX(110%) rotate(15deg)"
          : dir === "left"  ? "translateX(-110%) rotate(-15deg)"
          : isTop ? "scale(1)" : "scale(0.95) translateY(12px)",
        opacity: isTop ? 1 : 0.5,
        zIndex: isTop ? 2 : 1,
        pointerEvents: isTop ? "auto" : "none",
      }}
    >
      <p className="text-[3.2rem] font-light tracking-tight" style={{ color: "hsl(var(--bark))" }}>{name}</p>

      <div className="flex gap-6 mt-10">
        <button
          onClick={() => animate("left", onSkip)}
          className="w-16 h-16 rounded-full flex items-center justify-center transition-all active:scale-90 shadow-sm"
          style={{ background: "hsl(var(--stone-lighter))", border: "1.5px solid hsl(var(--stone-light))" }}
        >
          <X className="w-7 h-7 text-muted-foreground" />
        </button>
        <button
          onClick={() => animate("right", onLike)}
          className="w-16 h-16 rounded-full flex items-center justify-center transition-all active:scale-90 shadow-sm"
          style={{ background: "hsl(var(--clay-light))", border: "1.5px solid hsl(var(--clay))" }}
        >
          <Heart className="w-7 h-7" style={{ color: "hsl(var(--bark))" }} />
        </button>
      </div>
    </div>
  );
}

// ── Main page ──────────────────────────────────────────────────────────────

export default function BabynavnePage() {
  const { profile } = useFamily();
  const { user } = useAuth();
  const role = profile.role;
  const isMor = role === "mor";
  const accentBg   = isMor ? "hsl(var(--clay-light))"  : "hsl(var(--sage-light))";
  const accentText = isMor ? "hsl(var(--bark))"         : "hsl(var(--moss))";
  const accentSolid= isMor ? "hsl(var(--clay))"         : "hsl(var(--moss))";
  const accentSolidText = isMor ? "hsl(var(--bark))"   : "white";

  const [gender, setGender] = useState<Gender>("begge");
  const [view, setView] = useState<View>("swipe");
  const [likes, setLikes] = useState<string[]>(() => loadArr(LIKES_KEY(role)));
  const [seen,  setSeen]  = useState<string[]>(() => loadArr(SEEN_KEY(role)));
  const [partnerLikes, setPartnerLikes] = useState<string[]>([]);
  const [newName, setNewName] = useState("");
  const [customNames, setCustomNames] = useState<string[]>(() => loadArr("melo-names-custom"));
  const [matchAnim, setMatchAnim] = useState<string | null>(null);

  // Fetch partner likes from Supabase
  useEffect(() => {
    if (!user || !profile.familyId) return;
    fetchPartnerLikes(profile.familyId, user.id).then(setPartnerLikes);
  }, [user, profile.familyId, view]);

  // Sync my likes to Supabase
  useEffect(() => {
    if (!user) return;
    pushLikesToSupabase(user.id, likes);
  }, [likes, user]);

  const pool = [
    ...(gender === "pige"  ? NAMES_PIGE  :
        gender === "dreng" ? NAMES_DRENG :
        [...NAMES_PIGE, ...NAMES_DRENG]),
    ...customNames,
  ].filter(n => !seen.includes(n));

  const remaining = pool.length;
  const topName   = pool[0] ?? null;
  const nextName  = pool[1] ?? null;

  const matches = likes.filter(n =>
    partnerLikes.includes(n) || customNames.includes(n) // custom always "match"
  );

  const handleLike = () => {
    if (!topName) return;
    const newLikes = [...likes, topName];
    const newSeen  = [...seen, topName];
    setLikes(newLikes); saveArr(LIKES_KEY(role), newLikes);
    setSeen(newSeen);   saveArr(SEEN_KEY(role), newSeen);
    if (partnerLikes.includes(topName)) {
      setMatchAnim(topName);
      setTimeout(() => setMatchAnim(null), 2500);
    }
  };

  const handleSkip = () => {
    if (!topName) return;
    const newSeen = [...seen, topName];
    setSeen(newSeen); saveArr(SEEN_KEY(role), newSeen);
  };

  const handleReset = () => {
    setSeen([]); saveArr(SEEN_KEY(role), []);
  };

  const addCustom = () => {
    if (!newName.trim()) return;
    const n = newName.trim();
    const updated = [...customNames, n];
    setCustomNames(updated);
    saveArr("melo-names-custom", updated);
    const newLikes = [...likes, n];
    setLikes(newLikes); saveArr(LIKES_KEY(role), newLikes);
    setNewName("");
  };

  const removeCustom = (n: string) => {
    const updated = customNames.filter(c => c !== n);
    setCustomNames(updated);
    saveArr("melo-names-custom", updated);
    const newLikes = likes.filter(l => l !== n);
    setLikes(newLikes); saveArr(LIKES_KEY(role), newLikes);
  };

  const partnerName = profile.partnerName || (isMor ? "Far" : "Mor");
  const hasPartner  = profile.hasPartner !== false;

  return (
    <div className="space-y-4">
      <div className="section-fade-in">
        <h1 className="text-[1.9rem] font-normal">Babynavne</h1>
        <p className="label-upper mt-1">STEM PÅ JERES FAVORITTER</p>
      </div>

      {/* Match animation overlay */}
      {matchAnim && (
        <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
          <div className="rounded-3xl px-10 py-8 text-center shadow-2xl section-fade-in"
            style={{ background: accentBg, border: `2px solid ${accentSolid}` }}>
            <p className="text-[2rem]">💛</p>
            <p className="text-[1.5rem] font-semibold mt-1" style={{ color: accentText }}>MATCH!</p>
            <p className="text-[1rem] mt-1" style={{ color: accentText }}>{matchAnim}</p>
            <p className="text-[0.72rem] text-muted-foreground mt-1">I er begge vilde med det navn</p>
          </div>
        </div>
      )}

      {/* Gender filter */}
      <div className="flex gap-2 section-fade-in" style={{ animationDelay: "40ms" }}>
        {(["begge","pige","dreng"] as Gender[]).map(g => (
          <button key={g} onClick={() => { setGender(g); setSeen([]); saveArr(SEEN_KEY(role), []); }}
            className="flex-1 py-2 rounded-full text-[0.72rem] font-medium transition-all active:scale-95"
            style={{
              background: gender === g ? accentSolid : "hsl(var(--stone-lighter))",
              color: gender === g ? accentSolidText : "hsl(var(--muted-foreground))",
            }}>
            {g === "begge" ? "Alle" : g === "pige" ? "👧 Pige" : "👦 Dreng"}
          </button>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-0 border-b border-[hsl(var(--stone-lighter))] section-fade-in" style={{ animationDelay: "60ms" }}>
        {([
          { key: "swipe" as View, label: "Swipe" },
          { key: "matches" as View, label: `Matches${matches.length > 0 ? ` (${matches.length})` : ""}` },
          { key: "custom" as View, label: "Egne navne" },
        ]).map(tab => (
          <button key={tab.key} onClick={() => setView(tab.key)}
            className={cn("flex-1 py-2.5 text-[0.72rem] tracking-[0.1em] uppercase font-medium border-b-2 transition-all -mb-px",
              view === tab.key
                ? "text-foreground"
                : "border-transparent text-muted-foreground"
            )}
            style={{ borderBottomColor: view === tab.key ? accentSolid : "transparent" }}>
            {tab.label}
          </button>
        ))}
      </div>

      {/* SWIPE VIEW */}
      {view === "swipe" && (
        <div className="section-fade-in" style={{ animationDelay: "80ms" }}>
          {topName ? (
            <>
              {/* Card stack */}
              <div className="relative mx-auto" style={{ height: 280, maxWidth: 340 }}>
                {nextName && (
                  <NameCard key={`next-${nextName}`} name={nextName} onLike={() => {}} onSkip={() => {}} isTop={false} />
                )}
                <NameCard key={`top-${topName}`} name={topName} onLike={handleLike} onSkip={handleSkip} isTop={true} />
              </div>

              <div className="flex items-center justify-between mt-4 px-2">
                <p className="text-[0.65rem] text-muted-foreground">{remaining} navne tilbage</p>
                <button onClick={handleReset} className="flex items-center gap-1 text-[0.65rem] text-muted-foreground active:opacity-60">
                  <RotateCcw className="w-3 h-3" /> Start forfra
                </button>
              </div>

              {likes.length > 0 && (
                <div className="mt-4 rounded-2xl px-4 py-3" style={{ background: accentBg }}>
                  <p className="text-[0.58rem] tracking-[0.14em] uppercase mb-2" style={{ color: accentText }}>
                    Dine favoritter ({likes.length})
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {likes.map(n => (
                      <span key={n} className="px-3 py-1 rounded-full text-[0.78rem] font-medium"
                        style={{ background: "white", color: accentText }}>
                        {partnerLikes.includes(n) ? `${n} 💛` : n}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-16 space-y-3">
              <p className="text-4xl">🎉</p>
              <p className="text-[1rem] font-medium">Du har set alle navne!</p>
              <p className="text-[0.78rem] text-muted-foreground">Du har liket {likes.length} navn{likes.length !== 1 ? "e" : ""}</p>
              <button onClick={handleReset}
                className="mt-4 px-6 py-2.5 rounded-full text-[0.82rem] font-medium transition-all active:scale-95"
                style={{ background: accentSolid, color: accentSolidText }}>
                Start forfra
              </button>
            </div>
          )}
        </div>
      )}

      {/* MATCHES VIEW */}
      {view === "matches" && (
        <div className="space-y-3 section-fade-in" style={{ animationDelay: "80ms" }}>
          {hasPartner && matches.length > 0 ? (
            <>
              <p className="text-[0.62rem] tracking-[0.14em] uppercase text-muted-foreground">
                I er begge vilde med
              </p>
              <div className="space-y-2">
                {matches.map(n => (
                  <div key={n} className="rounded-2xl px-5 py-4 flex items-center justify-between"
                    style={{ background: accentBg, border: `1px solid ${accentSolid}30` }}>
                    <p className="text-[1.1rem] font-light" style={{ color: accentText }}>{n}</p>
                    <span className="text-xl">💛</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-16 space-y-2">
              <p className="text-4xl">💬</p>
              <p className="text-[0.95rem] font-medium">Ingen matches endnu</p>
              <p className="text-[0.75rem] text-muted-foreground leading-relaxed max-w-[260px] mx-auto">
                {hasPartner
                  ? `Når ${partnerName} også swiper, dukker fælles favoritter op her`
                  : "Swipe på navne og gem dine favoritter"}
              </p>
            </div>
          )}
        </div>
      )}

      {/* CUSTOM NAMES VIEW */}
      {view === "custom" && (
        <div className="space-y-3 section-fade-in" style={{ animationDelay: "80ms" }}>
          <div className="card-soft space-y-3">
            <p className="text-[0.58rem] tracking-[0.14em] uppercase text-muted-foreground">Tilføj eget navn</p>
            <div className="flex gap-2">
              <input
                type="text"
                value={newName}
                onChange={e => setNewName(e.target.value)}
                onKeyDown={e => e.key === "Enter" && addCustom()}
                placeholder="Skriv et navn..."
                className="flex-1 rounded-xl border px-3 py-2.5 text-[0.88rem] focus:outline-none transition-colors"
                style={{ borderColor: "hsl(var(--stone-light))", fontSize: "16px", background: "hsl(var(--cream))" }}
              />
              <button onClick={addCustom} disabled={!newName.trim()}
                className="px-4 rounded-xl font-medium text-[0.82rem] transition-all active:scale-95 disabled:opacity-40 flex items-center gap-1"
                style={{ background: accentSolid, color: accentSolidText }}>
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          {customNames.length > 0 && (
            <div className="space-y-2">
              {customNames.map(n => (
                <div key={n} className="card-soft flex items-center justify-between">
                  <p className="text-[0.9rem]">{n}</p>
                  <button onClick={() => removeCustom(n)} className="p-1.5 rounded-lg text-muted-foreground/50 hover:text-muted-foreground transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {customNames.length === 0 && (
            <p className="text-center text-[0.75rem] text-muted-foreground py-8">
              Ingen egne navne endnu — tilføj et ovenfor
            </p>
          )}
        </div>
      )}
    </div>
  );
}
