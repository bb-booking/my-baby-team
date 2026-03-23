import { useState } from "react";
import { useFamily, type BirthType, type FeedingMethod } from "@/context/FamilyContext";
import { useNavigate } from "react-router-dom";
import { Settings, User, Bell, HelpCircle, RotateCcw, Baby, Plus, Trash2, Users, Heart } from "lucide-react";
import { cn } from "@/lib/utils";

export default function MerePage() {
  const { profile, setProfile, resetProfile, addChild, removeChild } = useFamily();
  const navigate = useNavigate();
  const [showAddChild, setShowAddChild] = useState(false);
  const [newChildName, setNewChildName] = useState("");
  const [newChildDate, setNewChildDate] = useState("");
  const [showMorHealth, setShowMorHealth] = useState(false);

  const handleReset = () => { resetProfile(); navigate("/onboarding"); };

  const handleAddChild = () => {
    if (newChildName.trim()) {
      addChild(newChildName.trim(), newChildDate || new Date().toISOString());
      setNewChildName(""); setNewChildDate(""); setShowAddChild(false);
    }
  };

  const menuItems = [
    { icon: User, label: "Profil", desc: `${profile.parentName} — ${profile.role === "mor" ? "Mor" : "Far/Partner"}` },
    { icon: Bell, label: "Notifikationer", desc: "Rolige påmindelser" },
    { icon: Settings, label: "Indstillinger", desc: "Sprog, tema, data" },
    { icon: HelpCircle, label: "Hjælp", desc: "FAQ og support" },
  ];

  return (
    <div className="space-y-5">
      <div className="section-fade-in">
        <h1 className="text-[1.9rem] font-normal">Indstillinger</h1>
      </div>

      {/* Family */}
      <div className="card-soft section-fade-in" style={{ animationDelay: "40ms" }}>
        <div className="flex items-center gap-2 mb-3">
          <Users className="w-4 h-4" style={{ color: "hsl(var(--moss))" }} />
          <p className="text-[1rem] font-semibold">Familie</p>
        </div>
        <div className="space-y-2 mb-3">
          <div className="flex items-center gap-3 px-3 py-2 rounded-xl" style={{ background: profile.role === "mor" ? "hsl(var(--clay-light) / 0.4)" : "hsl(var(--sage-light) / 0.4)" }}>
            <span className="text-lg">{profile.role === "mor" ? "👩" : "👨"}</span>
            <div>
              <p className="text-[0.85rem] font-medium">{profile.parentName}</p>
              <p className="text-[0.6rem] tracking-[0.12em] uppercase text-muted-foreground">{profile.role === "mor" ? "Mor" : "Far"} · dig</p>
            </div>
          </div>
          <div className="flex items-center gap-3 px-3 py-2 rounded-xl" style={{ background: profile.role === "far" ? "hsl(var(--clay-light) / 0.4)" : "hsl(var(--sage-light) / 0.4)" }}>
            <span className="text-lg">{profile.role === "far" ? "👩" : "👨"}</span>
            <div>
              <p className="text-[0.85rem] font-medium">{profile.partnerName}</p>
              <p className="text-[0.6rem] tracking-[0.12em] uppercase text-muted-foreground">{profile.role === "far" ? "Mor" : "Far"} · partner</p>
            </div>
          </div>
        </div>

        {/* Children */}
        <div className="border-t border-[hsl(var(--stone-lighter))] pt-3">
          <p className="text-[0.6rem] tracking-[0.16em] uppercase text-muted-foreground mb-2">Børn</p>
          {profile.children.length > 0 ? (
            <div className="space-y-2">
              {profile.children.map((child) => (
                <div key={child.id} className="flex items-center gap-3 px-3 py-2 rounded-xl bg-[hsl(var(--cream))]">
                  <Baby className="w-4 h-4" style={{ color: "hsl(var(--moss))" }} />
                  <div className="flex-1">
                    <p className="text-[0.85rem] font-medium">{child.name}</p>
                    <p className="text-[0.6rem] text-muted-foreground">Født {new Date(child.birthDate).toLocaleDateString("da-DK")}</p>
                  </div>
                  <button onClick={() => removeChild(child.id)} className="p-1 rounded hover:bg-destructive/10 transition-colors">
                    <Trash2 className="w-3.5 h-3.5 text-muted-foreground hover:text-destructive" />
                  </button>
                </div>
              ))}
            </div>
          ) : <p className="text-[0.78rem] text-muted-foreground">Ingen børn tilføjet endnu.</p>}

          {showAddChild ? (
            <div className="mt-3 space-y-2 p-3 rounded-xl border border-[hsl(var(--sage))] bg-[hsl(var(--sage-light))]/30">
              <input type="text" value={newChildName} onChange={(e) => setNewChildName(e.target.value)} placeholder="Barnets navn" maxLength={50}
                className="w-full rounded-lg border border-[hsl(var(--stone-light))] bg-background px-3 py-2 text-[0.85rem] focus:outline-none focus:border-[hsl(var(--sage))]" />
              <input type="date" value={newChildDate} onChange={(e) => setNewChildDate(e.target.value)}
                className="w-full rounded-lg border border-[hsl(var(--stone-light))] bg-background px-3 py-2 text-[0.85rem] focus:outline-none focus:border-[hsl(var(--sage))]" />
              <div className="flex gap-2">
                <button onClick={() => setShowAddChild(false)} className="flex-1 py-2 rounded-lg text-[0.75rem] text-muted-foreground hover:bg-[hsl(var(--stone-lighter))]">Annullér</button>
                <button onClick={handleAddChild} disabled={!newChildName.trim()} className="flex-1 py-2 rounded-lg text-[0.75rem] font-medium bg-[hsl(var(--moss))] text-white active:scale-95 disabled:opacity-50">Tilføj</button>
              </div>
            </div>
          ) : (
            <button onClick={() => setShowAddChild(true)} className="mt-2 flex items-center gap-1.5 text-[0.72rem] tracking-[0.08em] uppercase active:scale-95" style={{ color: "hsl(var(--moss))" }}>
              <Plus className="w-3.5 h-3.5" /> Tilføj barn
            </button>
          )}
        </div>
      </div>

      {/* Mor Health section */}
      {profile.phase !== "pregnant" && (
        <div className="card-soft section-fade-in" style={{ animationDelay: "80ms" }}>
          <button onClick={() => setShowMorHealth(!showMorHealth)} className="flex items-center gap-2 w-full text-left">
            <Heart className="w-4 h-4" style={{ color: "hsl(var(--clay))" }} />
            <p className="text-[1rem] font-semibold flex-1">Mors recovery</p>
            <span className="text-muted-foreground text-sm">{showMorHealth ? "▲" : "▼"}</span>
          </button>
      {showMorHealth && <MorHealthEditor onSave={() => setShowMorHealth(false)} />}
        </div>
      )}

      <div className="space-y-2">
        {menuItems.map((item, i) => (
          <button key={item.label} className="card-soft w-full flex items-center gap-4 text-left transition-all active:scale-[0.98] section-fade-in" style={{ animationDelay: `${(i + 2) * 80}ms` }}>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "hsl(var(--sand-light))" }}>
              <item.icon className="w-5 h-5 text-foreground/60" />
            </div>
            <div>
              <p className="text-[0.85rem] font-normal">{item.label}</p>
              <p className="text-[0.68rem] text-muted-foreground">{item.desc}</p>
            </div>
          </button>
        ))}
        <button onClick={handleReset} className="card-soft w-full flex items-center gap-4 text-left transition-all active:scale-[0.98] section-fade-in" style={{ animationDelay: "480ms" }}>
          <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-destructive/10"><RotateCcw className="w-5 h-5 text-destructive" /></div>
          <div><p className="text-[0.85rem] font-normal">Start forfra</p><p className="text-[0.68rem] text-muted-foreground">Nulstil profil og vælg igen</p></div>
        </button>
      </div>

      <div className="card-soft text-center section-fade-in" style={{ animationDelay: "560ms" }}>
        <p className="text-[0.68rem] text-muted-foreground">Lille v1.0 — lavet med kærlighed 🌿</p>
      </div>
      <div className="h-20 md:h-0" />
    </div>
  );
}

function MorHealthEditor() {
  const { profile, setProfile } = useFamily();
  const mh = profile.morHealth || {};

  const update = (patch: Partial<typeof mh>) => {
    setProfile({ ...profile, morHealth: { ...mh, ...patch } });
  };

  const complications = [
    { id: "rift", label: "Bristning / klip" },
    { id: "blødning", label: "Stor blødning" },
    { id: "infektion", label: "Infektion" },
    { id: "præeklampsi", label: "Præeklampsi" },
    { id: "ammeproblemer", label: "Ammeproblemer" },
    { id: "fødselsdepression", label: "Nedstemthed" },
  ];

  const toggleComp = (id: string) => {
    const current = mh.complications || [];
    update({ complications: current.includes(id) ? current.filter(c => c !== id) : [...current, id] });
  };

  return (
    <div className="mt-4 space-y-4">
      <div>
        <p className="text-[0.62rem] tracking-[0.16em] uppercase text-muted-foreground mb-2">Fødselstype</p>
        <div className="flex gap-2">
          {(["vaginal", "kejsersnit"] as BirthType[]).map(bt => (
            <button key={bt} onClick={() => update({ birthType: bt })}
              className={cn("flex-1 py-2 rounded-xl text-[0.78rem] border transition-all active:scale-[0.97]",
                mh.birthType === bt ? "bg-[hsl(var(--sage-light))] border-[hsl(var(--sage))] font-medium" : "border-[hsl(var(--stone-light))] text-muted-foreground")}>
              {bt === "vaginal" ? "👶 Vaginal" : "🏥 Kejsersnit"}
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="text-[0.62rem] tracking-[0.16em] uppercase text-muted-foreground mb-2">Ernæring</p>
        <div className="flex gap-2">
          {([{ k: "amning" as FeedingMethod, l: "🤱 Amning" }, { k: "flaske" as FeedingMethod, l: "🍼 Flaske" }, { k: "begge" as FeedingMethod, l: "Begge" }]).map(f => (
            <button key={f.k} onClick={() => update({ feedingMethod: f.k })}
              className={cn("flex-1 py-2 rounded-xl text-[0.72rem] border transition-all active:scale-[0.97]",
                mh.feedingMethod === f.k ? "bg-[hsl(var(--sage-light))] border-[hsl(var(--sage))] font-medium" : "border-[hsl(var(--stone-light))] text-muted-foreground")}>
              {f.l}
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="text-[0.62rem] tracking-[0.16em] uppercase text-muted-foreground mb-2">Komplikationer</p>
        <div className="flex flex-wrap gap-1.5">
          {complications.map(c => (
            <button key={c.id} onClick={() => toggleComp(c.id)}
              className={cn("px-3 py-1.5 rounded-full text-[0.7rem] border transition-all active:scale-[0.97]",
                (mh.complications || []).includes(c.id) ? "border-[hsl(var(--clay))] bg-[hsl(var(--clay))]/10 font-medium" : "border-[hsl(var(--stone-light))] text-muted-foreground")}>
              {c.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
