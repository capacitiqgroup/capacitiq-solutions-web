export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  const { email, suggestion } = req.body || {};
  const auth = { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, "Content-Type": "application/json" };
  await fetch("https://api.resend.com/emails", {
    method: "POST", headers: auth,
    body: JSON.stringify({
      from: "noreply@capacitiq.co.za", to: "hello@capacitiq.co.za",
      subject: "New Template Waitlist Signup",
      text: `Email: ${email}\nSuggestion: ${suggestion}\nDate: ${new Date().toISOString()}`,
    }),
  });
  await fetch("https://api.resend.com/emails", {
    method: "POST", headers: auth,
    body: JSON.stringify({
      from: "noreply@capacitiq.co.za", to: email,
      subject: "You are on the Capacitiq Template Waitlist",
      text: `Hi there,\n\nYou are on the list. We will notify you as soon as new Capacitiq template packs go live. We have also noted your suggestion and will keep it in mind as we build out the library.\n\nIn the meantime you can browse our current templates at www.capacitiq.co.za/templates.\n\nCapacitiq Solutions (Pty) Ltd · B-BBEE Level 1 · Johannesburg, South Africa\nhello@capacitiq.co.za · www.capacitiq.co.za`,
    }),
  });
  return res.status(200).json({ success: true });
}