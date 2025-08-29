import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Users, Building2, Palette, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

const RoleSelection = () => {
  const [selectedRole, setSelectedRole] = useState<"creator" | "brand" | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();

  const handleRoleSelection = async () => {
    if (!selectedRole || !user) return;
    
    setLoading(true);
    setError("");

    try {
      // Update user role in users table
      const { error: roleError } = await supabase
        .from("users")
        .update({ role: selectedRole })
        .eq("id", user.id);

      if (roleError) {
        setError(roleError.message);
        return;
      }

      toast({
        title: "Role selected!",
        description: `Welcome to PartnerConnections as a ${selectedRole}!`,
      });

      // Navigate to appropriate onboarding/dashboard
      if (selectedRole === "creator") {
        navigate("/creator-profile");
      } else {
        navigate("/brand-dashboard");
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoBack = () => {
    setSelectedRole(null);
  };

  if (!user) {
    navigate("/auth");
    return null;
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
          <h1 className="text-3xl font-bold mb-2">Welcome to PartnerConnections!</h1>
          <p className="text-muted-foreground text-lg">
            Let's get you set up. Are you a creator or a brand?
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-center text-xl">Choose Your Role</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Creator Option */}
              <Card 
                className={`cursor-pointer transition-all ${
                  selectedRole === "creator" 
                    ? "ring-2 ring-primary bg-primary/5" 
                    : "hover:shadow-md"
                }`}
                onClick={() => setSelectedRole("creator")}
              >
                <CardContent className="p-6 text-center">
                  <div className="mb-4">
                    <Palette className="h-12 w-12 text-primary mx-auto" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">I'm a Creator</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    I create content and want to collaborate with brands for partnerships and sponsorships.
                  </p>
                  <ul className="text-xs text-muted-foreground space-y-1">
                    <li>• Build your creator profile</li>
                    <li>• Showcase your content</li>
                    <li>• Connect with brands</li>
                    <li>• Manage collaborations</li>
                  </ul>
                </CardContent>
              </Card>

              {/* Brand Option */}
              <Card 
                className={`cursor-pointer transition-all ${
                  selectedRole === "brand" 
                    ? "ring-2 ring-primary bg-primary/5" 
                    : "hover:shadow-md"
                }`}
                onClick={() => setSelectedRole("brand")}
              >
                <CardContent className="p-6 text-center">
                  <div className="mb-4">
                    <Building2 className="h-12 w-12 text-primary mx-auto" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">I'm a Brand</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    I represent a brand and want to find creators for marketing partnerships and campaigns.
                  </p>
                  <ul className="text-xs text-muted-foreground space-y-1">
                    <li>• Discover creators</li>
                    <li>• Browse portfolios</li>
                    <li>• Send collaboration requests</li>
                    <li>• Manage campaigns</li>
                  </ul>
                </CardContent>
              </Card>
            </div>

            <div className="flex gap-3">
              {selectedRole && (
                <Button 
                  variant="outline" 
                  onClick={handleGoBack}
                  className="flex-1"
                >
                  Change Selection
                </Button>
              )}
              <Button 
                onClick={handleRoleSelection}
                disabled={!selectedRole || loading}
                className="flex-1"
              >
                {loading ? "Setting up..." : `Continue as ${selectedRole || "..."}`}
              </Button>
            </div>

            <div className="text-center text-sm text-muted-foreground">
              <p>Don't worry, you can always change your role later in settings.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default RoleSelection;