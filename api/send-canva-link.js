import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  const { customerEmail, templateId } = req.body || {};

  console.log('send-canva-link called', { customerEmail, templateId });

  if (!customerEmail || !templateId) {
    return res.status(400).json({ error: 'Missing fields' });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(customerEmail)) {
    return res.status(400).json({ error: 'Invalid email address' });
  }

  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(templateId)) {
    return res.status(400).json({ error: 'Invalid template selection' });
  }

  const { data: template, error: templateError } = await supabase
    .from('templates')
    .select('id, name, canva_link, preview_image, launch_price, category')
    .eq('id', templateId)
    .eq('status', 'published')
    .maybeSingle();

  console.log('Template lookup:', JSON.stringify({ template: template?.name, error: templateError?.message }));

  if (templateError) {
    return res.status(500).json({ error: 'Database error. Please try again.' });
  }

  if (!template) {
    console.log('No template found for id:', templateId);
    return res.status(404).json({
      error: 'We could not find that template. Please contact hello@capacitiq.co.za'
    });
  }

  if (!template.canva_link) {
    return res.status(404).json({
      error: 'Template link not available yet. Please contact hello@capacitiq.co.za and we will send it to you within 24 hours.'
    });
  }

  const price = template.launch_price === 0 ? 'FREE' : `R${(template.launch_price / 100).toFixed(0)}`;

  const emailRes = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      from: 'noreply@capacitiq.co.za',
      to: customerEmail,
      subject: `Your Capacitiq Template — ${template.name}`,
      html: buildDeliveryEmailHtml(template, customerEmail, price)
    })
  });

  const emailBody = await emailRes.text();
  console.log('Email send result:', emailRes.status, emailBody);

  if (!emailRes.ok) {
    return res.status(500).json({
      error: 'Could not send email. Please contact hello@capacitiq.co.za or WhatsApp 064 062 0354.'
    });
  }

  // Internal notification
  await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      from: 'noreply@capacitiq.co.za',
      to: 'hello@capacitiq.co.za',
      subject: `Template Canva Link Sent — ${template.name}`,
      html: buildInternalNotice(template, customerEmail, price)
    })
  });

  const orderId = crypto.randomUUID();

  await supabase.from('orders').insert({
    customer_email: customerEmail,
    customer_name: customerEmail,
    items: [{ id: template.id, name: template.name, price: template.launch_price }],
    amount_in_cents: template.launch_price,
    yoco_charge_id: `paystack-thankyou-${template.id}-${Date.now()}`,
    status: 'paid',
    created_at: new Date().toISOString()
  });

  return res.status(200).json({ success: true });
}

function escHtml(str) {
  if (typeof str !== 'string') return '';
  return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#039;');
}

function emailShell(body) {
  return `
<div style="max-width:600px;margin:0 auto;font-family:Arial,sans-serif;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 16px rgba(0,0,0,0.08);">
  <div style="background:#0b4650;padding:24px 32px;">
    <table width="100%" cellpadding="0" cellspacing="0"><tr>
      <td><a href="https://capacitiq.co.za" style="text-decoration:none;border:none;"><img src="https://res.cloudinary.com/dewvhnks3/image/upload/v1777199928/2_20260426_122203_0001_l9ii9u.svg" height="40" alt="Capacitiq Solutions logo" style="display:block;border:0;" /></a></td>
      <td align="right"><a href="https://capacitiq.co.za" style="color:#e6ff2b;font-family:Arial,sans-serif;font-size:13px;text-decoration:none;font-weight:bold;">capacitiq.co.za</a></td>
    </tr></table>
  </div>
  <div style="padding:32px;">${body}</div>
  <div style="background:#f5f7f8;padding:24px 32px;border-top:2px solid #e8edf0;">
    <table cellpadding="0" cellspacing="0" width="100%"><tr>
      <td width="64" style="vertical-align:middle;padding-right:16px;border-right:2px solid #0b4650;">
        <a href="https://capacitiq.co.za" style="text-decoration:none;border:none;"><img src="https://res.cloudinary.com/dewvhnks3/image/upload/v1777199928/2_20260426_122203_0001_l9ii9u.svg" height="52" alt="Capacitiq Solutions logo" style="display:block;border:0;" /></a>
      </td>
      <td style="vertical-align:middle;padding-left:16px;">
        <p style="margin:0;font-family:Arial,sans-serif;font-size:14px;font-weight:bold;color:#0b4650;">Capacitiq Solutions (Pty) Ltd</p>
        <p style="margin:3px 0 0;font-family:Arial,sans-serif;font-size:12px;color:#4a6670;font-style:italic;">Build a business that operates with clarity and structure.</p>
        <p style="margin:8px 0 0;font-family:Arial,sans-serif;font-size:12px;color:#4a6670;"><a href="mailto:hello@capacitiq.co.za" style="color:#0b4650;text-decoration:none;">hello@capacitiq.co.za</a> &nbsp;·&nbsp; <a href="https://wa.me/27640620354" style="color:#0b4650;text-decoration:none;">064 062 0354</a></p>
        <p style="margin:8px 0 0;font-family:Arial,sans-serif;font-size:10px;color:#4a6670;">B-BBEE Level 1 Contributor · Reg. No. 2026/344156/07 · Johannesburg, South Africa</p>
      </td>
    </tr></table>
  </div>
</div>`;
}

function buildDeliveryEmailHtml(template, customerEmail, price) {
  const body = `
    <h2 style="color:#0b4650;font-family:Arial,sans-serif;font-size:22px;margin:0 0 8px;">Here is your template.</h2>
    <p style="color:#4a6670;font-family:Arial,sans-serif;font-size:15px;margin:0 0 28px;">Thank you for your purchase. Your Canva template link is ready below.</p>
    <div style="background:#f5f7f8;border-radius:12px;padding:20px;margin-bottom:24px;">
      <p style="margin:0 0 16px;font-family:Arial,sans-serif;font-size:12px;font-weight:bold;color:#0b4650;text-transform:uppercase;letter-spacing:0.05em;">Order Summary</p>
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td width="80" style="vertical-align:top;padding-right:16px;">
            <img src="${template.preview_image}" width="72" height="40" style="border-radius:8px;object-fit:cover;display:block;border:0;" alt="${escHtml(template.name)} preview" />
          </td>
          <td style="vertical-align:top;">
            <p style="margin:0;font-family:Arial,sans-serif;font-size:14px;font-weight:bold;color:#0b4650;">${escHtml(template.name)}</p>
            <p style="margin:4px 0 0;font-family:Arial,sans-serif;font-size:12px;color:#4a6670;">${escHtml(template.category)} · Qty: 1</p>
            <p style="margin:4px 0 0;font-family:Arial,sans-serif;font-size:14px;color:#0b4650;font-weight:bold;">${price}</p>
          </td>
        </tr>
      </table>
      <hr style="border:none;border-top:1px solid #e8edf0;margin:16px 0;" />
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr><td style="font-family:Arial,sans-serif;font-size:13px;color:#4a6670;">Subtotal</td><td align="right" style="font-family:Arial,sans-serif;font-size:13px;color:#0b4650;">${price}</td></tr>
        <tr><td style="font-family:Arial,sans-serif;font-size:13px;color:#4a6670;padding-top:4px;">Shipping</td><td align="right" style="font-family:Arial,sans-serif;font-size:13px;color:#0b4650;padding-top:4px;">FREE (Digital)</td></tr>
        <tr><td style="font-family:Arial,sans-serif;font-size:14px;font-weight:bold;color:#0b4650;padding-top:8px;border-top:1px solid #e8edf0;">Total</td><td align="right" style="font-family:Arial,sans-serif;font-size:14px;font-weight:bold;color:#0b4650;padding-top:8px;border-top:1px solid #e8edf0;">${price}</td></tr>
      </table>
    </div>
    <div style="text-align:center;margin-bottom:24px;">
      <a href="${template.canva_link}" style="display:inline-block;background:#e6ff2b;color:#0b4650;font-family:Arial,sans-serif;font-size:14px;font-weight:bold;padding:16px 36px;border-radius:50px;text-decoration:none;text-transform:uppercase;letter-spacing:0.05em;border:none;">Access Your Template in Canva</a>
      <p style="margin:12px 0 0;font-family:Arial,sans-serif;font-size:12px;color:#4a6670;">A Canva account is required. <a href="https://canva.com" style="color:#0b4650;">Create one free at canva.com</a></p>
    </div>
    <div style="background:#fffbea;border-left:4px solid #e6ff2b;padding:16px;border-radius:0 8px 8px 0;margin-bottom:24px;">
      <p style="margin:0;font-family:Arial,sans-serif;font-size:12px;color:#4a6670;"><strong style="color:#0b4650;">Licence reminder:</strong> Licensed for personal or business use only. Do not resell or share the original template file or Canva link.</p>
    </div>
    <p style="font-family:Arial,sans-serif;font-size:12px;color:#4a6670;margin:0;">Issues? Email <a href="mailto:hello@capacitiq.co.za" style="color:#0b4650;">hello@capacitiq.co.za</a> or WhatsApp <a href="https://wa.me/27640620354" style="color:#0b4650;">064 062 0354</a> within 7 days.</p>
  `;
  return emailShell(body);
}

function buildInternalNotice(template, customerEmail, price) {
  const date = new Date().toLocaleString('en-ZA', {timeZone:'Africa/Johannesburg'});
  return emailShell(`
    <h2 style="color:#0b4650;font-family:Arial,sans-serif;font-size:20px;margin:0 0 16px;">Template Canva Link Sent</h2>
    <div style="background:#f5f7f8;border-radius:12px;padding:20px;margin-bottom:16px;">
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr><td style="font-family:Arial,sans-serif;font-size:13px;color:#4a6670;padding:6px 0;width:160px;">Customer Email</td><td style="font-family:Arial,sans-serif;font-size:13px;color:#0b4650;padding:6px 0;">${escHtml(customerEmail)}</td></tr>
        <tr><td style="font-family:Arial,sans-serif;font-size:13px;color:#4a6670;padding:6px 0;">Template</td><td style="font-family:Arial,sans-serif;font-size:13px;color:#0b4650;padding:6px 0;">${escHtml(template.name)}</td></tr>
        <tr><td style="font-family:Arial,sans-serif;font-size:13px;color:#4a6670;padding:6px 0;">Amount</td><td style="font-family:Arial,sans-serif;font-size:13px;color:#0b4650;padding:6px 0;">${price}</td></tr>
        <tr><td style="font-family:Arial,sans-serif;font-size:13px;color:#4a6670;padding:6px 0;">Date</td><td style="font-family:Arial,sans-serif;font-size:13px;color:#0b4650;padding:6px 0;">${date}</td></tr>
      </table>
    </div>
    <p style="font-family:Arial,sans-serif;font-size:12px;color:#4a6670;margin:0;">This was sent from the thank you page after a Paystack payment.</p>
  `);
}
