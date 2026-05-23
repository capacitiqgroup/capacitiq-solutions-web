import { createClient } from "@supabase/supabase-js";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  const { token, amountInCents, currency, orderId, customerEmail, customerName, items } = req.body;
  const yocoSecret = process.env.YOCO_SECRET_KEY;
  if (!yocoSecret) return res.status(500).json({ success: false, error: "Payment configuration error" });

  const chargeResp = await fetch("https://online.yoco.com/v1/charges/", {
    method: "POST",
    headers: { "X-Auth-Secret-Key": yocoSecret, "Content-Type": "application/json" },
    body: JSON.stringify({ token, amountInCents, currency }),
  });
  const charge = await chargeResp.json();

  if (charge.status !== "successful") {
    return res.status(200).json({ success: false, error: charge.displayMessage || "Payment failed." });
  }

  const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
  await supabase.from("orders").insert({
    id: orderId, customer_email: customerEmail, customer_name: customerName,
    items, amount_in_cents: amountInCents, yoco_charge_id: charge.id, status: "paid",
  });

  for (const item of items) {
    const { data: tmpl } = await supabase.from("templates").select("canva_link,name").eq("id", item.id).single();
    if (tmpl?.canva_link) {
      await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          from: "noreply@capacitiq.co.za", to: customerEmail,
          subject: "Your Capacitiq Template — Here is Your Download Link",
          text: `Hi ${customerName},\n\nThank you for your purchase. Your Canva template is ready.\n\nTemplate: ${tmpl.name}\n\nAccess your template here:\n${tmpl.canva_link}\n\nA Canva account is required to access and edit your template.\n\nCapacitiq Solutions (Pty) Ltd · B-BBEE Level 1 · Johannesburg, South Africa\nhello@capacitiq.co.za · www.capacitiq.co.za`,
        }),
      });
    }
  }

  await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: "noreply@capacitiq.co.za", to: "hello@capacitiq.co.za",
      subject: `New Template Sale — ${items.map((i) => i.name).join(", ")}`,
      text: `New order received.\n\nCustomer: ${customerName}\nEmail: ${customerEmail}\nTemplates: ${items.map((i) => i.name).join(", ")}\nAmount: R${(amountInCents / 100).toFixed(0)}\nYoco Charge ID: ${charge.id}\nDate: ${new Date().toISOString()}`,
    }),
  });

  return res.status(200).json({ success: true, chargeId: charge.id });
}