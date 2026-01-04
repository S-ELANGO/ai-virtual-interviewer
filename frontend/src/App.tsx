import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import BackgroundBlobs from "./components/BackgroundBlobs";
import LandingPage from "./pages/LandingPage";
import InterviewPage from "./pages/InterviewPage";
import ResultPage from "./pages/ResultPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <div className="min-h-screen relative">
          {/* Global Animated Background */}
          <BackgroundBlobs />

          {/* Main Content Area */}
          <div className="relative z-10">
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/interview" element={<InterviewPage />} />
              <Route path="/result" element={<ResultPage />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </div>
        </div>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
