import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import DOMPurify from "dompurify";
import { Seo } from "@/lib/seo";
import { supabase } from "@/integrations/supabase/client";

type Post = {
  id: string; slug: string; title: string; excerpt: string | null; category: string | null;
  author: string | null; body: string | null; publish_date: string | null; tags: string[] | null;
  featured_image: string | null;
};

function renderBody(body: string) {
  const blocks = body.split(/\n\n+/).map((para) => {
    const t = para.trim();
    if (!t) return "";
    if (/^section\s*[:-]/i.test(t) || /^##\s/.test(t) || (t.length < 90 && /^[A-Z]/.test(t) && !/[.!?]$/.test(t))) {
      return `<h2 style="font-family:Ubuntu,sans-serif;font-weight:700;color:#0b4650;font-size:24px;margin:32px 0 12px;">${t.replace(/^##\s*/, "").replace(/^section\s*[:-]\s*/i, "")}</h2>`;
    }
    return `<p style="margin:0 0 16px;line-height:1.8;color:#4a6670;">${t.replace(/\n/g, "<br/>")}</p>`;
  });
  return DOMPurify.sanitize(blocks.join(""));
}

export default function BlogDetail() {
  const { slug } = useParams<{ slug: string }>();
  const [post, setPost] = useState<Post | null>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!slug) return;
    supabase.from("blog_posts").select("*").eq("slug", slug).eq("status", "published").maybeSingle()
      .then(({ data }) => { if (!data) setNotFound(true); else setPost(data as any); });
  }, [slug]);

  if (notFound) {
    return (
      <section className="px-4 sm:px-6 py-20 text-center">
        <p className="text-muted">Post not found.</p>
        <Link to="/blog" className="btn-cta mt-4 inline-flex">Back to Blog</Link>
      </section>
    );
  }
  if (!post) return <section className="px-4 sm:px-6 py-20" />;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    author: { "@type": "Organization", name: post.author || "Capacitiq" },
    datePublished: post.publish_date,
    image: post.featured_image || undefined,
  };

  return (
    <>
      <Seo title={`${post.title} | Capacitiq Blog`} description={post.excerpt || post.title} path={`/blog/${post.slug}`} jsonLd={jsonLd} />
      <article className="px-4 sm:px-6 pt-10 pb-20">
        <div className="max-w-3xl mx-auto">
          <Link to="/blog" className="inline-flex items-center gap-1 text-sm text-[#4a6670] hover:text-[#0b4650]"><ArrowLeft size={14} /> Back to Blog</Link>
          {post.category && (
            <span className="mt-6 inline-block rounded-full px-3 py-1 text-xs font-display font-bold" style={{ backgroundColor: "#e6ff2b", color: "#0b4650" }}>{post.category}</span>
          )}
          <h1 className="font-display font-bold text-4xl sm:text-5xl mt-4" style={{ color: "#0b4650" }}>{post.title}</h1>
          <p className="text-sm text-muted mt-3">{post.author || "Capacitiq Team"} · {post.publish_date}</p>
          {post.featured_image && (
            <div className="img-16x9 rounded-neu mt-8">
              <img src={post.featured_image} alt={post.title} />
            </div>
          )}
          <div className="mt-8" dangerouslySetInnerHTML={{ __html: renderBody(post.body || "") }} />
          {post.tags && post.tags.length > 0 && (
            <div className="mt-10 flex flex-wrap gap-2">
              {post.tags.map((tag) => (
                <span key={tag} className="rounded-full px-3 py-1 text-xs font-display font-bold" style={{ backgroundColor: "#e6ff2b", color: "#0b4650" }}>{tag}</span>
              ))}
            </div>
          )}
          <div className="neu-raised rounded-3xl p-8 mt-12 text-center">
            <p className="font-display font-bold text-xl" style={{ color: "#0b4650" }}>Apply this thinking to your business.</p>
            <Link to="/contact" className="btn-cta mt-4 inline-flex">Apply This To Your Business</Link>
          </div>
        </div>
      </article>
    </>
  );
}