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

    // If no role is set, redirect to role selection
    if (!userError && (!userData?.role || userData.role === 'brand')) {
      // Check if they have any profiles already
      const [{ data: creator }, { data: brand }] = await Promise.all([
        supabase.from("creators").select("id").eq("user_id", userId).maybeSingle(),
        supabase.from("brands").select("id").eq("user_id", userId).maybeSingle()
      ]);

      // If no profiles exist and role is default 'brand', send to role selection
      if (!creator && !brand && userData.role === 'brand') {
        return "/role-selection";
      }
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
      .select("id")
      .eq("user_id", userId)
      .maybeSingle();

    if (brand && !brandError) {
      return "/brand-dashboard";
    }

    // If user has a role but no profile, redirect appropriately
    if (!userError && userData?.role === 'creator') {
      return "/creator-profile";
    }

    // Default: redirect to role selection for new users
    return "/role-selection";
  } catch (error) {
    console.error("Error determining redirect path:", error);
    // Default fallback
    return "/role-selection";
  }
};