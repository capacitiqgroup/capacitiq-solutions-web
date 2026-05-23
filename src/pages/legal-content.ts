export type LegalDoc = {
  slug: string;
  title: string;
  seoTitle: string;
  seoDescription: string;
  effectiveDate: string;
  sections: { heading: string; body: string }[];
};

export const LEGAL_PAGES: LegalDoc[] = [
  {
    slug: "privacy-policy",
    title: "Privacy Policy",
    seoTitle: "Privacy Policy | Capacitiq",
    seoDescription: "How Capacitiq Solutions (Pty) Ltd collects, uses, and protects your personal information under POPIA.",
    effectiveDate: "19 May 2026",
    sections: [
      { heading: "1. Who We Are", body: "Capacitiq Solutions (Pty) Ltd, trading as Capacitiq, is a registered private company in South Africa (Registration No. 2026/344156/07). We are a B-BBEE Level 1 Contributor operating remotely across South Africa. Registered in Johannesburg, Gauteng. For privacy enquiries contact legal@capacitiq.co.za." },
      { heading: "2. Scope of This Policy", body: "This Privacy Policy explains how Capacitiq collects, uses, stores, and protects your personal information when you visit our website, engage our services, submit any form, or communicate with us. Governed by the Protection of Personal Information Act 4 of 2013 (POPIA)." },
      { heading: "3. Information We Collect", body: "Full name and contact details. Business information. Budget range and service preferences. Payment information processed by Paystack and Yoco. Correspondence. Referral and job application information. IP address and browser data via Google Analytics. Cookies as described in our Cookie Policy." },
      { heading: "4. How We Use Your Information", body: "To respond to enquiries, deliver contracted services, process payments, send service updates, deliver purchased template files, administer the Spotter Programme, evaluate career applications, comply with South African law, and improve our website using anonymised analytics." },
      { heading: "5. Legal Basis for Processing", body: "Performance of a contract. Legitimate interests. Consent. Legal obligation under South African law." },
      { heading: "6. How We Share Your Information", body: "We do not sell your information. We share only with Paystack and Yoco for payment processing, Resend for transactional email, Google for anonymised analytics, service contractors under confidentiality, and legal authorities where required." },
      { heading: "7. Data Retention", body: "Client records minimum five years. Contact and enquiry records two years from last contact. Payment records minimum five years as required by South African tax law. Template purchase records two years. Job application records one year unless engaged." },
      { heading: "8. Your Rights Under POPIA", body: "Request access, correction, or deletion of your information. Object to processing. Lodge a complaint with the Information Regulator at inforeg@justice.gov.za. Contact legal@capacitiq.co.za — we respond within 30 days." },
      { heading: "9. Security", body: "We implement reasonable technical and organisational measures to protect your personal information. No internet transmission is completely secure." },
      { heading: "10. Changes", body: "We may update this policy. Continued use constitutes acceptance. Contact legal@capacitiq.co.za." },
    ],
  },
  {
    slug: "terms-of-service",
    title: "Terms of Service",
    seoTitle: "Terms of Service | Capacitiq",
    seoDescription: "Terms governing engagements with Capacitiq Solutions (Pty) Ltd for business support services and digital template products.",
    effectiveDate: "19 May 2026",
    sections: [
      { heading: "1. About These Terms", body: "These Terms govern the relationship between Capacitiq Solutions (Pty) Ltd (Registration No. 2026/344156/07) and any person or entity that engages our services or visits www.capacitiq.co.za. By engaging our services or making payment you accept these Terms." },
      { heading: "2. Our Services", body: "Capacitiq offers five service pillars: Business Strategy and Operations, Marketing and Growth, Public Relations, Virtual Assistance, and Graphic Design, plus a Canva template shop. All services are delivered remotely across South Africa. All prices are in ZAR." },
      { heading: "3. Engagement", body: "An engagement begins when you accept a quotation and make the required payment. We reserve the right to decline any engagement at our discretion." },
      { heading: "4. Payment Terms", body: "Under R3,000: 100% upfront. R3,000 and above: 50% deposit before commencement, 50% on delivery. Retainers billed monthly in advance on the 1st. Active retainer clients receive 15% discount on once-off services added during the retainer period. Accounts more than 5 business days in arrears may have service delivery paused. Payments processed via Paystack and Yoco." },
      { heading: "5. Delivery", body: "Timelines are indicative and depend on client responsiveness. Delays caused by the client extend delivery timelines accordingly." },
      { heading: "6. Revisions", body: "Each package includes one revision round. Requests must be submitted within 5 business days of delivery. Additional revisions are charged separately." },
      { heading: "7. Client Responsibilities", body: "Provide accurate and timely information. Designate a single point of contact. Respond within 5 business days. Ensure provided content does not infringe third party rights." },
      { heading: "8. Intellectual Property", body: "All deliverables vest in you upon full payment. You own the output, the thinking, and the systems. Capacitiq retains pre-existing tools and frameworks. You grant Capacitiq a non-exclusive licence to reference your engagement in our portfolio unless you opt out in writing." },
      { heading: "9. Confidentiality", body: "Both parties treat non-public information as confidential. This obligation survives termination for two years." },
      { heading: "10. Limitation of Liability", body: "Maximum liability is the total fees paid for the specific service. We do not guarantee business outcomes, revenue results, or media pickups. Nothing excludes liability for fraud or gross negligence." },
      { heading: "11. Termination", body: "Once-off projects: cancellable before commencement with written notice. Deposit non-refundable once work starts. Retainers: 30 days written notice required. Notice period fee remains due." },
      { heading: "12. Governing Law", body: "Governed by the laws of the Republic of South Africa. Jurisdiction: courts of Gauteng. Contact legal@capacitiq.co.za." },
    ],
  },
  {
    slug: "template-policy",
    title: "Template Licence and Sales Policy",
    seoTitle: "Template Licence Policy | Capacitiq",
    seoDescription: "Licence terms for Capacitiq Canva template purchases. All sales final once link delivered. Standard licence for personal and business use.",
    effectiveDate: "19 May 2026",
    sections: [
      { heading: "1. About This Policy", body: "Governs all digital template purchases from the Capacitiq Template Shop at www.capacitiq.co.za. By purchasing you accept these terms." },
      { heading: "2. What You Are Purchasing", body: "A non-exclusive, non-transferable licence to use the template as described. Not ownership of the design. A Canva account is required." },
      { heading: "3. Delivery", body: "After successful payment you will receive an email from noreply@capacitiq.co.za with your Canva link. Check spam if not received within 15 minutes. Technical delivery issues must be reported to hello@capacitiq.co.za within 7 days." },
      { heading: "4. What You May Do", body: "Edit and customise the template in Canva. Use final output commercially. Share final output with your clients. Use across multiple projects for your own business." },
      { heading: "5. What You May Not Do", body: "Resell, redistribute, or share the original template file or Canva link. Transfer the licence. Create a competing product. Claim authorship of the original design." },
      { heading: "6. All Sales Are Final", body: "No refunds, exchanges, or returns once a template link has been delivered. Review all previews carefully before purchasing." },
      { heading: "7. Technical Issues", body: "Genuine technical issues reported within 7 days will be resolved with a replacement link or equivalent template. Does not cover dissatisfaction with design or Canva account issues." },
      { heading: "8. Intellectual Property", body: "All templates remain the intellectual property of Capacitiq Solutions (Pty) Ltd. Contact hello@capacitiq.co.za." },
    ],
  },
  {
    slug: "refund-policy",
    title: "Refund, Cancellation and Dispute Policy",
    seoTitle: "Refund and Cancellation Policy | Capacitiq",
    seoDescription: "Capacitiq refund, cancellation, and dispute resolution policy for services and digital template products.",
    effectiveDate: "19 May 2026",
    sections: [
      { heading: "1. Overview", body: "Capacitiq Solutions (Pty) Ltd (Registration No. 2026/344156/07) provides business support services and digital templates. This policy is transparent so clients can make informed decisions." },
      { heading: "2. Services — Refund Policy", body: "Before work commences: full refund less 10% administrative fee if requested in writing to legal@capacitiq.co.za within 48 hours of payment. After work commences: no refund. Work commences when a discovery session occurs, any drafting or research begins, or an onboarding form is processed. Dissatisfied clients will be offered one additional revision round at no charge to address specific documented concerns. Delivered work: no refund where work has been delivered and signed off." },
      { heading: "3. Retainer Cancellation", body: "30 calendar days written notice to legal@capacitiq.co.za. Notice period fee remains due. Where Capacitiq initiates cancellation, 30 days notice is provided and a pro-rata refund issued for prepaid days beyond the notice period." },
      { heading: "4. Templates — No Refund", body: "All template sales are final once a link is delivered. Technical issues reported within 7 days receive a replacement link." },
      { heading: "5. Dispute Resolution", body: "Step 1: Contact legal@capacitiq.co.za or WhatsApp 064 062 0354. Step 2: Formal written complaint with name, invoice number, issue, and desired outcome. Step 3: Mediation with shared costs. Step 4: Legal proceedings in the courts of Gauteng." },
      { heading: "6. Chargebacks", body: "Contact us before initiating any chargeback. Capacitiq will provide full documentation to Paystack, Yoco, and your bank to contest chargebacks initiated without prior engagement." },
      { heading: "7. Contact", body: "Email legal@capacitiq.co.za. WhatsApp 064 062 0354. Johannesburg, Gauteng, South Africa." },
      { heading: "8. Consumer Protection", body: "Nothing limits your rights under the Consumer Protection Act 68 of 2008." },
    ],
  },
  {
    slug: "cookie-policy",
    title: "Cookie Policy",
    seoTitle: "Cookie Policy | Capacitiq",
    seoDescription: "How Capacitiq uses cookies and analytics tracking on capacitiq.co.za including Google Analytics and payment provider cookies.",
    effectiveDate: "19 May 2026",
    sections: [
      { heading: "1. What This Covers", body: "How Capacitiq Solutions (Pty) Ltd uses cookies on www.capacitiq.co.za." },
      { heading: "2. What Are Cookies", body: "Small text files placed on your device to recognise it, remember preferences, and collect usage information." },
      { heading: "3. Cookies We Use", body: "Essential: required for the site to function. Analytics (Google Analytics): collects anonymised data including pages visited, time on site, city-level location, and device type. Opt out at tools.google.com/dlpage/gaoptout. Functional: remember preferences to improve your experience." },
      { heading: "4. Third-Party Cookies", body: "Paystack and Yoco may set cookies during checkout for payment processing and fraud prevention, governed by their own policies." },
      { heading: "5. Managing Cookies", body: "Manage through your browser settings. Disabling certain cookies may affect site functionality." },
      { heading: "6. Contact", body: "legal@capacitiq.co.za." },
    ],
  },
];