import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  const { customerName, customerEmail, templateIds } = req.body || {};

  console.log('deliver-free-order called', { customerEmail, templateIds });

  if (!customerName || !customerEmail || !Array.isArray(templateIds) || templateIds.length === 0) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(customerEmail)) {
    return res.status(400).json({ error: 'Invalid email address' });
  }

  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!templateIds.every(id => uuidRegex.test(id))) {
    return res.status(400).json({ error: 'Invalid template IDs' });
  }

  const { data: templates, error: fetchError } = await supabase
    .from('templates')
    .select('id, name, launch_price, canva_link, preview_image, category')
    .in('id', templateIds)
    .eq('status', 'published');

  console.log('Templates fetched:', JSON.stringify({ templates, fetchError }));

  if (fetchError) {
    return res.status(500).json({ error: 'Database error. Please try again.' });
  }

  if (!templates || templates.length === 0) {
    return res.status(400).json({ error: 'Templates not found. Please try again.' });
  }

  if (templates.length !== templateIds.length) {
    return res.status(400).json({ error: 'Some templates are unavailable.' });
  }

  const nonFreeTemplates = templates.filter(t => t.launch_price > 0);
  if (nonFreeTemplates.length > 0) {
    return res.status(400).json({ error: 'Cart contains paid items.' });
  }

  const orderId = crypto.randomUUID();

  const { error: orderError } = await supabase.from('orders').insert({
    id: orderId,
    customer_email: customerEmail,
    customer_name: customerName,
    items: templates.map(t => ({ id: t.id, name: t.name, price: 0 })),
    amount_in_cents: 0,
    status: 'free',
    created_at: new Date().toISOString()
  });

  if (orderError) {
    console.log('Order insert failed:', orderError.message);
    return res.status(500).json({ error: 'Could not save order. Please try again.' });
  }

  for (const template of templates) {
    if (!template.canva_link) {
      console.log('No canva_link for template:', template.name);
      continue;
    }

    const emailRes = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: 'noreply@capacitiq.co.za',
        to: customerEmail,
        subject: `Your Free Capacitiq Template — ${template.name}`,
        html: buildFreeDeliveryEmail(template, customerName)
      })
    });

    const emailBody = await emailRes.text();
    console.log('Customer email result:', emailRes.status, emailBody);
  }

  // Internal notification (inline HTML — no helper dependency)
  const internalHtml = `
<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:24px;">
  <h2 style="color:#0b4650;">Free Template Downloaded</h2>
  <table style="width:100%;border-collapse:collapse;">
    <tr><td style="padding:8px 0;color:#4a6670;width:160px;">Customer Name</td><td style="padding:8px 0;color:#0b4650;font-weight:bold;">${escHtml(customerName)}</td></tr>
    <tr><td style="padding:8px 0;color:#4a6670;">Customer Email</td><td style="padding:8px 0;color:#0b4650;">${escHtml(customerEmail)}</td></tr>
    <tr><td style="padding:8px 0;color:#4a6670;">Templates</td><td style="padding:8px 0;color:#0b4650;">${templates.map(t => escHtml(t.name)).join(', ')}</td></tr>
    <tr><td style="padding:8px 0;color:#4a6670;">Amount</td><td style="padding:8px 0;color:#0b4650;">FREE</td></tr>
    <tr><td style="padding:8px 0;color:#4a6670;">Order ID</td><td style="padding:8px 0;color:#0b4650;">${escHtml(orderId)}</td></tr>
    <tr><td style="padding:8px 0;color:#4a6670;">Date</td><td style="padding:8px 0;color:#0b4650;">${new Date().toLocaleString('en-ZA', {timeZone:'Africa/Johannesburg'})}</td></tr>
  </table>
</div>`;

  const internalRes = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      from: 'noreply@capacitiq.co.za',
      to: 'hello@capacitiq.co.za',
      subject: `Free Template Downloaded — ${templates.map(t => t.name).join(', ')}`,
      html: internalHtml
    })
  });
  console.log('Internal notification:', internalRes.status, await internalRes.text());

  await supabase.from('review_requests').insert({
    customer_email: customerEmail,
    customer_name: customerName,
    template_name: templates.map(t => t.name).join(', '),
    order_id: orderId,
    send_after: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    sent: false
  });

  return res.status(200).json({ success: true });
}

function buildFreeDeliveryEmail(template, customerName) {
  return buildEmailWrapper(`
    <h2 style="color:#0b4650;font-family:Arial,sans-serif;font-size:22px;margin:0 0 8px;">Here is your free template.</h2>
    <p style="color:#4a6670;font-family:Arial,sans-serif;font-size:15px;margin:0 0 28px;">Hi ${escHtml(customerName)}, your free Canva template is ready below.</p>
    ${buildOrderSummary(template, 'FREE')}
    ${buildCanvaButton(template.canva_link)}
    ${buildLicenceReminder()}
    <p style="font-family:Arial,sans-serif;font-size:12px;color:#4a6670;margin:0;">Issues? Email <a href="mailto:hello@capacitiq.co.za" style="color:#0b4650;">hello@capacitiq.co.za</a> within 7 days.</p>
  `);
}

function buildInternalNotification(templates, customerName, customerEmail, orderId, type) {
  const typeLabel = type === 'free' ? 'Free Download' : 'Paid Purchase';
  return buildEmailWrapper(`
    <h2 style="color:#0b4650;font-family:Arial,sans-serif;font-size:20px;margin:0 0 8px;">New Template ${escHtml(typeLabel)}</h2>
    <div style="background:#f5f7f8;border-radius:12px;padding:20px;margin-bottom:24px;">
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr><td style="font-family:Arial,sans-serif;font-size:13px;color:#4a6670;padding:6px 0;width:160px;">Customer Name</td><td style="font-family:Arial,sans-serif;font-size:13px;color:#0b4650;font-weight:bold;padding:6px 0;">${escHtml(customerName)}</td></tr>
        <tr><td style="font-family:Arial,sans-serif;font-size:13px;color:#4a6670;padding:6px 0;">Customer Email</td><td style="font-family:Arial,sans-serif;font-size:13px;color:#0b4650;padding:6px 0;">${escHtml(customerEmail)}</td></tr>
        <tr><td style="font-family:Arial,sans-serif;font-size:13px;color:#4a6670;padding:6px 0;">Templates</td><td style="font-family:Arial,sans-serif;font-size:13px;color:#0b4650;padding:6px 0;">${templates.map(t => escHtml(t.name)).join('<br/>')}</td></tr>
        <tr><td style="font-family:Arial,sans-serif;font-size:13px;color:#4a6670;padding:6px 0;">Amount</td><td style="font-family:Arial,sans-serif;font-size:13px;color:#0b4650;padding:6px 0;">${type === 'free' ? 'FREE' : 'R' + (templates.reduce((s,t) => s + t.launch_price, 0) / 100).toFixed(0)}</td></tr>
        <tr><td style="font-family:Arial,sans-serif;font-size:13px;color:#4a6670;padding:6px 0;">Order Reference</td><td style="font-family:Arial,sans-serif;font-size:13px;color:#0b4650;padding:6px 0;">${escHtml(orderId)}</td></tr>
        <tr><td style="font-family:Arial,sans-serif;font-size:13px;color:#4a6670;padding:6px 0;">Date</td><td style="font-family:Arial,sans-serif;font-size:13px;color:#0b4650;padding:6px 0;">${new Date().toLocaleString('en-ZA', {timeZone:'Africa/Johannesburg'})}</td></tr>
      </table>
    </div>
  `);
}

function buildOrderSummary(template, priceDisplay) {
  return `
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
            <p style="margin:4px 0 0;font-family:Arial,sans-serif;font-size:14px;color:#0b4650;font-weight:bold;">${priceDisplay}</p>
          </td>
        </tr>
      </table>
      <hr style="border:none;border-top:1px solid #e8edf0;margin:16px 0;" />
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr><td style="font-family:Arial,sans-serif;font-size:13px;color:#4a6670;">Subtotal</td><td align="right" style="font-family:Arial,sans-serif;font-size:13px;color:#0b4650;">${priceDisplay}</td></tr>
        <tr><td style="font-family:Arial,sans-serif;font-size:13px;color:#4a6670;padding-top:4px;">Shipping</td><td align="right" style="font-family:Arial,sans-serif;font-size:13px;color:#0b4650;padding-top:4px;">FREE (Digital)</td></tr>
        <tr><td style="font-family:Arial,sans-serif;font-size:14px;font-weight:bold;color:#0b4650;padding-top:8px;border-top:1px solid #e8edf0;">Total</td><td align="right" style="font-family:Arial,sans-serif;font-size:14px;font-weight:bold;color:#0b4650;padding-top:8px;border-top:1px solid #e8edf0;">${priceDisplay}</td></tr>
      </table>
    </div>`;
}

function buildCanvaButton(canvaLink) {
  return `
    <div style="text-align:center;margin-bottom:24px;">
      <a href="${canvaLink}" style="display:inline-block;background:#e6ff2b;color:#0b4650;font-family:Arial,sans-serif;font-size:14px;font-weight:bold;padding:16px 36px;border-radius:50px;text-decoration:none;text-transform:uppercase;letter-spacing:0.05em;border:none;">Access Your Template in Canva</a>
      <p style="margin:12px 0 0;font-family:Arial,sans-serif;font-size:12px;color:#4a6670;">A Canva account is required. <a href="https://canva.com" style="color:#0b4650;">Create one free at canva.com</a></p>
    </div>`;
}

function buildLicenceReminder() {
  return `
    <div style="background:#fffbea;border-left:4px solid #e6ff2b;padding:16px;border-radius:0 8px 8px 0;margin-bottom:24px;">
      <p style="margin:0;font-family:Arial,sans-serif;font-size:12px;color:#4a6670;"><strong style="color:#0b4650;">Licence reminder:</strong> Licensed for personal or business use only. Do not resell or share the original template file or Canva link.</p>
    </div>`;
}

function buildEmailWrapper(body) {
  return `
<div style="max-width:600px;margin:0 auto;font-family:Arial,sans-serif;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 16px rgba(0,0,0,0.08);">
  <div style="background:#0b4650;padding:24px 32px;">
    <table width="100%" cellpadding="0" cellspacing="0"><tr>
      <td><a href="https://capacitiq.co.za" style="text-decoration:none;border:none;"><img src="https://res.cloudinary.com/dewvhnks3/image/upload/v1777199928/2_20260426_122203_0001_l9ii9u.svg" height="40" alt="Capacitiq Solutions logo" style="display:block;border:0;" /></a></td>
      <td align="right">
        <a href="https://capacitiq.co.za" style="color:#e6ff2b;font-family:Arial,sans-serif;font-size:13px;text-decoration:none;font-weight:bold;margin-right:16px;">capacitiq.co.za</a>
        <a href="https://www.linkedin.com/company/capacitiq" style="text-decoration:none;border:none;display:inline-block;margin-left:8px;"><img src="https://res.cloudinary.com/dewvhnks3/image/upload/v1777199929/6_20260426_122203_0005_zdfw9p.svg" width="22" height="22" alt="LinkedIn" style="vertical-align:middle;border:0;display:block;" /></a>
        <a href="https://www.instagram.com/capacitiq_za" style="text-decoration:none;border:none;display:inline-block;margin-left:8px;"><img src="https://res.cloudinary.com/dewvhnks3/image/upload/v1777199929/4_20260426_122203_0003_h85nr1.svg" width="22" height="22" alt="Instagram" style="vertical-align:middle;border:0;display:block;" /></a>
        <a href="https://www.tiktok.com/@capacitiq" style="text-decoration:none;border:none;display:inline-block;margin-left:8px;"><img src="https://res.cloudinary.com/dewvhnks3/image/upload/v1777200334/Capacitiq_20260426_124501_0000_h4j1v3.svg" width="22" height="22" alt="TikTok" style="vertical-align:middle;border:0;display:block;" /></a>
      </td>
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
        <p style="margin:8px 0 0;">
          <a href="https://www.linkedin.com/company/capacitiq" style="margin-right:6px;text-decoration:none;border:none;display:inline-block;"><img src="https://res.cloudinary.com/dewvhnks3/image/upload/v1777199929/6_20260426_122203_0005_zdfw9p.svg" width="18" height="18" alt="LinkedIn" style="vertical-align:middle;border:0;display:block;" /></a>
          <a href="https://www.instagram.com/capacitiq_za" style="margin-right:6px;text-decoration:none;border:none;display:inline-block;"><img src="https://res.cloudinary.com/dewvhnks3/image/upload/v1777199929/4_20260426_122203_0003_h85nr1.svg" width="18" height="18" alt="Instagram" style="vertical-align:middle;border:0;display:block;" /></a>
          <a href="https://www.tiktok.com/@capacitiq" style="margin-right:12px;text-decoration:none;border:none;display:inline-block;"><img src="https://res.cloudinary.com/dewvhnks3/image/upload/v1777200334/Capacitiq_20260426_124501_0000_h4j1v3.svg" width="18" height="18" alt="TikTok" style="vertical-align:middle;border:0;display:block;" /></a>
          <a href="https://capacitiq.co.za" style="display:inline-block;background:#e6ff2b;color:#0b4650;font-family:Arial,sans-serif;font-size:11px;font-weight:bold;padding:6px 14px;border-radius:20px;text-decoration:none;text-transform:uppercase;letter-spacing:0.05em;">Visit Our Website</a>
        </p>
        <p style="margin:8px 0 0;font-family:Arial,sans-serif;font-size:10px;color:#4a6670;">B-BBEE Level 1 Contributor · Reg. No. 2026/344156/07 · Johannesburg, South Africa</p>
      </td>
    </tr></table>
  </div>
</div>`;
}

function escHtml(str) {
  if (typeof str !== 'string') return '';
  return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#039;');
}
