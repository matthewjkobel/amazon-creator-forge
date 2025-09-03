import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Users, Building2, Palette, AlertCircle, CheckCircle, TestTube } from "lucide-react";
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
  const [testMode, setTestMode] = useState(false);
  const [simulatedUser, setSimulatedUser] = useState<any>(null);
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();

  // Test mode users
  const testUsers = {
    creator: {
      id: '11111111-1111-1111-1111-111111111111',
      email: 'test.creator@example.com',
      user_metadata: { full_name: 'Test Creator' }
    },
    brand: {
      id: '22222222-2222-2222-2222-222222222222', 
      email: 'test.brand@example.com',
      user_metadata: { full_name: 'Test Brand User' }
    }
  };

  // Test mode functions
  const enterTestMode = (userType: 'creator' | 'brand') => {
    setTestMode(true);
    setSimulatedUser(testUsers[userType]);
    toast({
      title: "Test Mode Activated",
      description: `Simulating login as ${userType}`,
    });
  };

  const exitTestMode = () => {
    setTestMode(false);
    setSimulatedUser(null);
    setExistingProfile(null);
    setShowExistingProfilePrompt(false);
    setCheckingProfiles(true);
    toast({
      title: "Test Mode Disabled",
      description: "Returning to normal authentication",
    });
  };

  // Check for existing profiles when component mounts
  useEffect(() => {
    const checkExistingProfiles = async () => {
      const currentUser = testMode ? simulatedUser : user;
      if (!currentUser) {
        setCheckingProfiles(false);
        return;
      }
      
      setCheckingProfiles(true);
      
      try {
        // Check for existing creator profile
        const { data: creatorData } = await supabase
          .from("creators")
          .select("id, display_name")
          .eq("user_id", currentUser.id)
          .maybeSingle();

        if (creatorData) {
          setExistingProfile({
            type: "creator",
            id: creatorData.id,
            name: creatorData.display_name || "Creator Profile"
          });
          setShowExistingProfilePrompt(true);
          return;
        }

        // Check for existing brand profile
        const { data: brandData } = await supabase
          .from("brands")
          .select("id, company_name")
          .eq("user_id", currentUser.id)
          .maybeSingle();

        if (brandData) {
          setExistingProfile({
            type: "brand",
            id: brandData.id,
            name: brandData.company_name || "Brand Profile"
          });
          setShowExistingProfilePrompt(true);
        }
      } catch (error) {
        console.error("Error checking existing profiles:", error);
      } finally {
        setCheckingProfiles(false);
      }
    };

    checkExistingProfiles();
  }, [user, testMode, simulatedUser]);

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
    const currentUser = testMode ? simulatedUser : user;
    if (!selectedRole || !currentUser) return;

    setLoading(true);
    setError("");

    try {
      // Check if user already has the selected profile type
      if (selectedRole === "creator") {
        const { data: existingCreator } = await supabase
          .from("creators")
          .select("id")
          .eq("user_id", currentUser.id)
          .maybeSingle();

        if (existingCreator) {
          toast({
            title: "Profile exists",
            description: "Redirecting to your creator dashboard.",
          });
          navigate("/creator-dashboard");
          return;
        }
      } else {
        const { data: existingBrand } = await supabase
          .from("brands")
          .select("id")
          .eq("user_id", currentUser.id)
          .maybeSingle();

        if (existingBrand) {
          toast({
            title: "Profile exists", 
            description: "Redirecting to your brand dashboard.",
          });
          navigate("/brand-dashboard");
          return;
        }
      }

      // First ensure user exists in public.users table
      const { error: userError } = await supabase.rpc('ensure_user_row', {
        p_id: currentUser.id,
        p_email: currentUser.email || '',
        p_full_name: currentUser.user_metadata?.full_name || '',
        p_role: selectedRole === "creator" ? 'creator' : 'brand'
      });

      if (userError) {
        console.error("User row creation error:", userError);
        setError("Failed to set up user profile. Please try again.");
        return;
      }

      if (selectedRole === "creator") {
        // Create creator profile
        const { error } = await supabase
          .from("creators")
          .insert({
            user_id: currentUser.id,
            display_name: currentUser.user_metadata?.full_name || "New Creator",
            visibility: "public"
          });

        if (error) {
          console.error("Creator profile creation error:", error);
          setError("Failed to create creator profile. Please try again.");
          return;
        }

        toast({
          title: "Welcome to PartnerConnections!",
          description: "Your creator profile has been created successfully.",
        });
        navigate("/creator-profile");
      } else {
        // For brands, just navigate to onboarding - don't create profile yet
        toast({
          title: "Welcome to PartnerConnections!",
          description: "Let's set up your brand profile.",
        });
        navigate("/brand-onboarding");
      }
    } catch (err) {
      console.error("Unexpected error in role selection:", err);
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Show test mode controls if no user is authenticated
  if (!testMode && !user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 font-bold text-2xl mb-4">
              <Users className="h-8 w-8 text-primary" />
              PartnerConnections
            </div>
            <h1 className="text-2xl font-bold mb-2">Test Mode</h1>
            <p className="text-muted-foreground">
              Test the profile detection flow with simulated users
            </p>
          </div>

          <div className="space-y-4">
            <Card className="p-4">
              <div className="flex items-center gap-3 mb-3">
                <TestTube className="h-5 w-5 text-primary" />
                <span className="font-medium">Test Profile Detection</span>
              </div>
              <div className="space-y-2">
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => enterTestMode('creator')}
                >
                  <Palette className="h-4 w-4 mr-2" />
                  Test as Creator (has existing profile)
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => enterTestMode('brand')}
                >
                  <Building2 className="h-4 w-4 mr-2" />
                  Test as Brand (has existing profile)
                </Button>
              </div>
            </Card>

            <div className="text-center">
              <Button variant="ghost" asChild>
                <a href="/auth">Sign in normally</a>
              </Button>
            </div>
          </div>
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
            {testMode && (
              <div className="mt-2 text-sm text-blue-600">
                Test Mode: {simulatedUser?.email}
              </div>
            )}
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

            {testMode && (
              <Button 
                variant="ghost" 
                size="sm" 
                className="w-full"
                onClick={exitTestMode}
              >
                Exit Test Mode
              </Button>
            )}
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
          {testMode && (
            <div className="mt-2 text-sm text-blue-600 bg-blue-50 rounded p-2">
              Test Mode: {simulatedUser?.email}
              <Button variant="ghost" size="sm" onClick={exitTestMode} className="ml-2">
                Exit Test Mode
              </Button>
            </div>
          )}
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
            disabled={!selectedRole || loading}
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