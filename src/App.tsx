import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation, useNavigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./hooks/useAuth";
import { useEffect } from "react";
import { getRedirectPath } from "./utils/authRedirect";
import { supabase } from "@/integrations/supabase/client";
import Home from "./pages/Home";
import Directory from "./pages/Directory";
import HowItWorks from "./pages/HowItWorks";
import Pricing from "./pages/Pricing";
import Auth from "./pages/Auth";
import RoleSelection from "./pages/RoleSelection";
import CreatorProfile from "./pages/CreatorProfile";
import CreatorDashboard from "./pages/CreatorDashboard";
import BrandProfile from "./pages/BrandProfile";
import BrandOnboarding from "./pages/BrandOnboarding";
import BrandDashboard from "./pages/BrandDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import EmailTest from "./pages/EmailTest";
import ImageTest from "./pages/ImageTest";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const AuthRouter = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleAuthRedirect = async () => {
      // Don't redirect if still loading or user is not authenticated
      if (loading || !user) return;
      
      // Don't redirect if user is on auth-related or profile editing routes
      const excludedRoutes = ['/auth', '/creator-profile', '/brand-profile', '/brand-onboarding'];
      if (excludedRoutes.includes(location.pathname)) return;
      
      try {
        // Ensure user row exists in public.users table first
        await supabase.rpc('ensure_user_row', {
          p_id: user.id,
          p_email: user.email,
          p_full_name: user.user_metadata?.full_name || user.email?.split('@')[0]
        });
        
        // Get appropriate redirect path based on user's profile
        const redirectPath = await getRedirectPath(user.id);
        
        // Only redirect if we're not already on the correct path
        if (location.pathname !== redirectPath) {
          navigate(redirectPath);
        }
      } catch (error) {
        console.error("Error in auth redirect:", error);
        // If there's an error, still try to redirect to role selection
        if (location.pathname !== '/role-selection') {
          navigate('/role-selection');
        }
      }
    };

    handleAuthRedirect();
  }, [user, loading, navigate, location.pathname]);

  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/directory" element={<Directory />} />
      <Route path="/how-it-works" element={<HowItWorks />} />
      <Route path="/pricing" element={<Pricing />} />
      <Route path="/auth" element={<Auth />} />
      <Route path="/role-selection" element={<RoleSelection />} />
      <Route path="/creator-profile" element={<CreatorProfile />} />
      <Route path="/creator-dashboard" element={<CreatorDashboard />} />
      <Route path="/brand-profile" element={<BrandProfile />} />
      <Route path="/brand-onboarding" element={<BrandOnboarding />} />
      <Route path="/brand-dashboard" element={<BrandDashboard />} />
      <Route path="/admin-dashboard" element={<AdminDashboard />} />
      <Route path="/email-test" element={<EmailTest />} />
      <Route path="/image-test" element={<ImageTest />} />
      {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <BrowserRouter>
          <AuthProvider>
            <AuthRouter />
            <Toaster />
            <Sonner />
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
