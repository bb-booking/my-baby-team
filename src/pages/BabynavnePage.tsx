import { useState } from "react";
import { Heart, Plus, Trash2 } from "lucide-react";
import { useTranslation } from "react-i18next";

interface SavedName {
  id: string;
  name: string;
  gender: "dreng" | "pige" | "neutral";
}

export default function BabynavnePage() {
  const { t } = useTranslation();
  const [names, setNames] = useState<SavedName[]>(() => {
    try { const s = localStorage.getItem("lille-babynames"); return s ? JSON.parse(s) : []; } catch { return []; }
  });
  const [newName, setNewName] = useState("");
  const [gender, setGender] = useState<"dreng" | "pige" | "neutral">("neutral");

  const save = (list: SavedName[]) => {
    setNames(list);
    localStorage.setItem("lille-babynames", JSON.stringify(list));
  };

  const addName = () => {
    if (!newName.trim()) return;
    save([...names, { id: Math.random().toString(36).slice(2), name: newName.trim(), gender }]);
    setNewName("");
  };

  const removeName = (id: string) => save(names.filter(n => n.id !== id));

  const genderOptions = [
    { key: "dreng" as const, label: t("babyNames.boy"), emoji: "👦" },
    { key: "pige" as const, label: t("babyNames.girl"), emoji: "👧" },
    { key: "neutral" as const, label: t("babyNames.neutral"), emoji: "🌟" },
  ];

  const genderLabel = (g: string) => g === "dreng" ? t("babyNames.boy") : g === "pige" ? t("babyNames.girl") : t("babyNames.neutral");

  return (
    <div className="space-y-5">
      <div className="section-fade-in">
        <h1 className="text-[1.9rem] font-normal">{t("babyNames.title")}</h1>
        <p className="label-upper mt-1">{t("babyNames.yourFavorites")}</p>
      </div>

      <div className="card-soft section-fade-in" style={{ animationDelay: "80ms" }}>
        <p className="label-upper mb-3">{t("babyNames.addName")}</p>
        <input
          type="text"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && addName()}
          placeholder={t("babyNames.writeName")}
          className="w-full rounded-xl border border-[hsl(var(--stone-light))] bg-background px-4 py-2.5 text-[0.9rem] focus:outline-none focus:border-[hsl(var(--sage))] transition-colors mb-3"
        />
        <div className="flex gap-2 mb-3">
          {genderOptions.map(g => (
            <button key={g.key} onClick={() => setGender(g.key)}
              className={`flex-1 py-2 rounded-xl text-[0.72rem] border transition-all active:scale-[0.97] ${
                gender === g.key
                  ? "bg-[hsl(var(--sage-light))] border-[hsl(var(--sage))] font-medium"
                  : "border-[hsl(var(--stone-light))] text-muted-foreground"
              }`}
            >{g.emoji} {g.label}</button>
          ))}
        </div>
        <button onClick={addName} disabled={!newName.trim()} className="btn-moss w-full disabled:opacity-50">
          <Plus className="w-4 h-4 inline mr-1" /> {t("babyNames.addBtn")}
        </button>
      </div>

      {names.length > 0 && (
        <div className="card-soft section-fade-in" style={{ animationDelay: "160ms" }}>
          <p className="label-upper mb-3">{t("babyNames.savedNames", { count: names.length })}</p>
          {names.map(n => (
            <div key={n.id} className="flex items-center gap-3 py-2.5 border-b border-foreground/5 last:border-0">
              <Heart className="w-4 h-4 flex-shrink-0" style={{ color: "hsl(var(--clay))", fill: "hsl(var(--clay))" }} />
              <div className="flex-1">
                <p className="text-[0.88rem]">{n.name}</p>
                <p className="text-[0.6rem] text-muted-foreground capitalize">{genderLabel(n.gender)}</p>
              </div>
              <button onClick={() => removeName(n.id)} className="p-1 rounded hover:bg-destructive/10 transition-colors">
                <Trash2 className="w-3.5 h-3.5 text-muted-foreground" />
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="h-20 md:h-0" />
    </div>
  );
}
