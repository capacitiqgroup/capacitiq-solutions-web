import { useEffect, useState } from "react";
import { Briefcase } from "lucide-react";
import { Link } from "react-router-dom";
import { Seo } from "@/lib/seo";
import { supabase } from "@/integrations/supabase/client";

const CATS = ["All", "Strategy", "Design", "PR", "Operations"];

type Item = { id: string; title: string; subtitle: string | null; category: string | null; excerpt: string | null; hero_image: string | null };

export default function Portfolio() {
  const [filter, setFilter] = useState("All");
  const [items, setItems] = useState<Item[] | null>(null);
  useEffect(() => {
    supabase.from("portfolio_items").select("id,title,subtitle,category,excerpt,hero_image")
      .eq("status", "published").order("created_at", { ascending: false })
      .then(({ data }) => setItems((data as any) || []));
  }, []);
  const filtered = (items || []).filter((p) => filter === "All" || p.category === filter);
  const featured = filtered[0];
  const rest = filtered.slice(1);
  return (
    <>
      <Seo title="Portfolio | Capacitiq — Selected work" description="Case studies, transformations, and work completed across our service pillars." path="/portfolio" />
      <section className="px-4 sm:px-6 pt-10 pb-6">
        <div className="max-w-4xl mx-auto">
          <p className="text-xs uppercase tracking-widest text-muted">Portfolio</p>
          <h1 className="font-display font-bold text-4xl sm:text-5xl mt-2" style={{ color: "#0b4650" }}>Selected work.</h1>
          <p className="mt-4" style={{ color: "#4a6670" }}>Case studies, transformations, and work completed across our service pillars.</p>
        </div>
      </section>

      <section className="px-4 sm:px-6 pt-2 pb-4">
        <div className="max-w-7xl mx-auto flex flex-wrap gap-2">
          {CATS.map((c) => {
            const active = c === filter;
            return (
              <button key={c} onClick={() => setFilter(c)}
                className={`rounded-full px-4 py-2 text-xs font-display font-bold ${active ? "" : "neu-raised-sm text-[#4a6670]"}`}
                style={active ? { backgroundColor: "#e6ff2b", color: "#0b4650" } : {}}>
                {c}
              </button>
            );
          })}
        </div>
      </section>

      <section className="px-4 sm:px-6 py-8 pb-20">
        <div className="max-w-7xl mx-auto">
          {items === null ? null : filtered.length === 0 ? (
            <div className="max-w-xl mx-auto neu-raised rounded-3xl p-10 text-center">
              <Briefcase size={48} className="mx-auto" color="#4a6670" />
              <h3 className="font-display font-bold text-xl mt-4" style={{ color: "#0b4650" }}>Case studies coming soon.</h3>
              <p className="text-sm mt-2" style={{ color: "#4a6670" }}>We are documenting our work and will be sharing case studies shortly.</p>
              <Link to="/contact" className="btn-cta mt-6 inline-flex">Get In Touch</Link>
            </div>
          ) : (
            <>
              {featured && (
                <Link to={`/portfolio/${featured.id}`} className="block neu-raised rounded-3xl overflow-hidden mb-8 group">
                  <div className="grid md:grid-cols-2 gap-0">
                    <div className="img-16x9" style={{ borderRadius: 0 }}>
                      {featured.hero_image ? (
                        <img src={featured.hero_image} alt={featured.title} className="group-hover:scale-[1.02] transition-transform" />
                      ) : (
                        <div style={{ width: "100%", height: "100%", background: "#0b4650", display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <img src="https://res.cloudinary.com/dewvhnks3/image/upload/v1779812887/4_20260526_182654_0001_ib6yj1.svg" alt="Capacitiq" style={{ width: 40, height: 40, opacity: 0.6 }} />
                        </div>
                      )}
                    </div>
                    <div className="p-8 flex flex-col justify-center">
                      {featured.category && <span className="text-xs font-display font-bold rounded-full px-2.5 py-1 self-start" style={{ backgroundColor: "#e6ff2b", color: "#0b4650" }}>{featured.category}</span>}
                      <h2 className="font-display font-bold text-2xl sm:text-3xl mt-3" style={{ color: "#0b4650" }}>{featured.title}</h2>
                      {featured.subtitle && <p className="mt-2 text-sm italic" style={{ color: "#4a6670" }}>{featured.subtitle}</p>}
                      {featured.excerpt && <p className="mt-3 text-[15px]" style={{ color: "#4a6670" }}>{featured.excerpt}</p>}
                      <span className="mt-4 text-sm font-display font-bold" style={{ color: "#0b4650" }}>View Project →</span>
                    </div>
                  </div>
                </Link>
              )}
              {rest.length > 0 && (
                <div className="grid md:grid-cols-2 gap-6">
                  {rest.map((p) => (
                    <Link key={p.id} to={`/portfolio/${p.id}`} className="neu-raised rounded-3xl overflow-hidden group">
                      <div className="img-16x9" style={{ borderRadius: 0 }}>
                        {p.hero_image ? (
                          <img src={p.hero_image} alt={p.title} className="group-hover:scale-[1.02] transition-transform" />
                        ) : (
                          <div style={{ width: "100%", height: "100%", background: "#0b4650", display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <img src="https://res.cloudinary.com/dewvhnks3/image/upload/v1779812887/4_20260526_182654_0001_ib6yj1.svg" alt="Capacitiq" style={{ width: 40, height: 40, opacity: 0.6 }} />
                          </div>
                        )}
                      </div>
                      <div className="p-6">
                        {p.category && <span className="text-xs font-display font-bold rounded-full px-2.5 py-1" style={{ backgroundColor: "#e6ff2b", color: "#0b4650" }}>{p.category}</span>}
                        <h3 className="font-display font-bold text-lg mt-3" style={{ color: "#0b4650" }}>{p.title}</h3>
                        {p.excerpt && <p className="mt-2 text-sm line-clamp-2" style={{ color: "#4a6670" }}>{p.excerpt}</p>}
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </>
  );
}