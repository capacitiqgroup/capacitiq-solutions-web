import { sendResend, wrapEmail } from "./_email.js";

const esc = (s) => String(s ?? "—").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  const f = req.body || {};
  const body = `
<h2 style="color:#0b4650;font-family:Arial,sans-serif;font-size:20px;margin:0 0 8px;">New Job Application</h2>
<p style="color:#4a6670;font-family:Arial,sans-serif;font-size:14px;margin:0 0 16px;">Role: <strong style="color:#0b4650;">${esc(f.role)}</strong></p>
<div style="background:#f5f7f8;border-radius:12px;padding:20px;">
  <p style="margin:0;font-family:Arial,sans-serif;font-size:13px;color:#4a6670;">Name: <strong style="color:#0b4650;">${esc(f.fullName)}</strong></p>
  <p style="margin:6px 0 0;font-family:Arial,sans-serif;font-size:13px;color:#4a6670;">Email: ${esc(f.email)}</p>
  <p style="margin:6px 0 0;font-family:Arial,sans-serif;font-size:13px;color:#4a6670;">Phone: ${esc(f.phone)}</p>
  <p style="margin:6px 0 0;font-family:Arial,sans-serif;font-size:13px;color:#4a6670;">Location: ${esc(f.location)}</p>
  <p style="margin:6px 0 0;font-family:Arial,sans-serif;font-size:13px;color:#4a6670;">LinkedIn / Portfolio: ${esc(f.linkedin)}</p>
  <p style="margin:12px 0 0;font-family:Arial,sans-serif;font-size:13px;color:#4a6670;"><strong style="color:#0b4650;">Why Capacitiq:</strong><br/>${esc(f.why).replace(/\n/g, "<br/>")}</p>
  <p style="margin:12px 0 0;font-family:Arial,sans-serif;font-size:13px;color:#4a6670;"><strong style="color:#0b4650;">Experience:</strong><br/>${esc(f.experience).replace(/\n/g, "<br/>")}</p>
  <p style="margin:12px 0 0;font-family:Arial,sans-serif;font-size:12px;color:#4a6670;">Submitted: ${new Date().toLocaleString("en-ZA")}</p>
</div>`;
  const { ok, data } = await sendResend({ to: "careers@capacitiq.co.za", subject: `New Application — ${f.role} — ${f.fullName}`, html: wrapEmail(body) });
  return res.status(ok ? 200 : 500).json(data);
}