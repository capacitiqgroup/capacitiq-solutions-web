import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
  const { templateIds, customerEmail, customerName } = req.body || {};

  if (!customerEmail || !Array.isArray(templateIds) || templateIds.length === 0) {
    return res.status(400).json({ error: "Missing required fields" });
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(customerEmail)) return res.status(400).json({ error: "Invalid email" });
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!templateIds.every((id) => uuidRegex.test(id))) return res.status(400).json({ error: "Invalid template IDs" });

  const { data: templates, error } = await supabase
    .from("templates")
    .select("id, name, launch_price, price")
    .in("id", templateIds)
    .eq("status", "published");

  if (error || !templates || templates.length !== templateIds.length) {
    return res.status(400).json({ error: "Templates unavailable" });
  }

  // launch_price stored in cents (ZAR sub-unit), Paystack ZAR amount is also in cents
  const amountInCents = templates.reduce((sum, t) => sum + (t.launch_price ?? t.price ?? 0), 0);
  if (amountInCents <= 0) return res.status(400).json({ error: "Invalid amount" });

  const reference = `CAP-${crypto.randomUUID()}`;

  const paystackRes = await fetch("https://api.paystack.co/transaction/initialize", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: customerEmail,
      amount: amountInCents,
      currency: "ZAR",
      reference,
      channels: ["card", "eft"],
      metadata: {
        customer_name: customerName,
        template_ids: templateIds.join(","),
        custom_fields: templates.map((t) => ({
          display_name: "Template",
          variable_name: "template_name",
          value: t.name,
        })),
      },
    }),
  });

  if (!paystackRes.ok) {
    const err = await paystackRes.text();
    console.error("Paystack init failed:", paystackRes.status, err);
    return res.status(500).json({ error: 'Payment system error' });
  }
  

  const paystackData = await paystackRes.json();

  await supabase.from("checkout_sessions").insert({
    session_token: reference,
    template_ids: templateIds,
    amount_in_cents: amountInCents,
    customer_email: customerEmail,
    customer_name: customerName,
    status: "pending",
  });

  return res.status(200).json({
    access_code: paystackData.data.access_code,
    reference,
    amount: amountInCents,
  });
}
