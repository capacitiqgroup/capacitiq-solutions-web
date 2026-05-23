export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  const { to, subject, text } = req.body || {};
  if (!to || !subject || !text) return res.status(400).json({ error: "Missing fields" });
  const r = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from: "noreply@capacitiq.co.za", to, subject, text }),
  });
  const data = await r.json();
  return res.status(r.ok ? 200 : 500).json(data);
}