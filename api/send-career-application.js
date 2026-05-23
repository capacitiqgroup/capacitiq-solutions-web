export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  const f = req.body || {};
  const r = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: "noreply@capacitiq.co.za", to: "careers@capacitiq.co.za",
      subject: `New Application — ${f.role} — ${f.fullName}`,
      text: `New Job Application\n\nRole Applied For: ${f.role}\nName: ${f.fullName}\nEmail: ${f.email}\nPhone: ${f.phone}\nLocation: ${f.location}\n\nWhy Capacitiq:\n${f.why}\n\nExperience and Background:\n${f.experience}\n\nLinkedIn / Portfolio: ${f.linkedin}\n\nSubmitted: ${new Date().toISOString()}`,
    }),
  });
  return res.status(r.ok ? 200 : 500).json(await r.json());
}