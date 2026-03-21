import { useState } from "react";
import { useFamily } from "@/context/FamilyContext";
import { useNavigate } from "react-router-dom";
import { Settings, User, Bell, HelpCircle, RotateCcw, Baby, Plus, Trash2, Users } from "lucide-react";

export default function MerePage() {
  const { profile, resetProfile, addChild, removeChild } = useFamily();
  const navigate = useNavigate();
  const [showAddChild, setShowAddChild] = useState(false);
  const [newChildName, setNewChildName] = useState("");
  const [newChildDate, setNewChildDate] = useState("");

  const handleReset = () => {
    resetProfile();
    navigate("/onboarding");
  };

  const handleAddChild = () => {
    if (newChildName.trim()) {
      addChild(newChildName.trim(), newChildDate || new Date().toISOString());
      setNewChildName("");
      setNewChildDate("");
      setShowAddChild(false);
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
        <h1 className="text-[1.9rem] font-normal">Mere</h1>
      </div>

      {/* Family members section */}
      <div className="card-soft section-fade-in" style={{ animationDelay: "40ms" }}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4" style={{ color: "hsl(var(--moss))" }} />
            <p className="text-[1rem] font-semibold">Familie</p>
          </div>
        </div>

        {/* Parents */}
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
                    {child.birthDate && (
                      <p className="text-[0.6rem] text-muted-foreground">
                        Født {new Date(child.birthDate).toLocaleDateString("da-DK")}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => removeChild(child.id)}
                    className="p-1 rounded hover:bg-destructive/10 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-muted-foreground hover:text-destructive" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-[0.78rem] text-muted-foreground">Ingen børn tilføjet endnu.</p>
          )}

          {showAddChild ? (
            <div className="mt-3 space-y-2 p-3 rounded-xl border border-[hsl(var(--sage))] bg-[hsl(var(--sage-light))]/30">
              <input
                type="text"
                value={newChildName}
                onChange={(e) => setNewChildName(e.target.value)}
                placeholder="Barnets navn"
                maxLength={50}
                className="w-full rounded-lg border border-[hsl(var(--stone-light))] bg-background px-3 py-2 text-[0.85rem] focus:outline-none focus:border-[hsl(var(--sage))] transition-colors"
              />
              <input
                type="date"
                value={newChildDate}
                onChange={(e) => setNewChildDate(e.target.value)}
                className="w-full rounded-lg border border-[hsl(var(--stone-light))] bg-background px-3 py-2 text-[0.85rem] focus:outline-none focus:border-[hsl(var(--sage))] transition-colors"
              />
              <div className="flex gap-2">
                <button
                  onClick={() => setShowAddChild(false)}
                  className="flex-1 py-2 rounded-lg text-[0.75rem] text-muted-foreground hover:bg-[hsl(var(--stone-lighter))] transition-colors"
                >
                  Annullér
                </button>
                <button
                  onClick={handleAddChild}
                  disabled={!newChildName.trim()}
                  className="flex-1 py-2 rounded-lg text-[0.75rem] font-medium bg-[hsl(var(--moss))] text-white active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Tilføj
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setShowAddChild(true)}
              className="mt-2 flex items-center gap-1.5 text-[0.72rem] tracking-[0.08em] uppercase transition-all active:scale-95"
              style={{ color: "hsl(var(--moss))" }}
            >
              <Plus className="w-3.5 h-3.5" />
              Tilføj barn
            </button>
          )}
        </div>
      </div>

      <div className="space-y-2">
        {menuItems.map((item, i) => (
          <button
            key={item.label}
            className="card-soft w-full flex items-center gap-4 text-left transition-all active:scale-[0.98] section-fade-in"
            style={{ animationDelay: `${(i + 2) * 80}ms` }}
          >
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "hsl(var(--sand-light))" }}>
              <item.icon className="w-5 h-5 text-foreground/60" />
            </div>
            <div>
              <p className="text-[0.85rem] font-normal">{item.label}</p>
              <p className="text-[0.68rem] text-muted-foreground">{item.desc}</p>
            </div>
          </button>
        ))}

        <button
          onClick={handleReset}
          className="card-soft w-full flex items-center gap-4 text-left transition-all active:scale-[0.98] section-fade-in"
          style={{ animationDelay: "480ms" }}
        >
          <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-destructive/10">
            <RotateCcw className="w-5 h-5 text-destructive" />
          </div>
          <div>
            <p className="text-[0.85rem] font-normal">Start forfra</p>
            <p className="text-[0.68rem] text-muted-foreground">Nulstil profil og vælg igen</p>
          </div>
        </button>
      </div>

      <div className="card-soft text-center section-fade-in" style={{ animationDelay: "560ms" }}>
        <p className="text-[0.68rem] text-muted-foreground">Lille v1.0 — lavet med kærlighed 🌿</p>
      </div>

      <div className="h-20 md:h-0" />
    </div>
  );
}
