import { useEffect, useState } from "react";
import { BookOpen } from "lucide-react";
import { Link } from "react-router-dom";
import { Seo } from "@/lib/seo";
import { supabase } from "@/integrations/supabase/client";

const CATS = ["All", "Strategy", "Operations", "Design", "PR", "Growth", "Technology"];

type Post = { id: string; slug: string; title: string; excerpt: string | null; category: string | null; author: string | null; publish_date: string | null; featured_image: string | null };

export default function Blog() {
  const [filter, setFilter] = useState("All");
  const [posts, setPosts] = useState<Post[] | null>(null);
  useEffect(() => {
    supabase.from("blog_posts").select("id,slug,title,excerpt,category,author,publish_date,featured_image")
      .eq("status", "published").order("publish_date", { ascending: false })
      .then(({ data }) => setPosts((data as any) || []));
  }, []);
  const filtered = (posts || []).filter((p) => filter === "All" || p.category === filter);
  const featured = filtered[0];
  const rest = filtered.slice(1);
  return (
    <>
      <Seo title="Blog | Capacitiq — Practical insights for growing businesses" description="Thinking on strategy, operations, design, PR, and web presence — written for founders building with intention." path="/blog" />
      <section className="px-4 sm:px-6 pt-10 pb-6">
        <div className="max-w-4xl mx-auto">
          <p className="text-xs uppercase tracking-widest text-muted">Blog</p>
          <h1 className="font-display font-bold text-4xl sm:text-5xl mt-2" style={{ color: "#0b4650" }}>Practical insights for growing businesses.</h1>
          <p className="mt-4" style={{ color: "#4a6670" }}>Thinking on strategy, operations, design, PR, and growth — written for founders and business owners building with intention.</p>
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
          {posts === null ? null : filtered.length === 0 ? (
            <div className="max-w-xl mx-auto neu-raised rounded-3xl p-10 text-center">
              <BookOpen size={48} className="mx-auto" color="#4a6670" />
              <h3 className="font-display font-bold text-xl mt-4" style={{ color: "#0b4650" }}>No posts yet.</h3>
              <p className="text-sm mt-2" style={{ color: "#4a6670" }}>We are working on something worth reading. Check back soon.</p>
            </div>
          ) : (
            <>
              {featured && (
                <Link to={`/blog/${featured.slug}`} className="block neu-raised rounded-3xl overflow-hidden mb-8 group">
                  <div className="grid md:grid-cols-2 gap-0">
                    <div className="img-16x9" style={{ borderRadius: 0 }}>
                      {featured.featured_image ? (
                        <img src={featured.featured_image} alt={featured.title} className="group-hover:scale-[1.02] transition-transform" />
                      ) : (
                        <div style={{ width: "100%", height: "100%", background: "#0b4650", display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <img src="https://res.cloudinary.com/dewvhnks3/image/upload/v1779812887/4_20260526_182654_0001_ib6yj1.svg" alt="Capacitiq" style={{ width: 40, height: 40, opacity: 0.6 }} />
                        </div>
                      )}
                    </div>
                    <div className="p-8 flex flex-col justify-center">
                      {featured.category && <span className="text-xs font-display font-bold rounded-full px-2.5 py-1 self-start" style={{ backgroundColor: "#e6ff2b", color: "#0b4650" }}>{featured.category}</span>}
                      <h2 className="font-display font-bold text-2xl sm:text-3xl mt-3" style={{ color: "#0b4650" }}>{featured.title}</h2>
                      {featured.excerpt && <p className="mt-3 text-[15px]" style={{ color: "#4a6670" }}>{featured.excerpt}</p>}
                      <p className="text-xs text-muted mt-4">{featured.author} · {featured.publish_date}</p>
                    </div>
                  </div>
                </Link>
              )}
              {rest.length > 0 && (
                <div className="grid md:grid-cols-3 gap-6">
                  {rest.map((p) => (
                    <Link key={p.id} to={`/blog/${p.slug}`} className="neu-raised rounded-3xl overflow-hidden group">
                      <div className="img-16x9" style={{ borderRadius: 0 }}>
                        {p.featured_image ? (
                          <img src={p.featured_image} alt={p.title} className="group-hover:scale-[1.02] transition-transform" />
                        ) : (
                          <div style={{ width: "100%", height: "100%", background: "#0b4650", display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <img src="https://res.cloudinary.com/dewvhnks3/image/upload/v1779812887/4_20260526_182654_0001_ib6yj1.svg" alt="Capacitiq" style={{ width: 40, height: 40, opacity: 0.6 }} />
                          </div>
                        )}
                      </div>
                      <div className="p-5">
                        {p.category && <span className="text-xs font-display font-bold rounded-full px-2.5 py-1" style={{ backgroundColor: "#e6ff2b", color: "#0b4650" }}>{p.category}</span>}
                        <h3 className="font-display font-bold text-lg mt-3 line-clamp-2" style={{ color: "#0b4650" }}>{p.title}</h3>
                        {p.excerpt && <p className="mt-2 text-sm line-clamp-2" style={{ color: "#4a6670" }}>{p.excerpt}</p>}
                        <p className="text-xs text-muted mt-3">{p.author} · {p.publish_date}</p>
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