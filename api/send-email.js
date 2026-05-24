import { sendResend, contactFormEmail, spotterReferralEmail, genericEmail } from "./_email.js";

const STATIC_ALLOWLIST = new Set(["hello@capacitiq.co.za", "careers@capacitiq.co.za"]);
const isEmail = (s) => typeof s === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  try {
    const { to, subject, text, type, payload, userEmail } = req.body || {};
    if (!to || !subject) return res.status(400).json({ error: "Missing fields" });

    // Allowlist: only static addresses, or the user's own submitted email (echoed back as userEmail)
    const allowed = new Set(STATIC_ALLOWLIST);
    if (isEmail(userEmail)) allowed.add(userEmail.toLowerCase());
    const recipients = Array.isArray(to) ? to : [to];
    for (const r of recipients) {
      if (!allowed.has(String(r).toLowerCase())) {
        return res.status(403).json({ error: "Recipient not permitted" });
      }
    }

    let html;
    if (type === "contact") html = contactFormEmail(payload || {});
    else if (type === "spotter") html = spotterReferralEmail(payload || {});
    else html = genericEmail(text || "");

    const { ok, data } = await sendResend({ to: recipients, subject, html });
    return res.status(ok ? 200 : 500).json(data);
  } catch (e) {
    return res.status(500).json({ error: e?.message || "Server error" });
  }
}