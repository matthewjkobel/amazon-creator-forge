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
      console.log("auth-email-hook: no webhook secret configured, parsing payload directly");
    }
    if (!resendKey) {
      console.warn("Missing RESEND_API_KEY - will skip sending email but return 200 to avoid blocking signup");
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
      if (hookSecret) {
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
            email_action_type: string;
          };
        };

        userEmail = verified.user.email;
        ({ token, token_hash, redirect_to, email_action_type } = verified.email_data);
      } else {
        // No secret configured, parse JSON directly
        const body = JSON.parse(payload);
        userEmail = body?.user?.email ?? body?.email ?? body?.record?.email;
        token = body?.email_data?.token ?? body?.token ?? body?.otp ?? '';
        token_hash = body?.email_data?.token_hash ?? body?.token_hash ?? body?.record?.token_hash ?? '';
        redirect_to = body?.email_data?.redirect_to ?? body?.redirect_to ?? body?.redirectTo ?? '';
        email_action_type = body?.email_data?.email_action_type ?? body?.email_action_type ?? body?.type ?? 'signup';
      }
    } catch (parseError) {
      console.error("auth-email-hook: failed to parse webhook payload", parseError?.message || parseError);
      throw new Error("Invalid webhook payload");
    }

    // Basic validation to avoid failing the hook
    if (!userEmail || !token_hash) {
      console.error("auth-email-hook: missing required fields", { hasEmail: Boolean(userEmail), hasTokenHash: Boolean(token_hash) });
      return new Response(JSON.stringify({ ok: true, skipped: true, reason: "missing required fields" }), {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const verifyUrl = `${supabaseUrl}/auth/v1/verify?token=${encodeURIComponent(token_hash)}&type=${encodeURIComponent(email_action_type)}${redirect_to ? `&redirect_to=${encodeURIComponent(redirect_to)}` : ''}`;

    const actionText = email_action_type === 'recovery' ? 'Reset Your Password' : 
                       email_action_type === 'email_change' ? 'Confirm Email Change' :
                       'Complete Your Sign Up';

    const actionDescription = email_action_type === 'recovery' ? 'Click the button below to reset your password:' :
                             email_action_type === 'email_change' ? 'Click the button below to confirm your email change:' :
                             'Welcome to Partner Connections! Click the button below to activate your account:';

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>${actionText} - Partner Connections</title>
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 40px;">
            <h1 style="color: #1a73e8; margin: 0; font-size: 24px;">Partner Connections</h1>
            <p style="color: #666; margin: 8px 0 0 0; font-size: 14px;">The Premier Creator Partnership Platform</p>
          </div>
          
          <div style="background: #f8f9fa; border-radius: 12px; padding: 32px; text-align: center; margin-bottom: 24px;">
            <h2 style="color: #333; margin: 0 0 16px 0; font-size: 20px;">${actionText}</h2>
            <p style="color: #666; margin: 0 0 24px 0; font-size: 16px;">${actionDescription}</p>
            
            <a href="${verifyUrl}" 
               style="display: inline-block; background: #1a73e8; color: white; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-weight: 600; font-size: 16px; margin-bottom: 20px;">
              ${actionText}
            </a>
            
            <div style="margin-top: 24px; padding: 16px; background: white; border-radius: 8px; border: 1px solid #e8eaed;">
              <p style="color: #666; margin: 0 0 8px 0; font-size: 14px;">Or copy this verification code:</p>
              <code style="display: inline-block; background: #f1f3f4; padding: 8px 12px; border-radius: 4px; font-family: monospace; font-size: 16px; color: #333; letter-spacing: 2px;">${token}</code>
            </div>
          </div>
          
          <div style="text-align: center; color: #666; font-size: 12px;">
            <p>If you didn't request this, you can safely ignore this email.</p>
            <p style="margin-top: 20px;">
              <a href="https://partnerconnections.com" style="color: #1a73e8; text-decoration: none;">Visit Partner Connections</a>
            </p>
          </div>
        </body>
      </html>
    `;

    let sendError: any = null;
    if (resendKey) {
      const resend = new Resend(resendKey);
      console.log("auth-email-hook: attempting to send email via Resend", { 
        hasUserEmail: Boolean(userEmail),
        userEmail: userEmail,
        hasHTML: Boolean(html)
      });
      try {
        const result = await resend.emails.send({
          from: "Partner Connections <no-reply@mail.partnerconnections.com>",
          to: [userEmail],
          subject: actionText + " - Partner Connections",
          html,
        });
        console.log("auth-email-hook: Resend API response", result);
        if (result.error) {
          sendError = result.error;
          console.error("auth-email-hook: Resend API returned error", result.error);
        } else {
          console.log("auth-email-hook: email sent successfully to", userEmail, "with ID:", result.data?.id);
        }
      } catch (e: any) {
        sendError = e?.message || e;
        console.error("auth-email-hook: Resend send failed", sendError);
      }
    } else {
      console.log("auth-email-hook: skipping email send - RESEND_API_KEY not configured");
    }

    console.log("auth-email-hook: completed", { delivered: !sendError });

    return new Response(JSON.stringify({ ok: true, delivered: !sendError }), {
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