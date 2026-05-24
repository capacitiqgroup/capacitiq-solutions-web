import { createClient } from "@supabase/supabase-js";
import { templateDeliveryEmail, sendResend, wrapEmail } from "./_email.js";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  try {
    const { token, currency = "ZAR", orderId, customerEmail, customerName, itemIds } = req.body || {};
    if (!Array.isArray(itemIds) || itemIds.length === 0) return res.status(400).json({ success: false, error: "No items" });
    if (!customerEmail || !customerName || !orderId) return res.status(400).json({ success: false, error: "Missing customer info" });

    const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
    const { data: templates, error: tErr } = await supabase
      .from("templates")
      .select("id,name,category,launch_price,canva_link,preview_image")
      .in("id", itemIds);
    if (tErr) return res.status(500).json({ success: false, error: "Database error" });
    if (!templates || templates.length !== itemIds.length) {
      return res.status(400).json({ success: false, error: "Invalid template id" });
    }

    const totalCents = templates.reduce((s, t) => s + (t.launch_price || 0), 0);
    const isFree = totalCents === 0;

    let chargeId = null;
    if (!isFree) {
      const yocoSecret = process.env.YOCO_SECRET_KEY;
      if (!yocoSecret) return res.status(500).json({ success: false, error: "Payment configuration error" });
      if (!token) return res.status(400).json({ success: false, error: "Missing payment token" });
      const chargeResp = await fetch("https://online.yoco.com/v1/charges/", {
        method: "POST",
        headers: { "X-Auth-Secret-Key": yocoSecret, "Content-Type": "application/json" },
        body: JSON.stringify({ token, amountInCents: totalCents, currency }),
      });
      const charge = await chargeResp.json();
      if (charge.status !== "successful") {
        return res.status(200).json({ success: false, error: charge.displayMessage || "Payment failed." });
      }
      chargeId = charge.id;
    }

    await supabase.from("orders").insert({
      id: orderId,
      customer_email: customerEmail,
      customer_name: customerName,
      items: templates.map((t) => ({ id: t.id, name: t.name, category: t.category, price: t.launch_price })),
      amount_in_cents: totalCents,
      yoco_charge_id: chargeId,
      status: isFree ? "free" : "paid",
    });

    // Customer delivery emails (one per template) — recipient is customer's own email
    for (const tmpl of templates) {
      if (!tmpl.canva_link) continue;
      await sendResend({
        to: customerEmail,
        subject: "Your Capacitiq Template — Here is Your Download Link",
        html: templateDeliveryEmail({
          customerName, customerEmail, orderId, template: tmpl,
          priceCents: tmpl.launch_price, isFree: tmpl.launch_price === 0,
          paymentMethod: isFree ? "Free download" : "Card via Yoco",
        }),
      });
    }

    // Internal notification
    const summary = templates.map((t) => `• ${t.name} — ${t.launch_price === 0 ? "FREE" : "R" + (t.launch_price / 100).toFixed(0)}`).join("<br/>");
    await sendResend({
      to: "hello@capacitiq.co.za",
      subject: `New Template ${isFree ? "Free Download" : "Sale"} — ${templates.map((t) => t.name).join(", ")}`,
      html: wrapEmail(`
<h2 style="color:#0b4650;font-family:Arial,sans-serif;font-size:20px;margin:0 0 8px;">New ${isFree ? "Free Download" : "Order"}</h2>
<div style="background:#f5f7f8;border-radius:12px;padding:20px;margin-top:16px;">
  <p style="margin:0;font-family:Arial,sans-serif;font-size:13px;color:#4a6670;">Customer: <strong style="color:#0b4650;">${customerName}</strong></p>
  <p style="margin:6px 0 0;font-family:Arial,sans-serif;font-size:13px;color:#4a6670;">Email: ${customerEmail}</p>
  <p style="margin:6px 0 0;font-family:Arial,sans-serif;font-size:13px;color:#4a6670;">Templates:<br/>${summary}</p>
  <p style="margin:10px 0 0;font-family:Arial,sans-serif;font-size:14px;color:#0b4650;font-weight:bold;">Total: ${isFree ? "FREE" : "R" + (totalCents / 100).toFixed(0)}</p>
  ${chargeId ? `<p style="margin:6px 0 0;font-family:Arial,sans-serif;font-size:12px;color:#4a6670;">Yoco Charge ID: ${chargeId}</p>` : ""}
  <p style="margin:6px 0 0;font-family:Arial,sans-serif;font-size:12px;color:#4a6670;">Order Ref: ${orderId}</p>
</div>`),
    });

    return res.status(200).json({ success: true, chargeId, free: isFree });
  } catch (e) {
    return res.status(500).json({ success: false, error: e?.message || "Server error" });
  }
}