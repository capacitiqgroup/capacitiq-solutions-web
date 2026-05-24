import { sendResend, wrapEmail, genericEmail } from "./_email.js";

const isEmail = (s) => typeof s === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  const { email, suggestion } = req.body || {};
  if (!isEmail(email)) return res.status(400).json({ error: "Invalid email" });

  await sendResend({
    to: "hello@capacitiq.co.za",
    subject: "New Template Waitlist Signup",
    html: wrapEmail(`
<h2 style="color:#0b4650;font-family:Arial,sans-serif;font-size:20px;margin:0 0 8px;">New Template Waitlist Signup</h2>
<div style="background:#f5f7f8;border-radius:12px;padding:20px;margin-top:16px;">
  <p style="margin:0;font-family:Arial,sans-serif;font-size:13px;color:#4a6670;">Email: <strong style="color:#0b4650;">${email}</strong></p>
  <p style="margin:8px 0 0;font-family:Arial,sans-serif;font-size:13px;color:#4a6670;">Suggestion: ${suggestion || "—"}</p>
  <p style="margin:8px 0 0;font-family:Arial,sans-serif;font-size:12px;color:#4a6670;">Date: ${new Date().toLocaleString("en-ZA")}</p>
</div>`),
  });

  await sendResend({
    to: email,
    subject: "You are on the Capacitiq Template Waitlist",
    html: genericEmail(`Hi there,\n\nYou are on the list. We will notify you as soon as new Capacitiq template packs go live. We have also noted your suggestion and will keep it in mind as we build out the library.\n\nIn the meantime you can browse our current templates at www.capacitiq.co.za/templates.`),
  });

  return res.status(200).json({ success: true });
}