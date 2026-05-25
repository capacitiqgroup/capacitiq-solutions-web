import { Helmet } from "react-helmet-async";

const LOGO = "https://res.cloudinary.com/dewvhnks3/image/upload/v1777199928/2_20260426_122203_0001_l9ii9u.svg";
const SITE = "https://capacitiq.co.za";

const ORG_LD = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Capacitiq",
  legalName: "Capacitiq Solutions (Pty) Ltd",
  url: SITE,
  logo: LOGO,
  contactPoint: {
    "@type": "ContactPoint",
    telephone: "+27-64-062-0354",
    contactType: "customer service",
    email: "hello@capacitiq.co.za",
    availableLanguage: "English",
  },
  sameAs: [
    "https://www.linkedin.com/company/capacitiq",
    "https://www.tiktok.com/@capacitiq",
    "https://www.instagram.com/capacitiq_za",
  ],
  address: {
    "@type": "PostalAddress",
    addressLocality: "Johannesburg",
    addressRegion: "Gauteng",
    addressCountry: "ZA",
  },
};

type SeoProps = {
  title: string;
  description: string;
  path: string;
  jsonLd?: object | object[];
};

export function Seo({ title, description, path, jsonLd }: SeoProps) {
  const url = `${SITE}${path}`;
  const blocks = jsonLd
    ? Array.isArray(jsonLd)
      ? [ORG_LD, ...jsonLd]
      : [ORG_LD, jsonLd]
    : [ORG_LD];
  return (
    <Helmet>
      <html lang="en-ZA" />
      <title>{title}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={url} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={url} />
      <meta property="og:type" content="website" />
      <meta property="og:image" content={LOGO} />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={LOGO} />
      {blocks.map((b, i) => (
        <script key={i} type="application/ld+json">{JSON.stringify(b)}</script>
      ))}
    </Helmet>
  );
}