import { supabase } from "@/integrations/supabase/client";

export const getRedirectPath = async (userId: string): Promise<string> => {
  try {
    // Check if user is admin
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("role")
      .eq("id", userId)
      .single();

    if (!userError && userData?.role === 'admin') {
      return "/admin-dashboard";
    }

    // Check if user has a creator profile
    const { data: creator, error: creatorError } = await supabase
      .from("creators")
      .select("id")
      .eq("user_id", userId)
      .maybeSingle();

    if (creator && !creatorError) {
      return "/creator-dashboard";
    }

    // Check if user has a brand profile
    const { data: brand, error: brandError } = await supabase
      .from("brands")
      .select("id, company_name, contact_name, contact_email")
      .eq("user_id", userId)
      .maybeSingle();

    if (brand && !brandError) {
      // Check if brand profile is complete
      if (brand.company_name && brand.contact_name && brand.contact_email) {
        return "/brand-dashboard";
      } else {
        return "/brand-profile";
      }
    }

    // No profile exists - redirect to role selection
    return "/role-selection";
  } catch (error) {
    console.error("Error determining redirect path:", error);
    // Default fallback
    return "/role-selection";
  }
};