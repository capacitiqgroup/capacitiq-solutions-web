import { Seo } from "@/lib/seo";

const SECTIONS: { h: string; b: string }[] = [
  { h: "1. About the Spotter Programme", b: "The Capacitiq Spotter Programme allows individuals to earn commission by referring qualifying businesses to Capacitiq Solutions (Pty) Ltd. This policy sets out the terms under which referrals are made, how commission is earned, and the responsibilities and limitations of all parties involved.\n\nBy submitting a referral through the Spotter Programme form on our website, you confirm that you have read, understood, and agree to be bound by this policy in full." },
  { h: "2. Who Can Participate", b: "To participate in the Spotter Programme you must:\n\n• Be at least 18 years of age\n• Be a natural person acting in your personal capacity\n• Be based in South Africa\n• Not be a current employee or independent contractor of Capacitiq Solutions (Pty) Ltd at the time of the referral\n• Not hold any formal role, title, or appointment with Capacitiq\n\nCurrent Capacitiq clients are permitted to participate as Spotters provided they meet all other eligibility requirements.\n\nCapacitiq reserves the right to reject any application or referral from any person at its sole discretion without being required to provide a reason." },
  { h: "3. How Referrals Work", b: "A referral is submitted through the Spotter Programme form on the Capacitiq website. To submit a valid referral you must provide:\n\n• Your full name and contact details\n• The name and contact details of the business you are referring\n• Your banking details for payment purposes (used only if a commission becomes payable — see Section 5)\n\nCapacitiq will make reasonable efforts to contact the referred business within 48 business hours of receiving a valid referral submission.\n\nA referral is considered valid when all required fields are completed accurately and the referred business has not previously been in contact with Capacitiq through any other channel." },
  { h: "4. Commission Structure", b: "If a business referred by a Spotter signs a service agreement with Capacitiq and pays their first invoice in full, the Spotter is entitled to earn a commission of 15% of the value of that first invoice excluding VAT.\n\nCommission is only earned and payable when all of the following conditions are met:\n\n• The referral was submitted through the official Spotter Programme form\n• The referred business signs a formal service agreement with Capacitiq\n• The referred business pays their first invoice in full\n• The referral was submitted no more than 3 months before the date the service agreement is signed\n• The Spotter remains eligible under Section 2 at the time of payment\n\nNo commission is payable if the referred business cancels, withdraws, or does not pay their first invoice for any reason.\n\nThere is no limit on the number of referrals a Spotter may submit. Each valid referral that results in a paid first invoice qualifies for commission independently." },
  { h: "5. Payment of Commission", b: "Commission payments are made by electronic funds transfer (EFT) to the South African bank account provided by the Spotter at the time of submission.\n\nPayment will be initiated within 14 business days of the referred client's first invoice being confirmed as paid in full by Capacitiq.\n\nBy submitting your banking details through the Spotter Programme form, you confirm that:\n\n• The bank account belongs to you\n• The details are accurate and complete\n• You consent to Capacitiq using these details solely for the purpose of processing your commission payment if one becomes payable\n• Your banking details will not be used for any other purpose and will not be shared with any third party except as required to process the payment\n\nCapacitiq is not responsible for failed payments resulting from incorrect banking details provided by the Spotter. It is the Spotter's responsibility to ensure that the banking details submitted are accurate." },
  { h: "6. Spotter Status and Relationship", b: "Participation in the Spotter Programme does not create an employment relationship, an independent contractor relationship, a partnership, an agency relationship, or any other formal business relationship between the Spotter and Capacitiq.\n\nSpotters are not employees, contractors, agents, representatives, or brand ambassadors of Capacitiq. Spotters may not represent themselves as any of the above in any context.\n\nSpotters are not entitled to any employee benefits, contractor fees, expenses, or any other compensation from Capacitiq beyond the commission described in Section 4 when the conditions in that section are met.\n\nSpotters are not authorised to make promises, representations, or commitments on behalf of Capacitiq in any form. Any representation made by a Spotter to a referred business beyond a straightforward introduction is made in the Spotter's personal capacity and Capacitiq accepts no liability for such representations." },
  { h: "7. Spotter Responsibilities", b: "By participating in the Spotter Programme you agree to:\n\n• Submit referrals only for businesses that you genuinely believe could benefit from Capacitiq's services\n• Obtain appropriate consent from the referred business before submitting their contact details where required\n• Not submit false, misleading, or duplicate referrals\n• Not engage in any conduct that could damage the reputation of Capacitiq\n• Comply with all applicable South African laws in connection with your participation in the programme" },
  { h: "8. Tax Obligations", b: "Commission earned through the Spotter Programme may be subject to income tax or other tax obligations depending on your personal tax circumstances. Capacitiq is not responsible for any tax, levy, or deduction that may be applicable to commission payments received by Spotters. It is the Spotter's sole responsibility to declare and pay any taxes due on commission earned. Capacitiq will not deduct PAYE or any other statutory deduction from commission payments." },
  { h: "9. Confidentiality", b: "Spotters may become aware of information about Capacitiq's clients, pricing, or operations in the course of their participation. All such information must be treated as strictly confidential and must not be shared with any third party." },
  { h: "10. Changes to This Policy", b: "Capacitiq reserves the right to amend this policy at any time. Updated versions will be published on this page with a revised effective date. Continued participation in the Spotter Programme after any update constitutes acceptance of the revised terms." },
  { h: "11. Governing Law", b: "This policy is governed by the laws of the Republic of South Africa. Any dispute arising from participation in the Spotter Programme shall be subject to the jurisdiction of the courts of Gauteng, South Africa." },
  { h: "12. Contact", b: "For any questions about the Spotter Programme or this policy contact us at:\n\nEmail: hello@capacitiq.co.za\nWhatsApp: 064 062 0354\nWebsite: www.capacitiq.co.za" },
];

export default function SpotterPolicy() {
  return (
    <>
      <Seo
        title="Spotter Programme Policy | Capacitiq"
        description="Terms and conditions for the Capacitiq Spotter Programme. How referrals work, commission payments, eligibility, and spotter responsibilities."
        path="/spotter-policy"
      />
      <section className="px-4 sm:px-6 py-16">
        <div className="neu-raised max-w-3xl mx-auto rounded-3xl p-8 lg:p-12">
          <p className="text-xs uppercase tracking-widest text-muted mb-2">Legal</p>
          <h1 className="font-display font-bold text-3xl sm:text-4xl" style={{ color: "#0b4650" }}>Spotter Programme Policy</h1>
          <p className="text-sm text-muted mt-2">Effective Date: 19 May 2026 | Last Updated: 19 May 2026</p>
          <div className="mt-8 space-y-6">
            {SECTIONS.map((s) => (
              <div key={s.h}>
                <h2 className="font-display font-bold text-lg" style={{ color: "#0b4650" }}>{s.h}</h2>
                <p className="text-sm leading-relaxed mt-2 whitespace-pre-line" style={{ color: "#4a6670" }}>{s.b}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}