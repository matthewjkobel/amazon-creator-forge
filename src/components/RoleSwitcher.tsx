import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Users, Building2, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

interface RoleSwitcherProps {
  currentRole: "creator" | "brand";
  className?: string;
}

const RoleSwitcher = ({ currentRole, className = "" }: RoleSwitcherProps) => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();

  const targetRole = currentRole === "creator" ? "brand" : "creator";
  const targetRoleCapitalized = targetRole.charAt(0).toUpperCase() + targetRole.slice(1);
  const Icon = targetRole === "creator" ? Users : Building2;

  const handleRoleSwitch = async () => {
    if (!user) return;

    setLoading(true);
    try {
      // Update user role in the users table
      const { error: userError } = await supabase.rpc('ensure_user_row', {
        p_id: user.id,
        p_email: user.email || '',
        p_full_name: user.user_metadata?.full_name || '',
        p_role: targetRole
      });

      if (userError) {
        throw userError;
      }

      // Check if target role profile already exists
      const targetTable = targetRole === "creator" ? "creators" : "brands";
      const { data: existingProfile } = await supabase
        .from(targetTable)
        .select("id")
        .eq("user_id", user.id)
        .maybeSingle();

      if (!existingProfile) {
        // Create new profile for target role
        if (targetRole === "creator") {
          const { error } = await supabase
            .from("creators")
            .insert({
              user_id: user.id,
              display_name: user.user_metadata?.full_name || "New Creator",
              visibility: "public"
            });

          if (error) throw error;
        } else {
          const { error } = await supabase
            .from("brands")
            .insert({
              user_id: user.id,
              company_name: user.user_metadata?.full_name || "New Brand"
            });

          if (error) throw error;
        }
      }

      // Sync to ConvertKit
      try {
        await supabase.functions.invoke('sync-convertkit', {
          body: {
            user_id: user.id,
            email: user.email,
            full_name: user.user_metadata?.full_name,
            role: targetRole,
            approval_status: 'draft'
          }
        });
      } catch (convertKitError) {
        console.warn("ConvertKit sync failed:", convertKitError);
        // Don't block user flow if ConvertKit fails
      }

      toast({
        title: "Role Changed Successfully!",
        description: `You are now using PartnerConnections as a ${targetRoleCapitalized}.`,
      });

      // Navigate to the appropriate profile page
      if (targetRole === "creator") {
        navigate("/creator-profile");
      } else {
        navigate("/brand-onboarding");
      }
    } catch (error) {
      console.error("Error switching role:", error);
      toast({
        title: "Error",
        description: "Failed to switch role. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="outline" className={className}>
          <Icon className="h-4 w-4 mr-2" />
          Change Role to {targetRoleCapitalized}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-amber-500" />
            Switch to {targetRoleCapitalized} Role?
          </AlertDialogTitle>
          <AlertDialogDescription className="space-y-3">
            <p>
              You are about to switch from a {currentRole} to a {targetRole} role. This will:
            </p>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li>Update your account role to {targetRole}</li>
              <li>
                Create a new {targetRole} profile or take you to an existing one
              </li>
              <li>You can switch back anytime using the same process</li>
            </ul>
            <p className="text-sm text-muted-foreground">
              Your current {currentRole} profile will remain saved and accessible when you switch back.
            </p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleRoleSwitch} disabled={loading}>
            {loading ? "Switching..." : `Switch to ${targetRoleCapitalized}`}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default RoleSwitcher;