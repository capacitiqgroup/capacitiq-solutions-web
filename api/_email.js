// Shared HTML email templates for Capacitiq.
// All emails use the same header + footer signature.

const LOGO = "https://res.cloudinary.com/dewvhnks3/image/upload/v1777199928/2_20260426_122203_0001_l9ii9u.svg";
const LI = "https://res.cloudinary.com/dewvhnks3/image/upload/v1777199929/6_20260426_122203_0005_zdfw9p.svg";
const IG = "https://res.cloudinary.com/dewvhnks3/image/upload/v1777199929/4_20260426_122203_0003_h85nr1.svg";
const TT = "https://res.cloudinary.com/dewvhnks3/image/upload/v1777200334/Capacitiq_20260426_124501_0000_h4j1v3.svg";

const HEADER = `
<div style="background:#0b4650;padding:24px 32px;">
  <table width="100%" cellpadding="0" cellspacing="0">
    <tr>
      <td>
        <a href="https://capacitiq.co.za" style="text-decoration:none;border:none;display:inline-block;">
          <img src="${LOGO}" height="40" alt="Capacitiq" style="display:block;border:0;" />
        </a>
      </td>
      <td align="right">
        <a href="https://capacitiq.co.za" style="color:#e6ff2b;font-family:Arial,sans-serif;font-size:13px;text-decoration:none;font-weight:bold;margin-right:16px;">capacitiq.co.za</a>
        <a href="https://www.linkedin.com/company/capacitiq" style="margin-left:8px;text-decoration:none;border:none;display:inline-block;">
          <img src="${LI}" width="22" height="22" alt="LinkedIn" style="vertical-align:middle;border:0;display:block;" />
        </a>
        <a href="https://www.instagram.com/capacitiq_za" style="margin-left:8px;text-decoration:none;border:none;display:inline-block;">
          <img src="${IG}" width="22" height="22" alt="Instagram" style="vertical-align:middle;border:0;display:block;" />
        </a>
        <a href="https://www.tiktok.com/@capacitiq" style="margin-left:8px;text-decoration:none;border:none;display:inline-block;">
          <img src="${TT}" width="22" height="22" alt="TikTok" style="vertical-align:middle;border:0;display:block;" />
        </a>
      </td>
    </tr>
  </table>
</div>`;

const FOOTER = `
<div style="background:#f5f7f8;padding:24px 32px;border-top:2px solid #e8edf0;margin-top:32px;">
  <table cellpadding="0" cellspacing="0" width="100%">
    <tr>
      <td width="64" style="vertical-align:middle;padding-right:16px;border-right:2px solid #0b4650;">
        <a href="https://capacitiq.co.za" style="text-decoration:none;border:none;display:inline-block;">
          <img src="${LOGO}" height="52" alt="Capacitiq" style="display:block;border:0;" />
        </a>
      </td>
      <td style="vertical-align:middle;padding-left:16px;">
        <p style="margin:0;font-family:Arial,sans-serif;font-size:14px;font-weight:bold;color:#0b4650;">Capacitiq Solutions (Pty) Ltd</p>
        <p style="margin:3px 0 0;font-family:Arial,sans-serif;font-size:12px;color:#4a6670;font-style:italic;">Build a business that operates with clarity and structure.</p>
        <p style="margin:8px 0 0;font-family:Arial,sans-serif;font-size:12px;color:#4a6670;">
          <a href="mailto:hello@capacitiq.co.za" style="color:#0b4650;text-decoration:none;">hello@capacitiq.co.za</a>
          &nbsp;·&nbsp;
          <a href="https://wa.me/27640620354" style="color:#0b4650;text-decoration:none;">064 062 0354</a>
        </p>
        <p style="margin:8px 0 0;">
          <a href="https://www.linkedin.com/company/capacitiq" style="margin-right:6px;text-decoration:none;border:none;display:inline-block;">
            <img src="${LI}" width="18" height="18" alt="LinkedIn" style="vertical-align:middle;border:0;display:block;" />
          </a>
          <a href="https://www.instagram.com/capacitiq_za" style="margin-right:6px;text-decoration:none;border:none;display:inline-block;">
            <img src="${IG}" width="18" height="18" alt="Instagram" style="vertical-align:middle;border:0;display:block;" />
          </a>
          <a href="https://www.tiktok.com/@capacitiq" style="margin-right:12px;text-decoration:none;border:none;display:inline-block;">
            <img src="${TT}" width="18" height="18" alt="TikTok" style="vertical-align:middle;border:0;display:block;" />
          </a>
          <a href="https://capacitiq.co.za" style="display:inline-block;background:#e6ff2b;color:#0b4650;font-family:Arial,sans-serif;font-size:11px;font-weight:bold;padding:6px 14px;border-radius:20px;text-decoration:none;text-transform:uppercase;letter-spacing:0.05em;">Visit Our Website</a>
        </p>
        <p style="margin:8px 0 0;font-family:Arial,sans-serif;font-size:10px;color:#4a6670;">B-BBEE Level 1 Contributor · Reg. No. 2026/344156/07 · Johannesburg, South Africa</p>
      </td>
    </tr>
  </table>
</div>`;

export function wrapEmail(bodyHtml) {
  return `<div style="max-width:600px;margin:0 auto;font-family:Arial,sans-serif;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 16px rgba(0,0,0,0.08);">
  ${HEADER}
  <div style="padding:32px;">
    ${bodyHtml}
  </div>
  ${FOOTER}
</div>`;
}

const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

export function templateDeliveryEmail({ customerName, customerEmail, orderId, template, priceCents, isFree, paymentMethod }) {
  const priceLabel = isFree ? "FREE" : `R${(priceCents / 100).toFixed(0)}`;
  const body = `
<h2 style="color:#0b4650;font-family:Arial,sans-serif;font-size:22px;margin:0 0 8px;">Here is your template.</h2>
<p style="color:#4a6670;font-family:Arial,sans-serif;font-size:15px;margin:0 0 28px;">Hi ${esc(customerName)}, thank you for your purchase. Your Canva template is ready to access below.</p>
<div style="background:#f5f7f8;border-radius:12px;padding:20px;margin-bottom:24px;">
  <p style="margin:0 0 16px;font-family:Arial,sans-serif;font-size:12px;font-weight:bold;color:#0b4650;text-transform:uppercase;letter-spacing:0.05em;">Order Summary</p>
  <table width="100%" cellpadding="0" cellspacing="0">
    <tr>
      <td width="80" style="vertical-align:top;padding-right:16px;">
        <img src="${esc(template.preview_image || "")}" width="72" height="72" style="border-radius:8px;object-fit:cover;display:block;" alt="${esc(template.name)}" />
      </td>
      <td style="vertical-align:top;">
        <p style="margin:0;font-family:Arial,sans-serif;font-size:14px;font-weight:bold;color:#0b4650;">${esc(template.name)}</p>
        <p style="margin:4px 0 0;font-family:Arial,sans-serif;font-size:12px;color:#4a6670;">${esc(template.category)} · Quantity: 1</p>
        <p style="margin:4px 0 0;font-family:Arial,sans-serif;font-size:14px;color:#0b4650;font-weight:bold;">${priceLabel}</p>
      </td>
    </tr>
  </table>
  <hr style="border:none;border-top:1px solid #e8edf0;margin:16px 0;" />
  <table width="100%" cellpadding="0" cellspacing="0">
    <tr><td style="font-family:Arial,sans-serif;font-size:13px;color:#4a6670;">Subtotal</td><td align="right" style="font-family:Arial,sans-serif;font-size:13px;color:#0b4650;">${priceLabel}</td></tr>
    <tr><td style="font-family:Arial,sans-serif;font-size:13px;color:#4a6670;padding-top:4px;">Shipping</td><td align="right" style="font-family:Arial,sans-serif;font-size:13px;color:#0b4650;padding-top:4px;">FREE (Digital)</td></tr>
    <tr><td style="font-family:Arial,sans-serif;font-size:14px;font-weight:bold;color:#0b4650;padding-top:8px;border-top:1px solid #e8edf0;">Total</td><td align="right" style="font-family:Arial,sans-serif;font-size:14px;font-weight:bold;color:#0b4650;padding-top:8px;border-top:1px solid #e8edf0;">${priceLabel}</td></tr>
  </table>
</div>
<div style="background:#f5f7f8;border-radius:12px;padding:20px;margin-bottom:24px;">
  <p style="margin:0 0 12px;font-family:Arial,sans-serif;font-size:12px;font-weight:bold;color:#0b4650;text-transform:uppercase;letter-spacing:0.05em;">Billing Details</p>
  <p style="margin:0;font-family:Arial,sans-serif;font-size:13px;color:#4a6670;">Name: ${esc(customerName)}</p>
  <p style="margin:4px 0 0;font-family:Arial,sans-serif;font-size:13px;color:#4a6670;">Email: ${esc(customerEmail)}</p>
  <p style="margin:4px 0 0;font-family:Arial,sans-serif;font-size:13px;color:#4a6670;">Payment Method: ${esc(paymentMethod)}</p>
  <p style="margin:4px 0 0;font-family:Arial,sans-serif;font-size:13px;color:#4a6670;">Order Reference: ${esc(orderId)}</p>
  <p style="margin:4px 0 0;font-family:Arial,sans-serif;font-size:13px;color:#4a6670;">Date: ${new Date().toLocaleString("en-ZA")}</p>
</div>
<div style="text-align:center;margin-bottom:24px;">
  <a href="${esc(template.canva_link)}" style="display:inline-block;background:#e6ff2b;color:#0b4650;font-family:Arial,sans-serif;font-size:14px;font-weight:bold;padding:16px 36px;border-radius:50px;text-decoration:none;text-transform:uppercase;letter-spacing:0.05em;">Access Your Template</a>
  <p style="margin:12px 0 0;font-family:Arial,sans-serif;font-size:12px;color:#4a6670;">A Canva account is required to access and edit your template. <a href="https://canva.com" style="color:#0b4650;">Create one free at canva.com</a></p>
</div>
<div style="background:#fffbea;border-left:4px solid #e6ff2b;padding:16px;border-radius:0 8px 8px 0;margin-bottom:16px;">
  <p style="margin:0;font-family:Arial,sans-serif;font-size:12px;color:#4a6670;"><strong style="color:#0b4650;">Licence reminder:</strong> Your template is licensed for personal or business use only. You may not resell, redistribute, or share the original template file or Canva link with any other person or business. All digital product sales are final.</p>
</div>
<p style="font-family:Arial,sans-serif;font-size:12px;color:#4a6670;margin:0;">Technical issues? Email <a href="mailto:hello@capacitiq.co.za" style="color:#0b4650;">hello@capacitiq.co.za</a> within 7 days of purchase and we will resolve it.</p>`;
  return wrapEmail(body);
}

function row(label, value) {
  return `<tr><td style="font-family:Arial,sans-serif;font-size:13px;color:#4a6670;padding:6px 0;width:180px;vertical-align:top;">${esc(label)}</td><td style="font-family:Arial,sans-serif;font-size:13px;color:#0b4650;padding:6px 0;">${esc(value || "—")}</td></tr>`;
}

export function contactFormEmail(f) {
  const body = `
<h2 style="color:#0b4650;font-family:Arial,sans-serif;font-size:20px;margin:0 0 8px;">New Contact Form Submission</h2>
<p style="color:#4a6670;font-family:Arial,sans-serif;font-size:14px;margin:0 0 24px;">A new enquiry has been submitted through the website.</p>
<div style="background:#f5f7f8;border-radius:12px;padding:20px;"><table width="100%" cellpadding="0" cellspacing="0">
${row("Name", f.fullName)}
${row("Email", f.email)}
${row("Phone", f.phone)}
${row("Business Name", f.businessName)}
${row("Business Overview", f.overview)}
${row("Operating For", f.operating)}
${row("Services Interested In", Array.isArray(f.services) ? f.services.join(", ") : f.services)}
${row("What They Need Help With", f.helpWith)}
${row("Budget Range", f.budget)}
${row("Timeline", f.timeline)}
${row("Ready to Move Forward", f.ready)}
${row("Additional Notes", f.notes)}
${row("Submitted", new Date().toLocaleString("en-ZA"))}
</table></div>`;
  return wrapEmail(body);
}

export function spotterReferralEmail(f) {
  const body = `
<h2 style="color:#0b4650;font-family:Arial,sans-serif;font-size:20px;margin:0 0 8px;">New Spotter Referral</h2>
<p style="color:#4a6670;font-family:Arial,sans-serif;font-size:14px;margin:0 0 24px;">A new referral has been submitted through the Spotter Programme.</p>
<div style="background:#f5f7f8;border-radius:12px;padding:20px;"><table width="100%" cellpadding="0" cellspacing="0">
${row("Spotter Name", f.spotterName || f.yourName)}
${row("Spotter Email", f.spotterEmail || f.yourEmail)}
${row("Spotter Phone", f.spotterPhone || f.yourPhone)}
${row("Lead Name", f.leadName)}
${row("Lead Company", f.leadCompany)}
${row("Lead Contact", f.leadContact)}
${row("Referred Business Aware", f.aware || f.awareness)}
${row("Notes", f.notes)}
${row("Bank Name", f.bankName)}
${row("Account Holder Name", f.accountName)}
${row("Account Number", f.accountNumber)}
${row("Submitted", new Date().toLocaleString("en-ZA"))}
</table></div>`;
  return wrapEmail(body);
}

export function genericEmail(textBody) {
  const safe = esc(textBody).replace(/\n/g, "<br/>");
  const body = `<p style="color:#4a6670;font-family:Arial,sans-serif;font-size:14px;margin:0;">${safe}</p>`;
  return wrapEmail(body);
}

export const FROM = "Capacitiq <noreply@capacitiq.co.za>";

export async function sendResend({ to, subject, html, attachments }) {
  const payload = { from: FROM, to, subject, html };
  if (attachments && attachments.length) payload.attachments = attachments;
  const r = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return { ok: r.ok, data: await r.json() };
}