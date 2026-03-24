import { useState } from "react";
import { useFamily } from "@/context/FamilyContext";
import {
  ShoppingBag, Package, Truck, Bell, ChevronDown, ChevronUp,
  Leaf, UtensilsCrossed, Pill, Baby, Plus, Check, Star,
  ArrowRight, Timer, Sparkles
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SubscriptionProduct {
  id: string;
  name: string;
  description: string;
  frequency: string;
  price: number;
  active: boolean;
}

interface SubscriptionCategory {
  id: string;
  name: string;
  subtitle: string;
  icon: React.ReactNode;
  emoji: string;
  products: SubscriptionProduct[];
  nextDelivery?: string;
  total: number;
  active: boolean;
}

function getSubscriptions(childName: string, babyAgeMonths: number, isMor: boolean): SubscriptionCategory[] {
  const diaperSize = babyAgeMonths < 1 ? "1" : babyAgeMonths < 3 ? "2" : babyAgeMonths < 6 ? "3" : "3+";
  const nextSize = babyAgeMonths < 1 ? "2" : babyAgeMonths < 3 ? "3" : babyAgeMonths < 6 ? "3+" : "4";

  const categories: SubscriptionCategory[] = [
    {
      id: "diapers",
      name: "Bleer & pleje",
      subtitle: `BASERET PÅ ${childName.toUpperCase()}S ALDER OG FORBRUG`,
      icon: <Baby className="w-5 h-5" />,
      emoji: "🌿",
      active: true,
      total: 238,
      nextDelivery: "Torsdag d. 27. mar",
      products: [
        { id: "d1", name: `Bleer str. ${diaperSize} · 44 stk.`, description: `~8 bleer/dag`, frequency: "Hver 4. uge", price: 149, active: true },
        { id: "d2", name: "Vådservietter parfumefri · 3-pak", description: "Til pusletid", frequency: "Hver 4. uge", price: 89, active: true },
        { id: "d3", name: `Bleer str. ${nextSize} · 40 stk.`, description: "Forslag — automatisk skift", frequency: `Aktiveres ~om 10 dg`, price: 159, active: false },
      ],
    },
    {
      id: "meals",
      name: "Måltidskasser",
      subtitle: "MÅLTIDSKASSER TIL SMÅBØRNSFAMILIER",
      icon: <UtensilsCrossed className="w-5 h-5" />,
      emoji: "🥕",
      active: false,
      total: 199,
      products: [
        { id: "m1", name: "Familiemåltider · 4 retter", description: "Hurtige opskrifter · maks. 30 min", frequency: "Ugentlig", price: 349, active: false },
        ...(babyAgeMonths >= 6 ? [{ id: "m2", name: "Babymad · 6–12 mdr.", description: "Økologisk · alderssvarende", frequency: "Ugentlig", price: 199, active: false }] : []),
      ],
    },
  ];

  // Add vitamins for mor
  if (isMor) {
    categories.push({
      id: "vitamins",
      name: "Vitaminer & pleje",
      subtitle: "TIL DEN AMMENDE MOR · ANBEFALET AF SUNDHEDSPLEJERSKE",
      icon: <Pill className="w-5 h-5" />,
      emoji: "💊",
      active: true,
      total: 336,
      nextDelivery: "Fredag d. 7. mar",
      products: [
        { id: "v1", name: `D-vitamin dråber (Pharma Nord)`, description: `0–12 mdr. · til ${childName}`, frequency: "Hver 2. måned", price: 69, active: true },
        { id: "v2", name: "Omega-3 & jern · amning", description: "Støtter mælkeproduktion", frequency: "Månedlig", price: 119, active: true },
        { id: "v3", name: "Lanolin nipplecreme", description: "Nipplepleje under amning", frequency: "Månedlig", price: 89, active: true },
        { id: "v4", name: "Brystindlæg · 30-pak", description: "Engangs · til tasken og sengen", frequency: "Månedlig", price: 59, active: true },
      ],
    });
  }

  // Baby essentials
  categories.push({
    id: "essentials",
    name: "Baby essentials",
    subtitle: "ALDRIG LØB TØR FOR DET VIGTIGSTE",
    icon: <Package className="w-5 h-5" />,
    emoji: "📦",
    active: false,
    total: 158,
    products: [
      { id: "e1", name: "Babysæbe & shampoo", description: "Parfumefri · sensitiv hud", frequency: "Hver 2. måned", price: 79, active: false },
      { id: "e2", name: "Bleen-pose ruller · 5-pak", description: "Lugtfri", frequency: "Hver 2. måned", price: 49, active: false },
      { id: "e3", name: "Natsut · reserve", description: "Til tasken og sengebordet", frequency: "Hver 3. måned", price: 30, active: false },
    ],
  });

  return categories;
}

const frequencyOptions = ["Ugentlig", "Hver 2. uge", "Hver 4. uge", "Månedlig", "Hver 2. måned", "Hver 3. måned"];

export default function ShopPage() {
  const { profile, babyAgeMonths } = useFamily();
  const childName = profile.children?.[0]?.name || "Baby";
  const isMor = profile.role === "mor";

  const [subscriptions, setSubscriptions] = useState(() =>
    getSubscriptions(childName, babyAgeMonths, isMor)
  );
  const [expandedId, setExpandedId] = useState<string | null>("diapers");

  const totalMonthly = subscriptions
    .filter(s => s.active)
    .reduce((sum, s) => sum + s.products.filter(p => p.active).reduce((ps, p) => ps + p.price, 0), 0);

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const diaperSizeAlert = babyAgeMonths >= 2;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="section-fade-in">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-[1.9rem] font-normal">Abonnement</h1>
            <p className="label-upper mt-1">ALDRIG LØBET TØR — LEVERET TIL DØREN</p>
          </div>
          <button className="flex items-center gap-1.5 px-4 py-2 rounded-full border text-[0.7rem] tracking-[0.08em] uppercase font-medium transition-all active:scale-95 hover:shadow-sm"
            style={{ borderColor: "hsl(var(--stone-light))", color: "hsl(var(--bark))" }}>
            <Plus className="w-3.5 h-3.5" />
            Tilføj produkt
          </button>
        </div>
      </div>

      {/* Smart reorder banner */}
      <div className="rounded-2xl p-5 section-fade-in" style={{
        animationDelay: "60ms",
        background: "linear-gradient(135deg, hsl(var(--moss)), hsl(108 22% 28%))",
        color: "hsl(var(--warm-white))",
      }}>
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-[1.3rem] font-medium flex items-center gap-2">
              Smart genbestilling <Sparkles className="w-5 h-5 opacity-80" />
            </h2>
            <p className="text-[0.82rem] opacity-85 mt-1 leading-relaxed max-w-[26ch]">
              Melo ved hvornår I løber tør — og bestiller automatisk
            </p>
            <div className="mt-3 inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-[0.65rem] tracking-[0.1em] uppercase font-medium"
              style={{ background: "hsl(0 0% 0% / 0.2)" }}>
              Baseret på {childName}s alder og forbrug
            </div>
          </div>
          <div className="text-right">
            <p className="text-[2.2rem] font-light tabular-nums">{totalMonthly} kr</p>
            <p className="text-[0.62rem] tracking-[0.14em] uppercase opacity-70">PR. MÅNED · ALT INKL.</p>
          </div>
        </div>
      </div>

      {/* Size alert */}
      {diaperSizeAlert && (
        <div className="rounded-2xl p-4 flex items-center gap-3 section-fade-in" style={{
          animationDelay: "120ms",
          background: "hsl(var(--sand-light))",
          border: "1px solid hsl(var(--sand))",
        }}>
          <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "hsl(var(--sand))" }}>
            <Bell className="w-4 h-4" style={{ color: "hsl(var(--bark))" }} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[0.82rem]">
              <span className="font-medium">Automatisk størrelsesskift:</span>{" "}
              {childName} vejer ca. 6,5 kg. Lille foreslår at skifte til næste størrelse om ~10 dage.
            </p>
          </div>
          <button className="flex-shrink-0 px-3.5 py-1.5 rounded-full border text-[0.65rem] tracking-[0.1em] uppercase font-medium transition-all active:scale-95"
            style={{ borderColor: "hsl(var(--stone-light))", color: "hsl(var(--bark))" }}>
            Se plan
          </button>
        </div>
      )}

      {/* Subscription categories */}
      {subscriptions.map((cat, catIdx) => (
        <div key={cat.id}
          className="rounded-2xl border overflow-hidden section-fade-in"
          style={{
            animationDelay: `${160 + catIdx * 60}ms`,
            borderColor: cat.active ? "hsl(var(--stone-light))" : "hsl(var(--stone-lighter))",
            background: "hsl(var(--warm-white))",
          }}
        >
          {/* Category header */}
          <button
            onClick={() => toggleExpand(cat.id)}
            className="w-full px-4 py-3.5 flex items-center gap-3 text-left transition-colors hover:bg-[hsl(var(--cream))]"
          >
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg"
              style={{ background: cat.active ? "hsl(var(--sage-light))" : "hsl(var(--stone-lighter))" }}>
              {cat.emoji}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[0.92rem] font-medium flex items-center gap-2">
                {cat.name}
                {cat.name === "Måltidskasser" && (
                  <span className="text-[0.6rem] tracking-[0.1em] uppercase text-muted-foreground">↗</span>
                )}
              </p>
              <p className="text-[0.55rem] tracking-[0.12em] uppercase text-muted-foreground">{cat.subtitle}</p>
            </div>
            {cat.active ? (
              <span className="px-3 py-1 rounded-full text-[0.6rem] tracking-[0.1em] uppercase font-medium border"
                style={{ borderColor: "hsl(var(--sage))", color: "hsl(var(--moss))" }}>
                Aktivt
              </span>
            ) : (
              <span className="px-3 py-1 rounded-full text-[0.6rem] tracking-[0.1em] uppercase font-medium border"
                style={{ borderColor: "hsl(var(--stone-lighter))", color: "hsl(var(--stone))" }}>
                + Tilføj
              </span>
            )}
            {expandedId === cat.id ? (
              <ChevronUp className="w-4 h-4 text-muted-foreground flex-shrink-0" />
            ) : (
              <ChevronDown className="w-4 h-4 text-muted-foreground flex-shrink-0" />
            )}
          </button>

          {/* Products */}
          {expandedId === cat.id && (
            <div className="border-t" style={{ borderColor: "hsl(var(--stone-lighter))" }}>
              {cat.products.map((product, pIdx) => (
                <div key={product.id}
                  className={cn(
                    "px-4 py-3 flex items-center gap-3 transition-colors",
                    pIdx < cat.products.length - 1 && "border-b border-[hsl(var(--stone-lighter))]",
                  )}
                >
                  <div className={cn(
                    "w-2.5 h-2.5 rounded-full flex-shrink-0",
                    product.active ? "bg-[hsl(var(--sage))]" : "bg-[hsl(var(--sand))]"
                  )} />
                  <div className="flex-1 min-w-0">
                    <p className="text-[0.82rem]">{product.name}</p>
                    <p className="text-[0.65rem] text-muted-foreground mt-0.5">{product.description}</p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <select
                      value={product.frequency}
                      onChange={() => {}}
                      className="text-[0.6rem] tracking-[0.06em] uppercase font-medium px-2.5 py-1 rounded-full border bg-background appearance-none cursor-pointer"
                      style={{ borderColor: "hsl(var(--stone-light))", color: "hsl(var(--bark))" }}
                    >
                      {frequencyOptions.map(f => (
                        <option key={f} value={f}>{f}</option>
                      ))}
                    </select>
                    <span className="text-[0.85rem] font-medium tabular-nums w-14 text-right">{product.price} kr</span>
                  </div>
                </div>
              ))}

              {/* Category footer */}
              <div className="px-4 py-3 flex items-center justify-between"
                style={{ background: "hsl(var(--cream) / 0.5)" }}>
                {cat.nextDelivery ? (
                  <div className="flex items-center gap-1.5 text-[0.65rem] text-muted-foreground">
                    <Truck className="w-3 h-3" />
                    Næste levering: {cat.nextDelivery}
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 text-[0.65rem] text-muted-foreground">
                    <Timer className="w-3 h-3" />
                    Aktiveres ved tilmelding
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <span className="text-[0.95rem] font-medium tabular-nums" style={{ color: "hsl(var(--moss))" }}>
                    {cat.products.filter(p => p.active).reduce((s, p) => s + p.price, 0) || `Fra ${Math.min(...cat.products.map(p => p.price))}`} kr{!cat.active ? "/uge" : ""}
                  </span>
                  <button className="px-3.5 py-1.5 rounded-full border text-[0.65rem] tracking-[0.08em] uppercase font-medium transition-all active:scale-95"
                    style={{ borderColor: "hsl(var(--stone-light))", color: "hsl(var(--bark))" }}>
                    {cat.active ? "Rediger" : "Se menu"}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      ))}

      {/* Recommended */}
      <div className="section-fade-in" style={{ animationDelay: "400ms" }}>
        <p className="label-upper mb-3">ANBEFALET TIL JER</p>
        <div className="grid grid-cols-2 gap-2.5">
          {[
            { name: "Babysam", desc: "Alt til baby", tag: "Populær", color: "--sage" },
            { name: "Aarstiderne", desc: "Måltidskasser", tag: "Familier", color: "--clay" },
          ].map(item => (
            <div key={item.name} className="rounded-2xl p-4 border transition-all hover:shadow-sm active:scale-[0.98] cursor-pointer"
              style={{ borderColor: "hsl(var(--stone-lighter))" }}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[0.55rem] tracking-[0.14em] uppercase px-2 py-0.5 rounded-full font-medium"
                  style={{ background: `hsl(var(${item.color}-light))`, color: `hsl(var(${item.color}-dark, var(--bark)))` }}>
                  {item.tag}
                </span>
                <ArrowRight className="w-3.5 h-3.5 text-muted-foreground" />
              </div>
              <p className="text-[0.88rem] font-medium">{item.name}</p>
              <p className="text-[0.68rem] text-muted-foreground">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="h-20 md:h-0" />
    </div>
  );
}
