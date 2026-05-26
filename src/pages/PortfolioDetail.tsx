import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Seo } from "@/lib/seo";
import { supabase } from "@/integrations/supabase/client";

type Item = {
  id: string; title: string; subtitle: string | null; category: string | null;
  hero_image: string | null; excerpt: string | null;
  sections: { heading?: string; body?: string }[] | null;
};

export default function PortfolioDetail() {
  const { portfolioId } = useParams<{ portfolioId: string }>();
  const [item, setItem] = useState<Item | null>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!portfolioId) return;
    supabase.from("portfolio_items").select("*").eq("id", portfolioId).eq("status", "published").maybeSingle()
      .then(({ data }) => { if (!data) setNotFound(true); else setItem(data as any); });
  }, [portfolioId]);

  if (notFound) {
    return (
      <section className="px-4 sm:px-6 py-20 text-center">
        <p className="text-muted">Project not found.</p>
        <Link to="/portfolio" className="btn-cta mt-4 inline-flex">Back to Portfolio</Link>
      </section>
    );
  }
  if (!item) return <section className="px-4 sm:px-6 py-20" />;

  return (
    <>
      <Seo title={`${item.title} | Capacitiq Portfolio`} description={item.excerpt || item.title} path={`/portfolio/${item.id}`} />
      <article className="px-4 sm:px-6 pt-10 pb-20">
        <div className="max-w-4xl mx-auto">
          <Link to="/portfolio" className="inline-flex items-center gap-1 text-sm text-[#4a6670] hover:text-[#0b4650]"><ArrowLeft size={14} /> Back to Portfolio</Link>
          <div className="neu-raised rounded-3xl p-3 mt-6">
            {item.hero_image ? (
              <img src={item.hero_image} alt={item.title} className="w-full aspect-video object-cover rounded-2xl" />
            ) : (
              <div className="w-full aspect-video rounded-2xl" style={{ backgroundColor: "#0b4650" }} />
            )}
          </div>
          {item.category && (
            <span className="mt-6 inline-block rounded-full px-3 py-1 text-xs font-display font-bold" style={{ backgroundColor: "#e6ff2b", color: "#0b4650" }}>{item.category}</span>
          )}
          <h1 className="font-display font-bold text-4xl sm:text-5xl mt-4" style={{ color: "#0b4650" }}>{item.title}</h1>
          {item.subtitle && <p className="italic mt-3 text-lg" style={{ color: "#4a6670" }}>{item.subtitle}</p>}
          <hr className="my-8 border-t-2" style={{ borderColor: "#0b4650", maxWidth: 80 }} />
          {(item.sections || []).map((s, i) => (
            <div key={i} className="mb-12">
              {s.heading && <h2 className="font-display font-bold text-2xl mb-3" style={{ color: "#0b4650" }}>{s.heading}</h2>}
              {s.body && <p style={{ color: "#4a6670", lineHeight: 1.8 }}>{s.body}</p>}
            </div>
          ))}
          <div className="neu-raised rounded-3xl p-8 mt-12 text-center">
            <p className="font-display font-bold text-xl" style={{ color: "#0b4650" }}>Interested in working with us?</p>
            <Link to="/contact" className="btn-cta mt-4 inline-flex">Get In Touch</Link>
          </div>
        </div>
      </article>
    </>
  );
}