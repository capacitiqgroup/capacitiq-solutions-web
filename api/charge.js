import { createClient } from "@supabase/supabase-js";
import { templateDeliveryEmail, sendResend, wrapEmail } from "./_email.js";
import { buildInvoicePdf, invoiceNumber } from "./_invoice.js";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" }[c]));
const isEmail = (s) => typeof s === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  try {
    // SECURITY: Never trust client-supplied amounts. Only template IDs accepted.
    const body = req.body || {};
    const templateIds = Array.isArray(body.templateIds) ? body.templateIds : body.itemIds;
    const { token, currency = "ZAR", orderId, customerEmail, customerName } = body;
    if (!Array.isArray(templateIds) || templateIds.length === 0) return res.status(400).json({ success: false, error: "Invalid request" });
    if (!templateIds.every((id) => UUID_RE.test(id))) return res.status(400).json({ success: false, error: "Invalid template ID format" });
    if (!isEmail(customerEmail) || !customerName || typeof customerName !== "string" || !orderId) {
      return res.status(400).json({ success: false, error: "Missing customer info" });
    }

    const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
    const { data: templates, error: tErr } = await supabase
      .from("templates")
      .select("id,name,category,launch_price,canva_link,preview_image")
      .in("id", templateIds)
      .eq("status", "published");
    if (tErr) {
      console.error("Charge template fetch error:", tErr);
      return res.status(500).json({ success: false, error: "An error occurred. Please try again." });
    }
    if (!templates || templates.length !== templateIds.length) {
      return res.status(400).json({ success: false, error: "One or more templates are unavailable" });
    }

    const serverAmountInCents = templates.reduce((s, t) => s + (t.launch_price || 0), 0);
    const isFree = serverAmountInCents === 0;

    let chargeId = null;
    if (!isFree) {
      const yocoSecret = process.env.YOCO_SECRET_KEY;
      if (!yocoSecret) {
        console.error("Charge error: YOCO_SECRET_KEY missing");
        return res.status(500).json({ success: false, error: "An error occurred. Please try again." });
      }
      if (!token) return res.status(400).json({ success: false, error: "Missing payment token" });
      const chargeResp = await fetch("https://online.yoco.com/v1/charges/", {
        method: "POST",
        headers: { "X-Auth-Secret-Key": yocoSecret, "Content-Type": "application/json" },
        body: JSON.stringify({ token, amountInCents: serverAmountInCents, currency }),
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
      amount_in_cents: serverAmountInCents,
      yoco_charge_id: chargeId,
      status: isFree ? "free" : "paid",
    });

    // Build invoice PDF once and attach to each delivery email
    let invoiceAttachment = null;
    try {
      const pdfBuf = await buildInvoicePdf({ orderId, customerName, customerEmail, templates, totalCents: serverAmountInCents });
      invoiceAttachment = {
        filename: `Capacitiq-Invoice-${invoiceNumber(orderId)}.pdf`,
        content: pdfBuf.toString("base64"),
      };
    } catch {/* invoice failure should not block delivery */}

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
        attachments: invoiceAttachment ? [invoiceAttachment] : undefined,
      });
    }

    // Queue review request (3 days later)
    try {
      await supabase.from("review_requests").insert({
        customer_email: customerEmail,
        customer_name: customerName,
        template_name: templates.map((t) => t.name).join(", "),
        order_id: orderId,
      });
    } catch {/* non-blocking */}

    // Internal notification
    const summary = templates.map((t) => `• ${esc(t.name)} — ${t.launch_price === 0 ? "FREE" : "R" + (t.launch_price / 100).toFixed(0)}`).join("<br/>");
    await sendResend({
      to: "hello@capacitiq.co.za",
      subject: `New Template ${isFree ? "Free Download" : "Sale"} — ${templates.map((t) => t.name).join(", ").slice(0, 200)}`,
      html: wrapEmail(`
<h2 style="color:#0b4650;font-family:Arial,sans-serif;font-size:20px;margin:0 0 8px;">New ${isFree ? "Free Download" : "Order"}</h2>
<div style="background:#f5f7f8;border-radius:12px;padding:20px;margin-top:16px;">
  <p style="margin:0;font-family:Arial,sans-serif;font-size:13px;color:#4a6670;">Customer: <strong style="color:#0b4650;">${esc(customerName)}</strong></p>
  <p style="margin:6px 0 0;font-family:Arial,sans-serif;font-size:13px;color:#4a6670;">Email: ${esc(customerEmail)}</p>
  <p style="margin:6px 0 0;font-family:Arial,sans-serif;font-size:13px;color:#4a6670;">Templates:<br/>${summary}</p>
  <p style="margin:10px 0 0;font-family:Arial,sans-serif;font-size:14px;color:#0b4650;font-weight:bold;">Total: ${isFree ? "FREE" : "R" + (serverAmountInCents / 100).toFixed(0)}</p>
  ${chargeId ? `<p style="margin:6px 0 0;font-family:Arial,sans-serif;font-size:12px;color:#4a6670;">Yoco Charge ID: ${esc(chargeId)}</p>` : ""}
  <p style="margin:6px 0 0;font-family:Arial,sans-serif;font-size:12px;color:#4a6670;">Order Ref: ${esc(orderId)}</p>
</div>`),
    });

    return res.status(200).json({ success: true, chargeId, free: isFree });
  } catch (error) {
    console.error("Charge error:", error);
    return res.status(500).json({ success: false, error: "An error occurred. Please try again." });
  }
}