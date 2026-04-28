import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { useState, Component, type ReactNode, type ErrorInfo } from "react";

class ErrorBoundary extends Component<{ children: ReactNode }, { error: Error | null }> {
  state = { error: null };
  static getDerivedStateFromError(error: Error) { return { error }; }
  componentDidCatch(error: Error, info: ErrorInfo) { console.error("App crash:", error, info); }
  render() {
    if (this.state.error) {
      return (
        <div style={{ padding: 32, fontFamily: "monospace", background: "#fff", minHeight: "100vh" }}>
          <h2 style={{ color: "#c00", marginBottom: 12 }}>App-fejl — vis dette til udvikleren</h2>
          <pre style={{ whiteSpace: "pre-wrap", fontSize: 13, color: "#333" }}>
            {(this.state.error as Error).message}{"\n\n"}{(this.state.error as Error).stack}
          </pre>
        </div>
      );
    }
    return this.props.children;
  }
}
import { SplashScreen } from "@/components/SplashScreen";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { FamilyProvider } from "@/context/FamilyContext";
import { DiaryProvider } from "@/context/DiaryContext";
import { usePushNotifications } from "@/hooks/usePushNotifications";
import AppLayout from "@/components/AppLayout";
import Dashboard from "@/pages/Dashboard";
import BarnPage from "@/pages/BarnPage";
import SammenPage from "@/pages/SammenPage";
import MerePage from "@/pages/MerePage";
import DagbogPage from "@/pages/DagbogPage";
import OnboardingPage from "@/pages/OnboardingPage";
import TjeklistePage from "@/pages/TjeklistePage";
import KalenderPage from "@/pages/KalenderPage";
import RaadGuidesPage from "@/pages/RaadGuidesPage";
import BabynavnePage from "@/pages/BabynavnePage";
import ShopPage from "@/pages/ShopPage";
import SovnPage from "@/pages/SovnPage";
import ChatPage from "@/pages/ChatPage";
import LegPage from "@/pages/LegPage";
import IndstillingerPage from "@/pages/IndstillingerPage";
import AuthPage from "@/pages/AuthPage";
import NotFound from "@/pages/NotFound";
import PrivacyPage from "@/pages/PrivacyPage";

const queryClient = new QueryClient();

function Spinner() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center space-y-3">
        <div className="w-8 h-8 border-2 border-[hsl(var(--moss))] border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-[0.72rem] tracking-[0.14em] uppercase text-muted-foreground">Indlæser...</p>
      </div>
    </div>
  );
}

function getIsOnboarded() {
  try {
    const stored = localStorage.getItem("lille-family");
    return stored ? JSON.parse(stored)?.onboarded === true : false;
  } catch {
    return false;
  }
}

function PushRegistrar() {
  usePushNotifications();
  return null;
}

function AuthenticatedApp() {
  const { user, loading } = useAuth();

  if (loading) return <Spinner />;

  if (!user) {
    // New user: go through onboarding first (account created at the end)
    // Returning user (has local profile): show login
    if (getIsOnboarded()) {
      return (
        <Routes>
          <Route path="/privacy" element={<PrivacyPage />} />
          <Route path="*" element={<AuthPage />} />
        </Routes>
      );
    }
    return (
      <FamilyProvider>
        <Routes>
          <Route path="*" element={<OnboardingPage />} />
        </Routes>
      </FamilyProvider>
    );
  }

  return (
    <FamilyProvider>
      <DiaryProvider>
        <PushRegistrar />
        <Routes>
          <Route path="/onboarding" element={<OnboardingPage />} />
          <Route element={<AppLayout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/barn" element={<BarnPage />} />
            <Route path="/dagbog" element={<DagbogPage />} />
            <Route path="/sovn" element={<SovnPage />} />
            <Route path="/sammen" element={<SammenPage />} />
            <Route path="/mere" element={<MerePage />} />
            <Route path="/tjekliste" element={<TjeklistePage />} />
            <Route path="/kalender" element={<KalenderPage />} />
            <Route path="/raad" element={<RaadGuidesPage />} />
            <Route path="/babynavne" element={<BabynavnePage />} />
            <Route path="/shop" element={<ShopPage />} />
            <Route path="/chat" element={<ChatPage />} />
            <Route path="/leg" element={<LegPage />} />
            <Route path="/indstillinger" element={<IndstillingerPage />} />
          </Route>
          <Route path="/privacy" element={<PrivacyPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </DiaryProvider>
    </FamilyProvider>
  );
}

const App = () => {
  const [splashDone, setSplashDone] = useState(false);

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            {!splashDone && <SplashScreen onDone={() => setSplashDone(true)} />}
            <BrowserRouter>
              <ErrorBoundary>
                <AuthenticatedApp />
              </ErrorBoundary>
            </BrowserRouter>
          </TooltipProvider>
        </AuthProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
};

export default App;
