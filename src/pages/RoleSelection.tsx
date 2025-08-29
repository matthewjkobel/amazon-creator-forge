import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Users, Building2, Palette, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

const RoleSelection = () => {
  const [selectedRole, setSelectedRole] = useState<"creator" | "brand" | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();

  const handleRoleSelect = (role: "creator" | "brand") => {
    setSelectedRole(role);
    setError("");
  };

  const handleContinue = async () => {
    if (!selectedRole || !user) return;

    setLoading(true);
    setError("");

    try {
      if (selectedRole === "creator") {
        // Create creator profile
        const { error } = await supabase
          .from("creators")
          .insert({
            user_id: user.id,
            display_name: user.user_metadata?.full_name || "New Creator",
            visibility: "public"
          });

        if (error) {
          setError("Failed to create creator profile. Please try again.");
          return;
        }

        toast({
          title: "Welcome to PartnerConnections!",
          description: "Your creator profile has been created successfully.",
        });
        navigate("/creator-profile");
      } else {
        // Create brand profile
        const { error } = await supabase
          .from("brands")
          .insert({
            user_id: user.id,
            company_name: user.user_metadata?.full_name || "New Brand"
          });

        if (error) {
          setError("Failed to create brand profile. Please try again.");
          return;
        }

        toast({
          title: "Welcome to PartnerConnections!",
          description: "Your brand profile has been created successfully.",
        });
        navigate("/brand-dashboard");
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

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