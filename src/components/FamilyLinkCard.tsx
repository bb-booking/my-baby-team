import { useState } from "react";
import { useFamily } from "@/context/FamilyContext";
import { Link2, Copy, Check, UserPlus } from "lucide-react";
import { cn } from "@/lib/utils";

export function FamilyLinkCard() {
  const { profile, joinFamilyByCode } = useFamily();
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);
  const [copied, setCopied] = useState(false);

  const isLinked = !!profile.partnerUserId;
  const inviteCode = profile.inviteCode ?? "——";

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(inviteCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback: select text
    }
  };

  const handleJoin = async () => {
    if (!code.trim()) return;
    setLoading(true);
    setResult(null);
    const res = await joinFamilyByCode(code.trim());
    setLoading(false);
    setResult({
      success: res.success,
      message: res.success
        ? `Forbundet med ${res.partnerName} 💚 I er nu et team.`
        : res.error ?? "Noget gik galt",
    });
  };

  return (
    <div className="card-soft space-y-4 section-fade-in">
      <div className="flex items-center gap-2">
        <Link2 className="w-4 h-4" style={{ color: "hsl(var(--moss))" }} />
        <p className="text-[1rem] font-semibold">Forbind med din partner</p>
      </div>

      {isLinked ? (
        <div className="rounded-xl px-4 py-3 flex items-center gap-2" style={{ background: "hsl(var(--sage-light))" }}>
          <Check className="w-4 h-4" style={{ color: "hsl(var(--moss))" }} />
          <div>
            <p className="text-[0.82rem] font-medium">I er forbundet</p>
            <p className="text-[0.7rem] text-muted-foreground">{profile.partnerName || "Din partner"} bruger appen på sin enhed</p>
          </div>
        </div>
      ) : (
        <>
          <p className="text-[0.75rem] text-muted-foreground leading-relaxed">
            Hver person opretter sin egen konto og får sit eget tilpassede dashboard. Del din kode med din partner — så er I forbundet.
          </p>

          {/* Your invite code */}
          <div>
            <p className="text-[0.62rem] tracking-[0.14em] uppercase text-muted-foreground mb-2">Din invitationskode</p>
            <div className="flex items-center gap-2">
              <div
                className="flex-1 rounded-xl px-4 py-3 text-center"
                style={{ background: "hsl(var(--cream))", border: "1px solid hsl(var(--stone-light))" }}
              >
                <span className="text-[1.6rem] font-mono font-bold tracking-[0.3em]" style={{ color: "hsl(var(--moss))" }}>
                  {inviteCode}
                </span>
              </div>
              <button
                onClick={handleCopy}
                className="w-11 h-11 rounded-xl flex items-center justify-center transition-all active:scale-95"
                style={{ background: copied ? "hsl(var(--sage-light))" : "hsl(var(--stone-lighter))" }}
              >
                {copied
                  ? <Check className="w-4 h-4" style={{ color: "hsl(var(--moss))" }} />
                  : <Copy className="w-4 h-4 text-muted-foreground" />
                }
              </button>
            </div>
            <p className="text-[0.62rem] text-muted-foreground mt-1.5 text-center">
              {copied ? "Kopieret!" : "Tryk for at kopiere"}
            </p>
          </div>

          {/* Enter partner's code */}
          <div>
            <p className="text-[0.62rem] tracking-[0.14em] uppercase text-muted-foreground mb-2">Indtast din partners kode</p>
            <div className="flex gap-2">
              <input
                value={code}
                onChange={e => setCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ""))}
                maxLength={6}
                placeholder="ABC123"
                className="flex-1 rounded-xl border-[1.5px] border-[hsl(var(--stone-light))] bg-background px-4 py-2.5 text-[0.95rem] font-mono tracking-[0.2em] text-center focus:outline-none focus:border-[hsl(var(--moss))] transition-colors uppercase"
              />
              <button
                onClick={handleJoin}
                disabled={code.length < 6 || loading}
                className={cn(
                  "px-4 rounded-xl text-[0.75rem] font-medium transition-all active:scale-95 flex items-center gap-1.5",
                  code.length === 6 && !loading
                    ? "text-white"
                    : "bg-muted text-muted-foreground cursor-not-allowed"
                )}
                style={code.length === 6 && !loading ? { background: "hsl(var(--moss))" } : {}}
              >
                <UserPlus className="w-3.5 h-3.5" />
                {loading ? "..." : "Forbind"}
              </button>
            </div>

            {result && (
              <div
                className="mt-2 rounded-xl px-3 py-2.5 text-[0.78rem]"
                style={{
                  background: result.success ? "hsl(var(--sage-light))" : "hsl(0 70% 95%)",
                  color: result.success ? "inherit" : "hsl(0 60% 40%)",
                }}
              >
                {result.message}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
