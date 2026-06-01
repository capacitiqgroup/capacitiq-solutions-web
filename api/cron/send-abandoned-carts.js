import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  if (req.headers.authorization !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).end();
  }

  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();

  const { data: abandonedCarts, error } = await supabase
    .from('abandoned_carts')
    .select('*')
    .eq('email_sent', false)
    .lt('updated_at', oneHourAgo);

  if (error) {
    console.error('Fetch abandoned carts error:', error.message);
    return res.status(500).json({ error: error.message });
  }

  console.log(`Found ${abandonedCarts?.length || 0} abandoned carts to process`);

  let sent = 0;

  for (const cart of abandonedCarts || []) {
    try {
      const emailHtml = buildAbandonedCartEmail(cart);

      const emailRes = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          from: 'noreply@capacitiq.co.za',
          to: cart.customer_email,
          subject: 'You left something behind — here is 20% off',
          html: emailHtml
        })
      });

      const emailBody = await emailRes.text();
      console.log(`Abandoned cart email for ${cart.customer_email}:`, emailRes.status, emailBody);

      if (emailRes.ok) {
        await supabase
          .from('abandoned_carts')
          .update({
            email_sent: true,
            email_sent_at: new Date().toISOString()
          })
          .eq('id', cart.id);
        sent++;
      }
    } catch (e) {
      console.error('Error processing abandoned cart:', cart.customer_email, e.message);
    }
  }

  return res.status(200).json({ processed: abandonedCarts?.length || 0, sent });
}

function buildAbandonedCartEmail(cart) {
  const firstName = cart.customer_name?.split(' ')[0] || 'there';
  const items = cart.cart_items || [];

  const itemButtons = items
    .filter(item => item.launch_price > 0 && item.discount_payment_link)
    .map(item => `
      <div style="background:#f5f7f8;border-radius:12px;padding:20px;margin-bottom:16px;">
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td width="80" style="vertical-align:top;padding-right:16px;">
              <img src="${item.preview_image}" width="72" height="40" style="border-radius:8px;object-fit:cover;display:block;border:0;" alt="${item.name} preview" />
            </td>
            <td style="vertical-align:middle;">
              <p style="margin:0;font-family:Arial,sans-serif;font-size:14px;font-weight:bold;color:#0b4650;">${item.name}</p>
              <p style="margin:4px 0 8px;font-family:Arial,sans-serif;font-size:12px;color:#4a6670;">
                <span style="text-decoration:line-through;margin-right:8px;">R${(item.launch_price / 100).toFixed(0)}</span>
                <span style="color:#0b4650;font-weight:bold;">R${Math.round(item.launch_price * 0.8 / 100)} with discount</span>
              </p>
              <a href="${item.discount_payment_link}" style="display:inline-block;background:#e6ff2b;color:#0b4650;font-family:Arial,sans-serif;font-size:12px;font-weight:bold;padding:10px 20px;border-radius:50px;text-decoration:none;text-transform:uppercase;letter-spacing:0.05em;border:none;">
                Claim 20% Off — Buy Now
              </a>
            </td>
          </tr>
        </table>
      </div>
    `).join('');

  const freeItems = items.filter(item => item.launch_price === 0);
  const freeSection = freeItems.length > 0 ? `
    <p style="font-family:Arial,sans-serif;font-size:14px;color:#4a6670;margin:16px 0 8px;">Your free template is still waiting:</p>
    ${freeItems.map(item => `
      <div style="background:#f5f7f8;border-radius:12px;padding:16px;margin-bottom:12px;">
        <p style="margin:0;font-family:Arial,sans-serif;font-size:14px;font-weight:bold;color:#0b4650;">${item.name}</p>
        <p style="margin:4px 0 0;font-family:Arial,sans-serif;font-size:12px;color:#4a6670;">Free — no payment required</p>
      </div>
    `).join('')}
    <div style="text-align:center;margin:16px 0;">
      <a href="https://capacitiq.co.za/templates" style="display:inline-block;background:#e6ff2b;color:#0b4650;font-family:Arial,sans-serif;font-size:13px;font-weight:bold;padding:12px 24px;border-radius:50px;text-decoration:none;text-transform:uppercase;letter-spacing:0.05em;border:none;">
        Complete Your Free Download
      </a>
    </div>
  ` : '';

  return `
<div style="max-width:600px;margin:0 auto;font-family:Arial,sans-serif;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 16px rgba(0,0,0,0.08);">
  <div style="background:#0b4650;padding:24px 32px;">
    <table width="100%" cellpadding="0" cellspacing="0"><tr>
      <td><a href="https://capacitiq.co.za" style="text-decoration:none;border:none;"><img src="https://res.cloudinary.com/dewvhnks3/image/upload/v1777199928/2_20260426_122203_0001_l9ii9u.svg" height="40" alt="Capacitiq Solutions logo" style="display:block;border:0;" /></a></td>
      <td align="right"><a href="https://capacitiq.co.za" style="color:#e6ff2b;font-family:Arial,sans-serif;font-size:13px;text-decoration:none;font-weight:bold;">capacitiq.co.za</a></td>
    </tr></table>
  </div>
  <div style="padding:32px;">
    <h2 style="color:#0b4650;font-family:Arial,sans-serif;font-size:22px;margin:0 0 8px;">You left something behind, ${firstName}.</h2>
    <p style="color:#4a6670;font-family:Arial,sans-serif;font-size:15px;margin:0 0 8px;">You added templates to your cart but did not complete your purchase.</p>
    <p style="color:#4a6670;font-family:Arial,sans-serif;font-size:15px;margin:0 0 24px;">We are holding your spot — and we have added a <strong style="color:#0b4650;">20% discount</strong> to make it easier to commit. Each discount link below is unique to you and can only be used once.</p>

    ${itemButtons}
    ${freeSection}

    <div style="background:#fffbea;border-left:4px solid #e6ff2b;padding:16px;border-radius:0 8px 8px 0;margin:24px 0;">
      <p style="margin:0;font-family:Arial,sans-serif;font-size:13px;color:#4a6670;">
        <strong style="color:#0b4650;">How it works:</strong> Click the button next to the template you want. The discount is already applied to the link — no code needed. Each link works once per person.
      </p>
    </div>

    <p style="font-family:Arial,sans-serif;font-size:13px;color:#4a6670;margin:16px 0 0;">
      Questions? Reply to this email or contact us on <a href="https://wa.me/27640620354" style="color:#0b4650;">WhatsApp</a>.
    </p>
  </div>
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
        <p style="margin:8px 0 0;font-family:Arial,sans-serif;font-size:10px;color:#4a6670;">You received this email because you added items to your cart on capacitiq.co.za. <a href="mailto:hello@capacitiq.co.za?subject=Unsubscribe" style="color:#4a6670;">Unsubscribe</a></p>
      </td>
    </tr></table>
  </div>
</div>`;
}
