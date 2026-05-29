import crypto from "crypto";
import { createClient } from "@supabase/supabase-js";
import { wrapEmail, templateDeliveryEmail } from "./_email.js";

export const config = { api: { bodyParser: false } };

async function readRaw(req) {
  const chunks = [];
  for await (const chunk of req) chunks.push(typeof chunk === "string" ? Buffer.from(chunk) : chunk);
  return Buffer.concat(chunks).toString("utf8");
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
      html: templateDeliveryEmail({
        customerName: session.customer_name,
        customerEmail: session.customer_email,
        orderId: reference,
        template,
        priceCents: template.launch_price,
        isFree: false,
        paymentMethod: "Paystack",
      }),
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
