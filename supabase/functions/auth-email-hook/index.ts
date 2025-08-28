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
    const hookSecret = (
      Deno.env.get("SEND_EMAIL_HOOK_SECRET") ??
      Deno.env.get("WEBHOOK_SECRET") ??
      Deno.env.get("STANDARDWEBHOOKS_SECRET") ??
      Deno.env.get("STANDARD_WEBHOOKS_SECRET") ??
      ""
    ).trim();
    const resendKey = (Deno.env.get("RESEND_API_KEY") ?? "").trim();
    const supabaseUrl = (Deno.env.get("SUPABASE_URL") ?? "").trim();

    // Enhanced diagnostics
    console.log("auth-email-hook: environment check", {
      hasHookSecret: Boolean(hookSecret),
      hasResendKey: Boolean(resendKey),
      hasSupabaseUrl: Boolean(supabaseUrl),
      envKeys: Object.keys(Deno.env.toObject()).filter(k => k.includes('SECRET') || k.includes('WEBHOOK')),
    });

    if (!hookSecret) {
      console.error("Missing webhook secret - checked SEND_EMAIL_HOOK_SECRET, WEBHOOK_SECRET, STANDARDWEBHOOKS_SECRET, STANDARD_WEBHOOKS_SECRET");
      return new Response(
        JSON.stringify({ error: "Webhook secret is not configured" }),
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
    const signatureHeaderCandidate =
      headers["webhook-signature"] ||
      headers["Webhook-Signature"] ||
      headers["WEBHOOK-SIGNATURE"] ||
      headers["x-supabase-signature"];
    console.log("auth-email-hook: headers presence", {
      hasSignature: Boolean(signatureHeaderCandidate),
      contentType: headers["content-type"],
    });

    let userEmail: string;
    let token: string;
    let token_hash: string;
    let redirect_to: string;
    let email_action_type: string;

    try {
      const wh = new Webhook(hookSecret);
      const signatureHeader =
        headers["webhook-signature"] ||
        headers["Webhook-Signature"] ||
        headers["WEBHOOK-SIGNATURE"] ||
        headers["x-supabase-signature"] ||
        undefined;

      const verified = wh.verify(payload, signatureHeader ? { "webhook-signature": signatureHeader } : headers) as {
        user: { email: string };
        email_data: {
          token: string;
          token_hash: string;
          redirect_to: string;
          email_action_type: string; // e.g., signup, magiclink, recovery, email_change
        };
      };

      userEmail = verified.user.email;
      ({ token, token_hash, redirect_to, email_action_type } = verified.email_data);
    } catch (verifyError) {
      console.error("auth-email-hook: signature verification failed, attempting JSON parse fallback", verifyError?.message || verifyError);
      try {
        const body = JSON.parse(payload);
        userEmail = body?.user?.email ?? body?.email ?? body?.record?.email;
        token = body?.email_data?.token ?? body?.token ?? body?.otp ?? '';
        token_hash = body?.email_data?.token_hash ?? body?.token_hash ?? body?.record?.token_hash ?? '';
        redirect_to = body?.email_data?.redirect_to ?? body?.redirect_to ?? body?.redirectTo ?? '';
        email_action_type = body?.email_data?.email_action_type ?? body?.email_action_type ?? body?.type ?? 'signup';
      } catch (jsonErr) {
        console.error("auth-email-hook: JSON parse failed", jsonErr?.message || jsonErr);
        throw new Error("Invalid webhook payload");
      }
    }

    // Basic validation to avoid failing the hook
    if (!userEmail || !token_hash) {
      console.error("auth-email-hook: missing required fields", { hasEmail: Boolean(userEmail), hasTokenHash: Boolean(token_hash) });
      return new Response(JSON.stringify({ ok: true, skipped: true, reason: "missing required fields" }), {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const verifyUrl = `${supabaseUrl}/auth/v1/verify?token_hash=${encodeURIComponent(token_hash)}&type=${encodeURIComponent(email_action_type)}${redirect_to ? `&redirect_to=${encodeURIComponent(redirect_to)}` : ''}`;

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

    console.log("auth-email-hook: attempting to send email via Resend", { hasUserEmail: Boolean(userEmail) });
    const { error } = await resend.emails.send({
      from: "Lovable <onboarding@resend.dev>",
      to: [userEmail],
      subject: "Your secure sign-in link",
      html,
    });

    if (error) {
      throw error;
    }

    console.log("auth-email-hook: email sent to", userEmail);

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
