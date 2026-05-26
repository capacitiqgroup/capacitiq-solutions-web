import { sendResend, contactFormEmail, spotterReferralEmail, genericEmail } from "./_email.js";

const STATIC_ALLOWLIST = new Set(["hello@capacitiq.co.za", "careers@capacitiq.co.za"]);
const ALLOWED_TYPES = new Set(["contact", "spotter", "pricing-guide", "waitlist", "career-application"]);
const isEmail = (s) => typeof s === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);

const RATE_WINDOW_MS = 60_000;
const RATE_MAX = 5;
const rateBuckets = globalThis.__capacitiqRateBuckets ||= new Map();
function rateLimited(ip) {
  const now = Date.now();
  const arr = (rateBuckets.get(ip) || []).filter((t) => now - t < RATE_WINDOW_MS);
  if (arr.length >= RATE_MAX) { rateBuckets.set(ip, arr); return true; }
  arr.push(now); rateBuckets.set(ip, arr); return false;
}

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  try {
    const ip =
      (req.headers["x-forwarded-for"] || "").toString().split(",")[0].trim() ||
      req.socket?.remoteAddress || "unknown";
    if (rateLimited(ip)) return res.status(429).json({ error: "Rate limit exceeded" });

    const { to, subject, text, type, payload, userEmail } = req.body || {};
    if (!to || !subject) return res.status(400).json({ error: "Missing fields" });
    if (type && !ALLOWED_TYPES.has(type)) return res.status(400).json({ error: "Invalid type" });

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
    return res.status(ok ? 200 : 500).json(ok ? data : { error: "Email send failed" });
  } catch (error) {
    console.error("send-email error:", error);
    return res.status(500).json({ error: "An error occurred. Please try again." });
  }
}