import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { FamilyProvider } from "@/context/FamilyContext";
import { DiaryProvider } from "@/context/DiaryContext";
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

const queryClient = new QueryClient();

function AuthenticatedApp() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border-2 border-[hsl(var(--moss))] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-[0.72rem] tracking-[0.14em] uppercase text-muted-foreground">Indlæser...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <Routes>
        <Route path="*" element={<AuthPage />} />
      </Routes>
    );
  }

  return (
    <FamilyProvider>
      <DiaryProvider>
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
          <Route path="*" element={<NotFound />} />
        </Routes>
      </DiaryProvider>
    </FamilyProvider>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthenticatedApp />
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
