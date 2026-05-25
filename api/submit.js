import { createClient } from "@supabase/supabase-js";
import { sendResend, contactFormEmail, spotterReferralEmail } from "./_email.js";

const KINDS = new Set(["contact", "spotter", "career_application"]);
const REQUIRED = {
  contact: ["fullName", "email", "businessName"],
  spotter: ["spotterName", "spotterEmail", "leadName", "leadCompany"],
  career_application: ["fullName", "email", "role"],
};
const MAX_LEN = 10000;

function validate(kind, data) {
  if (!data || typeof data !== "object" || Array.isArray(data)) return "Invalid data payload";
  for (const [k, v] of Object.entries(data)) {
    if (typeof v === "string" && v.length > MAX_LEN) return `Field ${k} too long`;
    if (Array.isArray(v)) {
      for (const item of v) {
        if (typeof item === "string" && item.length > MAX_LEN) return `Field ${k} too long`;
      }
    }
  }
  for (const r of REQUIRED[kind]) {
    const v = data[r];
    if (v === undefined || v === null || String(v).trim() === "") return `Missing required field: ${r}`;
  }
  return null;
}

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  try {
    const { kind, data } = req.body || {};
    if (!KINDS.has(kind)) return res.status(400).json({ error: "Invalid kind" });
    const err = validate(kind, data);
    if (err) return res.status(400).json({ error: err });

    const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
    const { error: dbErr } = await supabase.from("submissions").insert({ kind, data });
    if (dbErr) return res.status(500).json({ error: "Database error" });

    // Internal notification email
    try {
      if (kind === "contact") {
        await sendResend({
          to: "hello@capacitiq.co.za",
          subject: `New Contact Form Submission — ${data.fullName}`,
          html: contactFormEmail(data),
        });
      } else if (kind === "spotter") {
        await sendResend({
          to: "hello@capacitiq.co.za",
          subject: `New Spotter Referral — ${data.leadCompany}`,
          html: spotterReferralEmail(data),
        });
      }
    } catch {/* email failure should not block submission */}

    return res.status(200).json({ success: true });
  } catch (e) {
    return res.status(500).json({ error: e?.message || "Server error" });
  }
}