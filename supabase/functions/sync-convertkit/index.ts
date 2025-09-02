import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ConvertKitSyncRequest {
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

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const apiKey = Deno.env.get("CONVERTKIT_API_KEY");
  const apiSecret = Deno.env.get("CONVERTKIT_API_SECRET");
  
  if (!apiKey || !apiSecret) {
    console.error("Missing ConvertKit API credentials");
    return new Response(
      JSON.stringify({ error: "ConvertKit API credentials not configured" }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }

  try {
    const body: ConvertKitSyncRequest = await req.json();
    
    if (!body?.user_id || !body?.email) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: user_id, email" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    console.log("Syncing user to ConvertKit:", { user_id: body.user_id, email: body.email });

    // Prepare tags
    const tags = [];
    if (body.role) {
      tags.push(`role:${body.role}`);
    }
    if (body.approval_status) {
      tags.push(`approval_status:${body.approval_status}`);
    }
    if (body.niches && body.niches.length > 0) {
      body.niches.forEach(niche => tags.push(`niche:${niche.toLowerCase()}`));
    }

    // Prepare custom fields
    const customFields: Record<string, string | number> = {};
    if (body.full_name) customFields.full_name = body.full_name;
    if (body.role) customFields.role = body.role;
    if (body.display_name) customFields.display_name = body.display_name;
    if (body.company_name) customFields.company_name = body.company_name;
    if (body.location) customFields.location = body.location;
    if (body.price_min && body.price_max) {
      customFields.price_range = `$${body.price_min} - $${body.price_max}`;
    }
    if (body.social_handles) {
      customFields.social_handles = JSON.stringify(body.social_handles);
    }

    // Subscribe to form
    const formId = "965e3ca22a";
    const subscribeResponse = await fetch(`https://api.convertkit.com/v3/forms/${formId}/subscribe`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        api_key: apiKey,
        email: body.email,
        first_name: body.full_name?.split(' ')[0] || '',
        fields: customFields,
        tags: tags,
      }),
    });

    const subscribeData = await subscribeResponse.json();
    
    if (!subscribeResponse.ok) {
      console.error("ConvertKit subscription error:", subscribeData);
      return new Response(
        JSON.stringify({ error: "Failed to subscribe to ConvertKit", details: subscribeData }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    console.log("ConvertKit sync successful:", { 
      subscriber_id: subscribeData.subscription?.subscriber?.id,
      tags_added: tags.length,
      custom_fields: Object.keys(customFields).length 
    });

    return new Response(JSON.stringify({ 
      success: true, 
      subscriber_id: subscribeData.subscription?.subscriber?.id,
      tags_applied: tags,
      custom_fields_set: Object.keys(customFields)
    }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });

  } catch (error: any) {
    console.error("ConvertKit sync error:", error?.message || error);
    return new Response(
      JSON.stringify({ error: error?.message || "Unknown error" }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
});