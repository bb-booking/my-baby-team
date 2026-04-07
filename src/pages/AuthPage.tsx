import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { ArrowRight, Mail, Lock, Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";
import meloLogoImg from "@/assets/melo-logo.png";

export default function AuthPage() {
  const { signIn, signUp } = useAuth();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [signupSuccess, setSignupSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (mode === "signup") {
      const { error } = await signUp(email, password);
      if (error) {
        setError(error);
      } else {
        setSignupSuccess(true);
      }
    } else {
      const { error } = await signIn(email, password);
      if (error) {
        setError(error);
      }
    }
    setLoading(false);
  };

  if (signupSuccess) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6">
        <div className="w-full max-w-sm text-center space-y-6">
          <div className="flex flex-col items-center mb-8">
            <div className="flex items-center gap-2 mb-1">
              <img src={meloLogoImg} alt="" className="w-7 h-7" />
              <span className="font-sans font-extrabold text-[2.6rem] tracking-[0.28em] uppercase leading-none" style={{ color: "hsl(var(--moss))" }}>MELO</span>
            </div>
          </div>
          <div className="rounded-2xl p-6" style={{ background: "hsl(var(--sage-light))" }}>
            <p className="text-[1.1rem] font-semibold mb-2">Tjek din e-mail ✉️</p>
            <p className="text-[0.82rem] text-muted-foreground leading-relaxed">
              Vi har sendt et bekræftelseslink til <strong>{email}</strong>. Klik på linket for at aktivere din konto.
            </p>
          </div>
          <button
            onClick={() => { setSignupSuccess(false); setMode("login"); }}
            className="text-[0.75rem] text-muted-foreground hover:text-foreground transition-colors"
          >
            Tilbage til login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-12 section-fade-in">
          <div className="flex items-center gap-2 mb-1">
            <img src={meloLogoImg} alt="" className="w-7 h-7" />
            <span className="font-sans font-extrabold text-[2.6rem] tracking-[0.28em] uppercase leading-none" style={{ color: "hsl(var(--moss))" }}>MELO</span>
          </div>
          <span className="text-[0.58rem] tracking-[0.28em] uppercase text-muted-foreground font-light">for nye forældre</span>
        </div>

        <div className="flex rounded-xl overflow-hidden mb-8" style={{ background: "hsl(var(--stone-lighter))" }}>
          <button
            onClick={() => { setMode("login"); setError(null); }}
            className={cn(
              "flex-1 py-2.5 text-[0.72rem] tracking-[0.12em] uppercase font-medium transition-all",
              mode === "login" ? "bg-background shadow-sm rounded-xl" : "text-muted-foreground"
            )}
          >
            Log ind
          </button>
          <button
            onClick={() => { setMode("signup"); setError(null); }}
            className={cn(
              "flex-1 py-2.5 text-[0.72rem] tracking-[0.12em] uppercase font-medium transition-all",
              mode === "signup" ? "bg-background shadow-sm rounded-xl" : "text-muted-foreground"
            )}
          >
            Opret konto
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 section-fade-in">
          <div className="space-y-1.5">
            <label className="text-[0.62rem] tracking-[0.16em] uppercase text-muted-foreground">E-mail</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="din@email.dk"
                required
                className="w-full rounded-xl border-[1.5px] border-[hsl(var(--stone-light))] bg-background pl-10 pr-4 py-3 text-[0.88rem] focus:outline-none focus:border-[hsl(var(--moss))] transition-colors"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[0.62rem] tracking-[0.16em] uppercase text-muted-foreground">Adgangskode</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={mode === "signup" ? "Min. 6 tegn" : "Din adgangskode"}
                required
                minLength={6}
                className="w-full rounded-xl border-[1.5px] border-[hsl(var(--stone-light))] bg-background pl-10 pr-11 py-3 text-[0.88rem] focus:outline-none focus:border-[hsl(var(--moss))] transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {error && (
            <div className="rounded-xl px-4 py-3 text-[0.78rem]" style={{ background: "hsl(0 70% 95%)", color: "hsl(0 60% 40%)" }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className={cn(
              "w-full h-12 rounded-full font-semibold text-[0.74rem] tracking-[0.16em] uppercase flex items-center justify-center gap-2 transition-all active:scale-[0.98]",
              "bg-[hsl(var(--moss))] text-white hover:bg-[hsl(var(--sage-dark))]",
              loading && "opacity-70 cursor-not-allowed"
            )}
          >
            {loading ? "Vent venligst..." : mode === "login" ? "Log ind" : "Opret konto"}
            {!loading && <ArrowRight className="w-4 h-4" />}
          </button>
        </form>

        <p className="text-center text-[0.68rem] text-muted-foreground mt-6">
          {mode === "login" ? "Har du ikke en konto? " : "Har du allerede en konto? "}
          <button
            onClick={() => { setMode(mode === "login" ? "signup" : "login"); setError(null); }}
            className="font-medium hover:underline" style={{ color: "hsl(var(--moss))" }}
          >
            {mode === "login" ? "Opret konto" : "Log ind"}
          </button>
        </p>
      </div>
    </div>
  );
}
