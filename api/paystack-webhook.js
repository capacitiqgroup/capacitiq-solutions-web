import crypto from "crypto";
import { createClient } from "@supabase/supabase-js";
import { wrapEmail } from "./_email.js";

export const config = { api: { bodyParser: false } };

async function readRaw(req) {
  const chunks = [];
  for await (const chunk of req) chunks.push(typeof chunk === "string" ? Buffer.from(chunk) : chunk);
  return Buffer.concat(chunks).toString("utf8");
}

function templateDeliveryEmail({ template, customerName }) {
  const priceR = template.launch_price ? `R${(template.launch_price / 100).toFixed(2)}` : "FREE";
  const thumb = template.preview_image
    ? `<img src="${template.preview_image}" alt="${template.name}" style="width:100%;max-width:480px;aspect-ratio:16/9;object-fit:cover;border-radius:12px;display:block;margin:0 auto 16px;" />`
    : "";
  return wrapEmail(`
    <h2 style="font-family:Arial,sans-serif;color:#0b4650;margin:0 0 8px;">Your Capacitiq Template is Ready</h2>
    <p style="font-family:Arial,sans-serif;color:#4a6670;">Hi ${customerName || "there"}, thank you for your purchase.</p>
    ${thumb}
    <table width="100%" cellpadding="8" cellspacing="0" style="font-family:Arial,sans-serif;color:#0b4650;border-collapse:collapse;margin:16px 0;">
      <tr><td><strong>Template</strong></td><td>${template.name}</td></tr>
      <tr><td><strong>Category</strong></td><td>${template.category || ""}</td></tr>
      <tr><td><strong>Price</strong></td><td>${priceR}</td></tr>
      <tr><td><strong>Shipping</strong></td><td>FREE (Digital)</td></tr>
    </table>
    <p style="text-align:center;margin:24px 0;">
      <a href="${template.canva_link}" style="background:#e6ff2b;color:#0b4650;font-family:Arial,sans-serif;font-weight:bold;padding:14px 28px;border-radius:12px;text-decoration:none;display:inline-block;">Access Your Template</a>
    </p>
    <p style="font-family:Arial,sans-serif;color:#4a6670;font-size:13px;">A Canva account is required. By using this template you agree to our Template Licence Policy: it is for your own personal and business use, and you may not resell or redistribute the original template file.</p>
  `);
}

async function sendResendDirect({ to, subject, html }) {
  const resp = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ from: "Capacitiq <noreply@capacitiq.co.za>", to, subject, html }),
  });
  if (!resp.ok) {
    const err = await resp.text();
    console.error("Resend error:", resp.status, err);
  }
}

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const rawBody = await readRaw(req);
  const signature = req.headers["x-paystack-signature"];
  const expected = crypto.createHmac("sha512", process.env.PAYSTACK_SECRET_KEY || "").update(rawBody).digest("hex");

  if (!signature || signature !== expected) {
    console.error("Invalid webhook signature");
    return res.status(401).end();
  }

  // Respond immediately
  res.status(200).end();

  let event;
  try { event = JSON.parse(rawBody); } catch { return; }

  if (event.event !== "charge.success") return;

  const reference = event.data.reference;
  const paidAmount = event.data.amount;

  const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

  const { data: existing } = await supabase.from("orders").select("id").eq("yoco_charge_id", reference).maybeSingle();
  if (existing) { console.log("Order already fulfilled:", reference); return; }

  const verifyRes = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
    headers: { Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}` },
  });
  if (!verifyRes.ok) { console.error("Verify failed:", reference); return; }
  const verifyData = await verifyRes.json();
  if (verifyData.data?.status !== "success") { console.error("Tx not success:", reference); return; }

  const { data: session } = await supabase.from("checkout_sessions").select("*").eq("session_token", reference).maybeSingle();
  if (!session) { console.error("No session:", reference); return; }

  if (paidAmount < session.amount_in_cents) {
    console.error("Amount mismatch:", paidAmount, "vs", session.amount_in_cents);
    return;
  }

  const { data: templates } = await supabase
    .from("templates")
    .select("id, name, launch_price, canva_link, preview_image, category")
    .in("id", session.template_ids)
    .eq("status", "published");

  if (!templates?.length) { console.error("Templates missing for session:", session.id); return; }

  const orderId = crypto.randomUUID();
  await supabase.from("orders").insert({
    id: orderId,
    customer_email: session.customer_email,
    customer_name: session.customer_name,
    items: templates.map((t) => ({ id: t.id, name: t.name, price: t.launch_price })),
    amount_in_cents: session.amount_in_cents,
    yoco_charge_id: reference,
    status: "paid",
  });

  await supabase.from("checkout_sessions").update({ status: "fulfilled" }).eq("session_token", reference);

  await supabase.from("review_requests").insert({
    customer_email: session.customer_email,
    customer_name: session.customer_name,
    template_name: templates.map((t) => t.name).join(", "),
    order_id: orderId,
    send_after: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    sent: false,
  });

  for (const template of templates) {
    if (!template.canva_link) continue;
    await sendResendDirect({
      to: session.customer_email,
      subject: `Your Capacitiq Template — ${template.name}`,
      html: templateDeliveryEmail({ template, customerName: session.customer_name }),
    });
  }

  await sendResendDirect({
    to: "hello@capacitiq.co.za",
    subject: `New Template Sale — ${templates.map((t) => t.name).join(", ")}`,
    html: wrapEmail(`
      <h2 style="font-family:Arial,sans-serif;color:#0b4650;">New Template Sale</h2>
      <p style="font-family:Arial,sans-serif;color:#4a6670;">
        Customer: <strong>${session.customer_name || ""}</strong><br/>
        Email: ${session.customer_email}<br/>
        Templates: ${templates.map((t) => t.name).join(", ")}<br/>
        Amount: R${(session.amount_in_cents / 100).toFixed(2)}<br/>
        Reference: ${reference}<br/>
        Date: ${new Date().toISOString()}
      </p>
    `),
  });
}
