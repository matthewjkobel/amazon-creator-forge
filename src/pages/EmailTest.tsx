import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

const EmailTest = () => {
  console.log("EmailTest component loaded");
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [message, setMessage] = useState<string>("");

  const to = searchParams.get("to");

  const payload = useMemo(() => ({
    to: to || "",
    subject: "Test email from Partner Connections",
    html: `
      <h1 style="margin:0 0 12px; font-size:20px;">Hello from Partner Connections</h1>
      <p style="margin:0 0 8px;">This is a test email sent via our Supabase Edge Function using Resend.</p>
      <p style="margin:0; color:#555;">From: no-reply@mail.partnerconnections.com</p>
    `,
  }), [to]);

  useEffect(() => {
    // Minimal SEO for this temporary page
    document.title = "Email Test | Partner Connections";
    const meta = document.querySelector('meta[name="description"]');
    if (!meta) {
      const m = document.createElement("meta");
      m.name = "description";
      m.content = "Send a test email via Supabase Edge Functions and Resend.";
      document.head.appendChild(m);
    }
  }, []);

  useEffect(() => {
    const sendTest = async () => {
      if (!to) {
        setMessage("Missing 'to' parameter. Append ?to=you@example.com to the URL.");
        return;
      }
      setStatus("sending");
      setMessage("");
      const { data, error } = await supabase.functions.invoke("send-email", {
        body: payload,
      });
      if (error) {
        setStatus("error");
        setMessage(error.message || "Failed to send email.");
        toast({ title: "Email failed", description: error.message || "Unknown error" });
      } else {
        setStatus("success");
        setMessage("Email request accepted. Check your inbox (and spam).\n" + (data?.data?.id ? `Message ID: ${data.data.id}` : ""));
        toast({ title: "Email sent", description: "Test email was dispatched successfully." });
      }
    };

    // Auto-send on mount
    sendTest();
  }, [to, payload, toast]);

  return (
    <main className="mx-auto max-w-2xl px-6 py-12">
      <h1 className="text-2xl font-semibold tracking-tight">Email Test</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Sends a test email through the public send-email edge function.
      </p>

      <section className="mt-6">
        <p className="text-sm"><strong>To:</strong> {to || "(not provided)"}</p>
        <p className="text-sm"><strong>Status:</strong> {status}</p>
        {message && (
          <pre className="mt-3 whitespace-pre-wrap text-sm">{message}</pre>
        )}
        {!to && (
          <p className="mt-4 text-sm">
            Usage: /email-test?to=you@example.com
          </p>
        )}
      </section>
    </main>
  );
};

export default EmailTest;
