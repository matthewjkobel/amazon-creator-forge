import { supabase } from "@/integrations/supabase/client";

export const getRedirectPath = async (userId: string): Promise<string> => {
  console.log("🔍 getRedirectPath called for userId:", userId);
  try {
    // Check if user is admin
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("role")
      .eq("id", userId)
      .single();
    
    console.log("👤 User data check:", { userData, userError });

    if (!userError && userData?.role === 'admin') {
      return "/admin-dashboard";
    }

    // Check if user has a creator profile
    const { data: creator, error: creatorError } = await supabase
      .from("creators")
      .select("id")
      .eq("user_id", userId)
      .maybeSingle();
    
    console.log("🎨 Creator check:", { creator, creatorError });

    if (creator && !creatorError) {
      console.log("➡️ Redirecting to creator dashboard");
      return "/creator-dashboard";
    }

    // Check if user has a brand profile
    const { data: brand, error: brandError } = await supabase
      .from("brands")
      .select("id, company_name, contact_name, contact_email")
      .eq("user_id", userId)
      .maybeSingle();
    
    console.log("🏢 Brand check:", { brand, brandError });

    if (brand && !brandError) {
      // Check if brand profile is complete
      if (brand.company_name && brand.contact_name && brand.contact_email) {
        console.log("➡️ Redirecting to brand dashboard");
        return "/brand-dashboard";
      } else {
        console.log("➡️ Redirecting to brand profile");
        return "/brand-profile";
      }
    }

    // No profile exists - redirect to role selection
    console.log("➡️ No profiles found, redirecting to role selection");
    return "/role-selection";
  } catch (error) {
    console.error("Error determining redirect path:", error);
    // Default fallback
    return "/role-selection";
  }
};