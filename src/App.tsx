import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { GeoProvider } from "@/contexts/GeoContext";
import AppLayout from "./components/layout/AppLayout";
import Dashboard from "./pages/Dashboard";
import IndustryPage from "./pages/IndustryPage";
import SubFlowPage from "./pages/SubFlowPage";
import IntelDashboard from "./pages/IntelDashboard";
import CrossIntelPage from "./pages/CrossIntelPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <GeoProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route element={<AppLayout />}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/intel" element={<IntelDashboard />} />
              <Route path="/cross-intel" element={<CrossIntelPage />} />
              <Route path="/industry/:slug" element={<IndustryPage />} />
              <Route path="/industry/:slug/:subFlowId" element={<SubFlowPage />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </GeoProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
