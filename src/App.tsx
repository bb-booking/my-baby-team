import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
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
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <FamilyProvider>
      <DiaryProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/onboarding" element={<OnboardingPage />} />
              <Route element={<AppLayout />}>
                <Route path="/" element={<Dashboard />} />
                <Route path="/barn" element={<BarnPage />} />
                <Route path="/dagbog" element={<DagbogPage />} />
                <Route path="/sammen" element={<SammenPage />} />
                <Route path="/mere" element={<MerePage />} />
                <Route path="/tjekliste" element={<TjeklistePage />} />
                <Route path="/kalender" element={<KalenderPage />} />
                <Route path="/raad" element={<RaadGuidesPage />} />
                <Route path="/babynavne" element={<BabynavnePage />} />
              </Route>
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </DiaryProvider>
    </FamilyProvider>
  </QueryClientProvider>
);

export default App;
