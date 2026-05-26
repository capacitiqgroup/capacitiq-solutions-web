import { createClient } from "@supabase/supabase-js";
import { wrapEmail, sendResend } from "../_email.js";

export default async function handler(req, res) {
  if (req.headers.authorization !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).end();
  }
  try {
    const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
    const { data: requests } = await supabase
      .from("review_requests")
      .select("*")
      .eq("sent", false)
      .lte("send_after", new Date().toISOString());

    const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;" }[c]));

    for (const r of requests || []) {
      const html = wrapEmail(`
<h2 style="color:#0b4650;font-family:Arial,sans-serif;font-size:20px;margin:0 0 8px;">We would love your feedback.</h2>
<p style="color:#4a6670;font-family:Arial,sans-serif;font-size:15px;margin:0 0 24px;">Hi ${esc(r.customer_name)}, we hope you are enjoying your ${esc(r.template_name)} template. Your experience matters to us — would you mind taking 60 seconds to share your thoughts?</p>
<div style="text-align:center;margin-bottom:24px;">
  <a href="https://g.page/r/CfMNt5hlybN9EBM/review" style="display:inline-block;background:#e6ff2b;color:#0b4650;font-family:Arial,sans-serif;font-size:14px;font-weight:bold;padding:16px 36px;border-radius:50px;text-decoration:none;text-transform:uppercase;letter-spacing:0.05em;">Leave a Review on Google</a>
  <p style="margin:12px 0 0;font-family:Arial,sans-serif;font-size:12px;color:#4a6670;">Takes less than 60 seconds. Your feedback helps other businesses find us.</p>
</div>
<p style="font-family:Arial,sans-serif;font-size:12px;color:#4a6670;margin:0;">Questions about your template? Contact us at <a href="mailto:hello@capacitiq.co.za" style="color:#0b4650;">hello@capacitiq.co.za</a></p>`);
      await sendResend({ to: r.customer_email, subject: "How was your Capacitiq template experience?", html });
      await supabase.from("review_requests").update({ sent: true }).eq("id", r.id);
    }
    return res.status(200).json({ processed: requests?.length || 0 });
  } catch (e) {
    console.error("cron send-reviews error:", e);
    return res.status(500).json({ error: "Server error" });
  }
}