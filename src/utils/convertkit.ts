import { supabase } from "@/integrations/supabase/client";

export interface ConvertKitSyncData {
  user_id: string;
  email: string;
  full_name?: string;
  role?: string;
  display_name?: string;
  company_name?: string;
  location?: string;
  approval_status?: string;
  niches?: string[];
  social_handles?: Record<string, string>;
  price_min?: number;
  price_max?: number;
}

export const syncToConvertKit = async (data: ConvertKitSyncData) => {
  try {
    const response = await supabase.functions.invoke('sync-convertkit', {
      body: data
    });

    if (response.error) {
      console.warn("ConvertKit sync failed:", response.error);
      return { success: false, error: response.error };
    }

    console.log("ConvertKit sync successful:", response.data);
    return { success: true, data: response.data };
  } catch (error) {
    console.warn("ConvertKit sync error:", error);
    return { success: false, error };
  }
};