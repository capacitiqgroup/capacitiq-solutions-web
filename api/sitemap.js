import { createClient } from "@supabase/supabase-js";

export default async function handler(req, res) {
  try {
    const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
    const [postsRes, portRes, tmplRes] = await Promise.all([
      supabase.from("blog_posts").select("slug, created_at").eq("status", "published"),
      supabase.from("portfolio_items").select("id, created_at").eq("status", "published"),
      supabase.from("templates").select("id, created_at").eq("status", "published"),
    ]);

    const staticUrls = [
      { loc: "https://capacitiq.co.za/", changefreq: "weekly", priority: "1.0" },
      { loc: "https://capacitiq.co.za/services", changefreq: "monthly", priority: "0.9" },
      { loc: "https://capacitiq.co.za/templates", changefreq: "weekly", priority: "0.9" },
      { loc: "https://capacitiq.co.za/blog", changefreq: "weekly", priority: "0.8" },
      { loc: "https://capacitiq.co.za/portfolio", changefreq: "monthly", priority: "0.8" },
      { loc: "https://capacitiq.co.za/careers", changefreq: "monthly", priority: "0.7" },
      { loc: "https://capacitiq.co.za/contact", changefreq: "monthly", priority: "0.8" },
      { loc: "https://capacitiq.co.za/company", changefreq: "monthly", priority: "0.7" },
      { loc: "https://capacitiq.co.za/privacy-policy", changefreq: "yearly", priority: "0.3" },
      { loc: "https://capacitiq.co.za/terms-of-service", changefreq: "yearly", priority: "0.3" },
      { loc: "https://capacitiq.co.za/template-policy", changefreq: "yearly", priority: "0.3" },
      { loc: "https://capacitiq.co.za/refund-policy", changefreq: "yearly", priority: "0.3" },
      { loc: "https://capacitiq.co.za/cookie-policy", changefreq: "yearly", priority: "0.3" },
      { loc: "https://capacitiq.co.za/spotter-policy", changefreq: "yearly", priority: "0.3" },
    ];

    const blogUrls = (postsRes.data || []).map((p) => ({ loc: `https://capacitiq.co.za/blog/${p.slug}`, changefreq: "yearly", priority: "0.7", lastmod: p.created_at?.split("T")[0] }));
    const portfolioUrls = (portRes.data || []).map((p) => ({ loc: `https://capacitiq.co.za/portfolio/${p.id}`, changefreq: "monthly", priority: "0.6", lastmod: p.created_at?.split("T")[0] }));
    const templateUrls = (tmplRes.data || []).map((t) => ({ loc: `https://capacitiq.co.za/templates/${t.id}`, changefreq: "monthly", priority: "0.7", lastmod: t.created_at?.split("T")[0] }));

    const allUrls = [...staticUrls, ...blogUrls, ...portfolioUrls, ...templateUrls];
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allUrls.map((u) => `  <url>
    <loc>${u.loc}</loc>
    ${u.lastmod ? `<lastmod>${u.lastmod}</lastmod>` : ""}
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`).join("\n")}
</urlset>`;
    res.setHeader("Content-Type", "application/xml");
    res.setHeader("Cache-Control", "s-maxage=86400");
    return res.status(200).send(xml);
  } catch (e) {
    console.error("sitemap error:", e);
    return res.status(500).send("");
  }
}