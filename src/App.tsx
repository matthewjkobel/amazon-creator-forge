import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./hooks/useAuth";
import Home from "./pages/Home";
import Directory from "./pages/Directory";
import HowItWorks from "./pages/HowItWorks";
import Pricing from "./pages/Pricing";
import Auth from "./pages/Auth";
import CreatorProfile from "./pages/CreatorProfile";
import RoleSelection from "./pages/RoleSelection";
import CreatorDashboard from "./pages/CreatorDashboard";
import BrandDashboard from "./pages/BrandDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import EmailTest from "./pages/EmailTest";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <BrowserRouter>
          <AuthProvider>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/directory" element={<Directory />} />
              <Route path="/how-it-works" element={<HowItWorks />} />
              <Route path="/pricing" element={<Pricing />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/creator-profile" element={<CreatorProfile />} />
              <Route path="/role-selection" element={<RoleSelection />} />
              <Route path="/creator-dashboard" element={<CreatorDashboard />} />
              <Route path="/brand-dashboard" element={<BrandDashboard />} />
              <Route path="/admin-dashboard" element={<AdminDashboard />} />
              <Route path="/email-test" element={<EmailTest />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
            <Toaster />
            <Sonner />
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
