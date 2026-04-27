import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { ArrowRight, Mail, Lock, Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";
import { MeloWordmark } from "@/components/MeloWordmark";
import { useTranslation } from "react-i18next";

export default function AuthPage() {
  const { signIn, signUp } = useAuth();
  const { t } = useTranslation();
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
      const { error, needsConfirmation } = await signUp(email, password);
      if (error) {
        // Email already exists — fall back to sign in silently
        if (error.toLowerCase().includes("already") || error.toLowerCase().includes("registered")) {
          const { error: signInError } = await signIn(email, password);
          if (signInError) setError(t("auth.errorWrongPassword"));
        } else {
          setError(error);
        }
      } else if (needsConfirmation) {
        setSignupSuccess(true);
      }
      // If !needsConfirmation, user is immediately authenticated — onAuthStateChange handles redirect
    } else {
      const { error } = await signIn(email, password);
      if (error) {
        setError(t("auth.errorInvalid"));
      }
    }
    setLoading(false);
  };

  if (signupSuccess) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6">
        <div className="w-full max-w-sm text-center space-y-6">
          <div className="flex flex-col items-center mb-8">
            <MeloWordmark size="2.6rem" />
          </div>
          <div className="rounded-2xl p-6" style={{ background: "hsl(var(--sage-light))" }}>
            <p className="text-[1.1rem] font-semibold mb-2">{t("auth.checkEmail")}</p>
            <p className="text-[0.82rem] text-muted-foreground leading-relaxed">
              {t("auth.checkEmailBody", { email })}
            </p>
          </div>
          <button
            onClick={() => { setSignupSuccess(false); setMode("login"); }}
            className="text-[0.75rem] text-muted-foreground hover:text-foreground transition-colors"
          >
            {t("auth.backToLogin")}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6"
      style={{ paddingTop: "env(safe-area-inset-top, 0px)", paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
    >
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-12 section-fade-in">
          <MeloWordmark size="2.6rem" />
          <span className="text-[0.58rem] tracking-[0.28em] uppercase text-muted-foreground font-light mt-1">{t("auth.forNewParents")}</span>
        </div>

        <div className="flex rounded-xl overflow-hidden mb-8" style={{ background: "hsl(var(--stone-lighter))" }}>
          <button
            onClick={() => { setMode("login"); setError(null); }}
            className={cn(
              "flex-1 py-2.5 text-[0.72rem] tracking-[0.12em] uppercase font-medium transition-all",
              mode === "login" ? "bg-background shadow-sm rounded-xl" : "text-muted-foreground"
            )}
          >
            {t("auth.login")}
          </button>
          <button
            onClick={() => { setMode("signup"); setError(null); }}
            className={cn(
              "flex-1 py-2.5 text-[0.72rem] tracking-[0.12em] uppercase font-medium transition-all",
              mode === "signup" ? "bg-background shadow-sm rounded-xl" : "text-muted-foreground"
            )}
          >
            {t("auth.signup")}
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 section-fade-in">
          <div className="space-y-1.5">
            <label className="text-[0.62rem] tracking-[0.16em] uppercase text-muted-foreground">{t("auth.email")}</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t("auth.emailPlaceholder")}
                required
                className="w-full rounded-xl border-[1.5px] border-[hsl(var(--stone-light))] bg-background pl-10 pr-4 py-3 text-[0.88rem] focus:outline-none focus:border-[hsl(var(--moss))] transition-colors"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[0.62rem] tracking-[0.16em] uppercase text-muted-foreground">{t("auth.password")}</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={mode === "signup" ? t("auth.passwordMin") : t("auth.passwordPlaceholder")}
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
            {loading ? t("auth.loading") : mode === "login" ? t("auth.login") : t("auth.signup")}
            {!loading && <ArrowRight className="w-4 h-4" />}
          </button>
        </form>

        <p className="text-center text-[0.68rem] text-muted-foreground mt-6">
          {mode === "login" ? t("auth.noAccount") : t("auth.hasAccount")}{" "}
          <button
            onClick={() => { setMode(mode === "login" ? "signup" : "login"); setError(null); }}
            className="font-medium hover:underline" style={{ color: "hsl(var(--moss))" }}
          >
            {mode === "login" ? t("auth.signup") : t("auth.login")}
          </button>
        </p>
      </div>
    </div>
  );
}
