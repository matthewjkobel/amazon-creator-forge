import { supabase } from "@/integrations/supabase/client";

export const getRedirectPath = async (userId: string): Promise<string> => {
  try {
    // Check if user has a creator profile
    const { data: creator, error: creatorError } = await supabase
      .from("creators")
      .select("id")
      .eq("user_id", userId)
      .single();

    if (creator && !creatorError) {
      return "/creator-dashboard";
    }

    // Check if user has a brand profile
    const { data: brand, error: brandError } = await supabase
      .from("brands")
      .select("id")
      .eq("user_id", userId)
      .single();

    if (brand && !brandError) {
      return "/brand-dashboard";
    }

    // Default: assume they want to be a creator if no profile exists
    return "/creator-profile";
  } catch (error) {
    console.error("Error determining redirect path:", error);
    // Default fallback
    return "/creator-profile";
  }
};