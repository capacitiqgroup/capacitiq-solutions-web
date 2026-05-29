import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";
import { wrapEmail, templateDeliveryEmail } from "./_email.js";

async function sendResendDirect({ to, subject, html }) {
  const resp = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from: "Capacitiq <noreply@capacitiq.co.za>", to, subject, html }),
  });
  if (!resp.ok) {
    const err = await resp.text();
    console.error("Resend error:", resp.status, err);
    return false;
  }
  return true;
}

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const { customerName, customerEmail, templateIds } = req.body || {};
  if (!customerName || !customerEmail || !Array.isArray(templateIds) || templateIds.length === 0) {
    return res.status(400).json({ error: "Missing required fields" });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerEmail)) return res.status(400).json({ error: "Invalid email" });
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!templateIds.every((id) => uuidRegex.test(id))) return res.status(400).json({ error: "Invalid template IDs" });

  const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

  const { data: templates, error } = await supabase
    .from("templates")
    .select("id, name, launch_price, canva_link, preview_image, category")
    .in("id", templateIds)
    .eq("status", "published");

  if (error || !templates || templates.length !== templateIds.length) {
    return res.status(400).json({ error: "Templates unavailable" });
  }
  if (!templates.every((t) => (t.launch_price ?? 0) === 0)) {
    return res.status(400).json({ error: "Not all items are free" });
  }

  const orderId = crypto.randomUUID();
  await supabase.from("orders").insert({
    id: orderId,
    customer_email: customerEmail,
    customer_name: customerName,
    items: templates.map((t) => ({ id: t.id, name: t.name, price: 0 })),
    amount_in_cents: 0,
    status: "free",
  });

  for (const template of templates) {
    if (!template.canva_link) continue;
    await sendResendDirect({
      to: customerEmail,
      subject: `Your Free Capacitiq Template — ${template.name}`,
      html: templateDeliveryEmail({
        customerName, customerEmail, orderId, template,
        priceCents: 0, isFree: true, paymentMethod: "Free",
      }),
    });
  }

  await sendResendDirect({
    to: "hello@capacitiq.co.za",
    subject: `New Free Template Delivery — ${templates.map((t) => t.name).join(", ")}`,
    html: wrapEmail(`
      <h2 style="font-family:Arial,sans-serif;color:#0b4650;">Free Template Delivered</h2>
      <p style="font-family:Arial,sans-serif;color:#4a6670;">
        Customer: <strong>${customerName}</strong><br/>
        Email: ${customerEmail}<br/>
        Templates: ${templates.map((t) => t.name).join(", ")}<br/>
        Order: ${orderId}<br/>
        Date: ${new Date().toISOString()}
      </p>`),
  });

  return res.status(200).json({ ok: true, orderId });
}
