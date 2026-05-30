import { createClient } from "@supabase/supabase-js";
import { wrapEmail } from "./_email.js";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  const { customerEmail, templatePaymentLink } = req.body || {};

  if (!customerEmail || !templatePaymentLink) {
    return res.status(400).json({ error: "Missing fields" });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(customerEmail)) {
    return res.status(400).json({ error: "Invalid email" });
  }

  const { data: template } = await supabase
    .from("templates")
    .select("id, name, canva_link, preview_image, launch_price, category")
    .eq("payment_link", templatePaymentLink)
    .eq("status", "published")
    .single();

  if (!template || !template.canva_link) {
    return res.status(404).json({ error: "Template not found" });
  }

  const { data: existing } = await supabase
    .from("orders")
    .select("id")
    .eq("customer_email", customerEmail)
    .like("yoco_charge_id", `paystack-${template.id}%`)
    .maybeSingle();

  if (existing) {
    return res.status(200).json({ success: true, alreadySent: true });
  }

  await supabase.from("orders").insert({
    customer_email: customerEmail,
    customer_name: customerEmail,
    items: [{ id: template.id, name: template.name, price: template.launch_price }],
    amount_in_cents: template.launch_price,
    yoco_charge_id: `paystack-${template.id}-${Date.now()}`,
    status: "paid",
  });

  await supabase.from("review_requests").insert({
    customer_email: customerEmail,
    customer_name: customerEmail,
    template_name: template.name,
    order_id: `paystack-${template.id}`,
    send_after: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    sent: false,
  });

  if (process.env.RESEND_API_KEY) {
    try {
      await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: "Capacitiq <noreply@capacitiq.co.za>",
          to: customerEmail,
          subject: `Your Capacitiq Template — ${template.name}`,
          html: wrapEmail(buildDeliveryEmail(template)),
        }),
      });
    } catch (e) {
      console.error("Resend error", e);
    }
  }

  return res.status(200).json({ success: true });
}

function buildDeliveryEmail(template) {
  const price = template.launch_price === 0 ? "FREE" : `R${(template.launch_price / 100).toFixed(0)}`;
  return `
    <h2 style="color:#0b4650;font-family:Arial,sans-serif;font-size:22px;margin:0 0 8px;">Here is your template.</h2>
    <p style="color:#4a6670;font-family:Arial,sans-serif;font-size:15px;margin:0 0 28px;">Thank you for your purchase. Your Canva template link is below.</p>
    <div style="background:#f5f7f8;border-radius:12px;padding:20px;margin-bottom:24px;">
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td width="80" style="vertical-align:top;padding-right:16px;">
            <img src="${template.preview_image}" width="72" height="40" style="border-radius:8px;object-fit:cover;display:block;border:0;" alt="${template.name} preview" />
          </td>
          <td style="vertical-align:top;">
            <p style="margin:0;font-family:Arial,sans-serif;font-size:14px;font-weight:bold;color:#0b4650;">${template.name}</p>
            <p style="margin:4px 0 0;font-family:Arial,sans-serif;font-size:12px;color:#4a6670;">${template.category} · Quantity: 1</p>
            <p style="margin:4px 0 0;font-family:Arial,sans-serif;font-size:14px;color:#0b4650;font-weight:bold;">${price}</p>
          </td>
        </tr>
      </table>
    </div>
    <div style="text-align:center;margin-bottom:24px;">
      <a href="${template.canva_link}" style="display:inline-block;background:#e6ff2b;color:#0b4650;font-family:Arial,sans-serif;font-size:14px;font-weight:bold;padding:16px 36px;border-radius:50px;text-decoration:none;text-transform:uppercase;letter-spacing:0.05em;border:none;">Access Your Template in Canva</a>
      <p style="margin:12px 0 0;font-family:Arial,sans-serif;font-size:12px;color:#4a6670;">A Canva account is required. <a href="https://canva.com" style="color:#0b4650;">Create one free at canva.com</a></p>
    </div>
    <div style="background:#fffbea;border-left:4px solid #e6ff2b;padding:16px;border-radius:0 8px 8px 0;margin-bottom:16px;">
      <p style="margin:0;font-family:Arial,sans-serif;font-size:12px;color:#4a6670;"><strong style="color:#0b4650;">Licence reminder:</strong> Licensed for personal or business use only. Do not resell or share the original template file or Canva link.</p>
    </div>
    <p style="font-family:Arial,sans-serif;font-size:12px;color:#4a6670;margin:0;">Issues? Email <a href="mailto:hello@capacitiq.co.za" style="color:#0b4650;">hello@capacitiq.co.za</a> within 7 days.</p>
  `;
}
