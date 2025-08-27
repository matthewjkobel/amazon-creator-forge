import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Webhook } from "https://esm.sh/standardwebhooks@1.0.0";
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response("not allowed", { status: 400 });
  }

  try {
    const hookSecret = (Deno.env.get("SEND_EMAIL_HOOK_SECRET") ?? "").trim();
    const resendKey = (Deno.env.get("RESEND_API_KEY") ?? "").trim();
    const supabaseUrl = (Deno.env.get("SUPABASE_URL") ?? "").trim();

    if (!hookSecret) {
      console.error("Missing SEND_EMAIL_HOOK_SECRET");
      return new Response(
        JSON.stringify({ error: "SEND_EMAIL_HOOK_SECRET is not configured" }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } },
      );
    }
    if (!resendKey) {
      console.error("Missing RESEND_API_KEY");
      return new Response(
        JSON.stringify({ error: "RESEND_API_KEY is not configured" }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } },
      );
    }

    const payload = await req.text();
    const headers = Object.fromEntries(req.headers);

    const wh = new Webhook(hookSecret);

    // Verify signature and parse payload
    const {
      user,
      email_data: { token, token_hash, redirect_to, email_action_type },
    } = wh.verify(payload, headers) as {
      user: { email: string };
      email_data: {
        token: string;
        token_hash: string;
        redirect_to: string;
        email_action_type: string; // e.g., signup, magiclink, recovery, email_change
      };
    };

    const verifyUrl = `${supabaseUrl}/auth/v1/verify?token=${token_hash}&type=${email_action_type}&redirect_to=${encodeURIComponent(redirect_to)}`;

    const html = `
      <h1>Complete your sign in</h1>
      <p>Click the button below to continue:</p>
      <p>
        <a href="${verifyUrl}" target="_blank" style="display:inline-block;padding:12px 18px;background:#1f2937;color:#ffffff;text-decoration:none;border-radius:6px;">Continue</a>
      </p>
      <p>Or copy this temporary code:</p>
      <code style="display:inline-block;padding:12px;background:#f4f4f5;border:1px solid #e4e4e7;border-radius:6px;">${token}</code>
      <p style="color:#6b7280;font-size:12px">If you didn’t request this, you can safely ignore this email.</p>
    `;

    const resend = new Resend(resendKey);

    const { error } = await resend.emails.send({
      from: "Lovable <onboarding@resend.dev>",
      to: [user.email],
      subject: "Your secure sign-in link",
      html,
    });

    if (error) {
      throw error;
    }

    console.log("auth-email-hook: email sent to", user.email);

    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("auth-email-hook error", error?.message || error);
    return new Response(
      JSON.stringify({ error: error?.message || "Unknown error" }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } },
    );
  }
});
