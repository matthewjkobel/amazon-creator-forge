import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Users, Building2, Palette, AlertCircle, CheckCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

interface ExistingProfile {
  type: "creator" | "brand";
  id: string;
  name: string;
}

const RoleSelection = () => {
  const [selectedRole, setSelectedRole] = useState<"creator" | "brand" | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [existingProfile, setExistingProfile] = useState<ExistingProfile | null>(null);
  const [showExistingProfilePrompt, setShowExistingProfilePrompt] = useState(false);
  const [checkingProfiles, setCheckingProfiles] = useState(true);
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();

  // Redirect unauthenticated users to auth page
  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [authLoading, user, navigate]);

  // Check for existing profiles when component mounts
  useEffect(() => {
    const checkExistingProfiles = async () => {
      if (!user || authLoading) {
        setCheckingProfiles(false);
        return;
      }
      
      setCheckingProfiles(true);
      
      try {
        console.log("🔍 Checking existing profiles for user:", user.id);
        
        // Check for existing creator profile
        const { data: creatorData, error: creatorError } = await supabase
          .from("creators")
          .select("id, display_name")
          .eq("user_id", user.id)
          .maybeSingle();

        console.log("🎨 Creator check result:", { creatorData, creatorError });

        if (creatorData && !creatorError) {
          setExistingProfile({
            type: "creator",
            id: creatorData.id,
            name: creatorData.display_name || "Creator Profile"
          });
          setShowExistingProfilePrompt(true);
          return;
        }

        // Check for existing brand profile
        const { data: brandData, error: brandError } = await supabase
          .from("brands")
          .select("id, company_name")
          .eq("user_id", user.id)
          .maybeSingle();

        console.log("🏢 Brand check result:", { brandData, brandError });

        if (brandData && !brandError) {
          setExistingProfile({
            type: "brand",
            id: brandData.id,
            name: brandData.company_name || "Brand Profile"
          });
          setShowExistingProfilePrompt(true);
        }
      } catch (error) {
        console.error("❌ Error checking existing profiles:", error);
      } finally {
        setCheckingProfiles(false);
      }
    };

    checkExistingProfiles();
  }, [user, authLoading]);

  const handleRoleSelect = (role: "creator" | "brand") => {
    setSelectedRole(role);
    setError("");
  };

  const handleAccessExistingProfile = () => {
    if (!existingProfile) return;
    
    toast({
      title: "Accessing your profile",
      description: `Redirecting to your ${existingProfile.type} dashboard.`,
    });

    if (existingProfile.type === "creator") {
      navigate("/creator-dashboard");
    } else {
      navigate("/brand-dashboard");
    }
  };

  const handleCreateNewProfile = () => {
    setShowExistingProfilePrompt(false);
    setExistingProfile(null);
  };

  const handleContinue = async () => {
    if (!selectedRole || !user) {
      console.error("❌ Missing data for profile creation:", { selectedRole, userId: user?.id });
      setError("Missing required information. Please try again.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      console.log("🚀 Starting profile creation for:", { userId: user.id, role: selectedRole });

      // Double-check if user already has the selected profile type
      if (selectedRole === "creator") {
        const { data: existingCreator, error: checkError } = await supabase
          .from("creators")
          .select("id")
          .eq("user_id", user.id)
          .maybeSingle();

        console.log("🎨 Creator existence check:", { existingCreator, checkError });

        if (existingCreator && !checkError) {
          toast({
            title: "Profile exists",
            description: "Redirecting to your creator dashboard.",
          });
          navigate("/creator-dashboard");
          return;
        }
      } else {
        const { data: existingBrand, error: checkError } = await supabase
          .from("brands")
          .select("id")
          .eq("user_id", user.id)
          .maybeSingle();

        console.log("🏢 Brand existence check:", { existingBrand, checkError });

        if (existingBrand && !checkError) {
          toast({
            title: "Profile exists", 
            description: "Redirecting to your brand dashboard.",
          });
          navigate("/brand-dashboard");
          return;
        }
      }

      // Ensure user exists in public.users table (without specifying role)
      console.log("👤 Ensuring user row exists...");
      const { data: sessionData } = await supabase.auth.getSession();
      console.log("🔐 Session before RPC ensure_user_row:", {
        hasSession: !!sessionData.session,
        userId: sessionData.session?.user?.id,
        accessToken: sessionData.session?.access_token ? 'present' : 'missing'
      });
      const { error: userError } = await supabase.rpc('ensure_user_row', {
        p_id: user.id,
        p_email: user.email || '',
        p_full_name: user.user_metadata?.full_name || ''
      });

      if (userError) {
        console.error("❌ User row creation error (ensure_user_row):", {
          message: userError.message,
          name: userError.name,
          status: (userError as any).status,
          code: (userError as any).code,
          details: (userError as any).details,
          hint: (userError as any).hint,
        });
        setError("Failed to set up user account. Please try again.");
        return;
      }

      if (selectedRole === "creator") {
        console.log("🎨 Creating creator profile...");
        const { error } = await supabase
          .from("creators")
          .insert({
            user_id: user.id,
            display_name: user.user_metadata?.full_name || "New Creator",
            visibility: "public"
          });

        if (error) {
          console.error("❌ Creator profile creation error:", {
            message: error.message,
            name: (error as any).name,
            status: (error as any).status,
            code: (error as any).code,
            details: (error as any).details,
            hint: (error as any).hint,
          });
          setError(`Failed to create creator profile: ${error.message}`);
          return;
        }

        console.log("✅ Creator profile created successfully");
        toast({
          title: "Welcome to PartnerConnections!",
          description: "Your creator profile has been created successfully.",
        });
        navigate("/creator-profile");
      } else {
        console.log("🏢 Redirecting to brand onboarding...");
        toast({
          title: "Welcome to PartnerConnections!",
          description: "Let's set up your brand profile.",
        });
        navigate("/brand-onboarding");
      }
    } catch (err) {
      console.error("❌ Unexpected error in role selection:", err);
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Redirect if not authenticated (handled by useEffect above)
  if (authLoading || !user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center">
          <div className="inline-flex items-center gap-2 font-bold text-2xl mb-4">
            <Users className="h-8 w-8 text-primary" />
            PartnerConnections
          </div>
          <p className="text-muted-foreground">Checking authentication...</p>
        </div>
      </div>
    );
  }

  // Show loading state while checking profiles
  if (checkingProfiles) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center">
          <div className="inline-flex items-center gap-2 font-bold text-2xl mb-4">
            <Users className="h-8 w-8 text-primary" />
            PartnerConnections
          </div>
          <p className="text-muted-foreground">Checking your account...</p>
        </div>
      </div>
    );
  }

  // Show existing profile prompt
  if (showExistingProfilePrompt && existingProfile) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="w-full max-w-lg">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 font-bold text-2xl mb-4">
              <Users className="h-8 w-8 text-primary" />
              PartnerConnections
            </div>
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold mb-2">Profile Found</h1>
            <p className="text-muted-foreground">
              We found an existing {existingProfile.type} profile for your account.
            </p>
          </div>

          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="text-center space-y-4">
                <div className="p-3 rounded-full bg-primary/10 w-fit mx-auto">
                  {existingProfile.type === "creator" ? (
                    <Palette className="h-8 w-8 text-primary" />
                  ) : (
                    <Building2 className="h-8 w-8 text-primary" />
                  )}
                </div>
                <div>
                  <h3 className="font-semibold text-lg">{existingProfile.name}</h3>
                  <p className="text-muted-foreground capitalize">{existingProfile.type} Profile</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-3">
            <Button 
              size="lg" 
              className="w-full"
              onClick={handleAccessExistingProfile}
            >
              Access My {existingProfile.type === "creator" ? "Creator" : "Brand"} Profile
            </Button>
            
            <Button 
              variant="outline" 
              size="lg" 
              className="w-full"
              onClick={handleCreateNewProfile}
            >
              Create a Different Profile Type
            </Button>
          </div>

          <p className="text-xs text-muted-foreground text-center mt-4">
            You can always switch between profile types later in your account settings.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 font-bold text-2xl mb-4">
            <Users className="h-8 w-8 text-primary" />
            PartnerConnections
          </div>
          <h1 className="text-3xl font-bold mb-2">Choose Your Role</h1>
          <p className="text-muted-foreground">
            Select how you'd like to use PartnerConnections. You can change this later if needed.
          </p>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Creator Card */}
          <Card 
            className={`cursor-pointer transition-all ${
              selectedRole === "creator" ? "ring-2 ring-primary" : "hover:shadow-lg"
            }`}
            onClick={() => handleRoleSelect("creator")}
          >
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 p-3 rounded-full bg-primary/10">
                <Palette className="h-8 w-8 text-primary" />
              </div>
              <CardTitle className="text-xl">I'm a Creator</CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-3">
              <p className="text-muted-foreground">
                Share your content, connect with brands, and monetize your audience.
              </p>
              <ul className="text-sm text-left space-y-2">
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                  Create and showcase your portfolio
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                  Set your rates and packages
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                  Connect with brands looking for creators
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Brand Card */}
          <Card 
            className={`cursor-pointer transition-all ${
              selectedRole === "brand" ? "ring-2 ring-primary" : "hover:shadow-lg"
            }`}
            onClick={() => handleRoleSelect("brand")}
          >
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 p-3 rounded-full bg-primary/10">
                <Building2 className="h-8 w-8 text-primary" />
              </div>
              <CardTitle className="text-xl">I'm a Brand</CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-3">
              <p className="text-muted-foreground">
                Find creators, manage partnerships, and grow your brand reach.
              </p>
              <ul className="text-sm text-left space-y-2">
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                  Browse and discover creators
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                  Manage brand partnerships
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                  Track campaign performance
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>

        <div className="text-center space-y-4">
          <Button 
            size="lg" 
            className="w-full md:w-auto px-8"
            onClick={handleContinue}
            disabled={!selectedRole || loading || !user}
          >
            {loading ? "Setting up your profile..." : "Continue"}
          </Button>
          
          <p className="text-sm text-muted-foreground">
            Don't worry - you can always change your role or create multiple profiles later.
          </p>
        </div>
      </div>
    </div>
  );
};

export default RoleSelection;