import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Compass, PenTool, Megaphone, TrendingUp, Briefcase, ChevronRight, ChevronDown, ArrowRight, Star } from "lucide-react";
import { Seo } from "@/lib/seo";
import { SpotterModal } from "@/components/SpotterModal";
import { supabase } from "@/integrations/supabase/client";

const PILLARS = [
  { n: "01", icon: Compass, title: "Business Strategy and Operations", body: "Build the foundation. Create the systems. Lead with clarity. We help you move from instinct and improvisation to structured, documented, intentional operations.", link: "/services#business-strategy" },
  { n: "02", icon: TrendingUp, title: "Marketing and Growth", body: "Be seen. Be understood. Be chosen. We build positioning, systems, and campaigns that attract the right people and convert them.", link: "/services#marketing-growth" },
  { n: "03", icon: Megaphone, title: "Public Relations", body: "Shape the narrative. Build the authority. Control the conversation. We focus on positioning, messaging, and communication strategy.", link: "/services#public-relations" },
  { n: "04", icon: Briefcase, title: "Virtual Assistance", body: "Stop doing everything. Start running a business. We take the operational load off your desk through proper systems and consistent execution support.", link: "/services#virtual-assistance" },
  { n: "05", icon: PenTool, title: "Graphic Design", body: "Look like you mean business. Every visual we produce supports how your business positions itself, how it sells, and how it is remembered.", link: "/services#graphic-design" },
];

const FAQ = [
  { q: "How do your services work in practice?", a: "We start with a discovery session to understand your business — how it operates, where the gaps are, and what outcomes you need. From there we scope a focused engagement, agree on deliverables, and work through implementation together. You are never handed a document and left to figure it out alone." },
  { q: "Do you offer once-off services or ongoing support?", a: "Both. Our pricing structure moves from once-off entry and project engagements to monthly retainers. You can start with a single focused project and move into ongoing support once the relationship is established." },
  { q: "Is this suitable for early stage businesses?", a: "Yes. Many of our clients are past the idea stage but have not yet formalised how they operate. If you are generating revenue but running on instinct, this is exactly the stage where structured support creates the most impact." },
  { q: "Do you create logos or video content?", a: "We do not offer standalone logo design or video content production as current services. Our Graphic Design pillar focuses on visual assets that support how your business communicates and sells — including social media graphics, pitch decks, marketing collateral, flyers, and campaign creative. For custom design projects we deliver print-ready and web-ready files. Editable source files are included only where specified in the service scope, such as custom Canva template commissions. Our ready-made template shop offers fully editable Canva templates separately." },
  { q: "Do you handle media placements or press coverage?", a: "Our PR work focuses on positioning, messaging strategy, stakeholder communication, and authority building rather than paid media placement." },
  { q: "How long does a project take?", a: "Entry-level engagements: one to two weeks. Mid-tier: two to four weeks. Senior projects scoped individually. Retainers on a monthly cadence with agreed deliverables." },
  { q: "What do you need from us to get started?", a: "Clarity on what you are trying to solve and willingness to engage in the process. You do not need a polished brief — just an honest one." },
  { q: "Will you manage everything for us?", a: "We are not a management company. We integrate into your workflow, build the systems, and support execution — but the business remains yours to lead." },
];

export default function Home() {
  const [spotterOpen, setSpotterOpen] = useState(false);
  const [spotterKey, setSpotterKey] = useState(0);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [reviews, setReviews] = useState<any[]>([]);
  const [portfolio, setPortfolio] = useState<any[]>([]);
  const [templates, setTemplates] = useState<any[]>([]);
  const [posts, setPosts] = useState<any[]>([]);

  useEffect(() => {
    supabase.from("reviews").select("id,reviewer_name,reviewer_photo_url,rating,review_text,source").eq("is_visible", true).order("review_date", { ascending: false }).limit(6).then(({ data }) => setReviews(data || []));
    supabase.from("portfolio_items").select("id,title,subtitle,category,excerpt,hero_image").eq("status", "published").order("created_at", { ascending: false }).limit(3).then(({ data }) => setPortfolio(data || []));
    supabase.from("templates").select("id,name,category,launch_price,standard_price,preview_image").eq("status", "published").order("created_at", { ascending: false }).limit(3).then(({ data }) => setTemplates(data || []));
    supabase.from("blog_posts").select("id,slug,title,excerpt,category,author,publish_date,featured_image").eq("status", "published").order("publish_date", { ascending: false }).limit(3).then(({ data }) => setPosts(data || []));
  }, []);

  return (
    <>
      <Seo
        title="Build a Business That Operates With Clarity | Capacitiq"
        description="Capacitiq is a South African business support agency offering consulting, design, PR, and virtual assistance to help SMEs grow with structure and intention."
        path="/"
      />

      {/* Hero */}
      <section className="px-4 sm:px-6 pt-10 pb-16">
        <div className="neu-raised max-w-7xl mx-auto rounded-3xl p-8 lg:p-12 grid lg:grid-cols-2 gap-10 items-center">
          <div>
            <p className="text-xs uppercase tracking-widest text-muted mb-4">Capacitiq Solutions</p>
            <h1 className="font-display font-bold text-4xl sm:text-5xl lg:text-6xl leading-tight">
              Build a business that operates with clarity and structure.
            </h1>
            <p className="text-base sm:text-lg mt-6 max-w-xl">
              Capacitiq is a consulting, design, PR, and virtual assistance agency helping startups and SMEs build the systems, strategy, and execution support they need to grow with intention.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/contact" className="btn-cta">Work With Us</Link>
              <Link to="/services" className="btn-ghost">See how this works</Link>
            </div>
          </div>
          <div className="flex flex-col gap-4">
            {[
              { icon: Compass, title: "Strategy and Operations", body: "Build the foundation. Create the systems." },
              { icon: PenTool, title: "Design and Brand", body: "Look like you mean business." },
              { icon: Megaphone, title: "Public Relations", body: "Shape the narrative. Build the authority." },
            ].map((c) => (
              <div key={c.title} className="neu-raised-sm rounded-2xl p-5 flex gap-4 items-start">
                <div className="neu-raised-sm rounded-xl p-3 shrink-0"><c.icon color="#0b4650" size={22} /></div>
                <div>
                  <h3 className="font-display font-bold text-base">{c.title}</h3>
                  <p className="text-sm text-muted mt-1">{c.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Spotter banner */}
      <section className="px-4 sm:px-6 py-12">
        <div className="max-w-7xl mx-auto rounded-3xl p-10 lg:p-14 text-center" style={{ backgroundColor: "#0b4650" }}>
          <p className="text-xs uppercase tracking-widest mb-3" style={{ color: "#e6ff2b" }}>Spotter Program</p>
          <h2 className="font-display font-bold text-3xl sm:text-4xl" style={{ color: "#ffffff" }}>Turn your network into income.</h2>
          <p className="mt-4 max-w-xl mx-auto" style={{ color: "#e8edf0" }}>Refer a business to Capacitiq and earn 15% of their first invoice.</p>
          <button onClick={() => { setSpotterKey((k) => k + 1); setSpotterOpen(true); }} className="btn-cta mt-6">Become a Spotter</button>
        </div>
      </section>

      {/* What we do */}
      <section className="px-4 sm:px-6 py-16">
        <div className="max-w-7xl mx-auto">
          <p className="text-xs uppercase tracking-widest text-muted">Capabilities</p>
          <h2 className="font-display font-bold text-3xl sm:text-4xl mt-2 max-w-2xl">One relationship. Full-service delivery.</h2>
          <p className="mt-4 max-w-3xl">We are a multidisciplinary business support agency. Across five service pillars and a fully managed web presence offering, we provide the strategy, systems, execution support, and creative output that small businesses need to function properly and grow with intention.</p>
          <div className="mt-10 grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {PILLARS.map((p) => (
              <div key={p.n} className="neu-raised rounded-3xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <span className="neu-raised-sm rounded-xl px-3 py-1 text-xs font-display font-bold">{p.n}</span>
                  <p.icon color="#0b4650" size={22} />
                </div>
                <h3 className="font-display font-bold text-xl">{p.title}</h3>
                <p className="text-sm text-muted mt-3">{p.body}</p>
                <Link to={p.link} className="inline-flex items-center gap-1 mt-4 text-sm font-display font-bold">
                  See how this works <ArrowRight size={14} />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Capacitiq Difference */}
      <section className="px-4 sm:px-6 py-16">
        <div className="max-w-7xl mx-auto">
          <h2 className="font-display font-bold text-3xl sm:text-4xl">The Capacitiq Difference</h2>
          <p className="mt-4 max-w-3xl">There is no shortage of people who will take your brief and produce something. What is rare is a partner who thinks before they produce, documents what they build, and leaves you with something that works after they are gone.</p>
          <div className="mt-10 neu-raised rounded-3xl overflow-hidden">
            <div className="grid grid-cols-2 font-display font-bold text-sm" style={{ backgroundColor: "#0b4650", color: "#ffffff" }}>
              <div className="p-4">Most Agencies or Freelancers</div>
              <div className="p-4 border-l border-white/10">Capacitiq</div>
            </div>
            {[
              ["Deliver output and move on", "Deliver output and document how it works"],
              ["Charge by the hour and expand scope quietly", "Fixed packages with defined deliverables"],
              ["Work in isolation from your business goals", "Every service connects to a broader business outcome"],
              ["Offer one or two disciplines", "Five integrated pillars so you do not need five vendors"],
              ["You own the work but not the thinking behind it", "You own the work, the thinking, and the systems"],
            ].map(([a, b], i) => (
              <div key={i} className="grid grid-cols-2 text-sm border-t border-[#c5cdd4]">
                <div className="p-4 text-muted">{a}</div>
                <div className="p-4 border-l border-[#c5cdd4] font-display">{b}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing ladder */}
      <section className="px-4 sm:px-6 py-16">
        <div className="max-w-7xl mx-auto">
          <p className="text-xs uppercase tracking-widest text-muted">How Our Pricing Works</p>
          <h2 className="font-display font-bold text-3xl sm:text-4xl mt-2">A Ladder of Value. Start anywhere.</h2>
          <p className="mt-4 max-w-3xl">Every pillar follows a clear structure from a focused entry package to full fractional or agency-level support.</p>
          <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-stretch">
            {[
              ["Entry — Ignite", "Test the partnership, solve one specific problem, or get clarity before committing."],
              ["Mid-tier Project", "A defined business challenge that needs proper attention."],
              ["Senior Project", "Complex or multi-session engagements requiring deep diagnostic work."],
              ["Monthly Retainer", "Ongoing support with consistent output scaling to fractional support."],
            ].map(([t, b], i, arr) => (
              <div key={i} className="relative neu-raised rounded-3xl p-6">
                <span className="text-xs text-muted font-display">Step {i + 1}</span>
                <h3 className="font-display font-bold text-lg mt-1">{t}</h3>
                <p className="text-sm text-muted mt-2">{b}</p>
                {i < arr.length - 1 && (
                  <ChevronRight className="hidden lg:block absolute -right-4 top-1/2 -translate-y-1/2" color="#0b4650" size={20} />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Portfolio preview */}
      {portfolio.length > 0 && (
        <section className="px-4 sm:px-6 py-16">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-end justify-between flex-wrap gap-4 mb-8">
              <div>
                <p className="text-xs uppercase tracking-widest text-muted">Portfolio</p>
                <h2 className="font-display font-bold text-3xl sm:text-4xl mt-2" style={{ color: "#0b4650" }}>Selected work.</h2>
              </div>
              <Link to="/portfolio" className="btn-ghost">View all</Link>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              {portfolio.map((p) => (
                <Link key={p.id} to={`/portfolio/${p.id}`} className="neu-raised rounded-3xl overflow-hidden group">
                  <div className="img-16x9" style={{ borderRadius: 0 }}>
                    {p.hero_image && <img src={p.hero_image} alt={p.title} className="group-hover:scale-[1.02] transition-transform" />}
                  </div>
                  <div className="p-6">
                    {p.category && <span className="text-xs font-display font-bold rounded-full px-2.5 py-1" style={{ backgroundColor: "#e6ff2b", color: "#0b4650" }}>{p.category}</span>}
                    <h3 className="font-display font-bold text-lg mt-3" style={{ color: "#0b4650" }}>{p.title}</h3>
                    {p.excerpt && <p className="mt-2 text-sm line-clamp-2" style={{ color: "#4a6670" }}>{p.excerpt}</p>}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Templates preview */}
      {templates.length > 0 && (
        <section className="px-4 sm:px-6 py-16">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-end justify-between flex-wrap gap-4 mb-8">
              <div>
                <p className="text-xs uppercase tracking-widest text-muted">Template Shop</p>
                <h2 className="font-display font-bold text-3xl sm:text-4xl mt-2" style={{ color: "#0b4650" }}>Ready-to-brand Canva templates.</h2>
              </div>
              <Link to="/templates" className="btn-ghost">Browse all</Link>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {templates.map((t) => {
                const price = t.launch_price ?? 0;
                const orig = t.standard_price;
                return (
                  <Link key={t.id} to={`/templates/${t.id}`} className="neu-raised rounded-3xl p-5 flex flex-col">
                    <div className="img-16x9">
                      {t.preview_image && <img src={t.preview_image} alt={`${t.name} preview`} loading="lazy" />}
                    </div>
                    <div className="mt-4">
                      <span className="text-xs font-display font-bold rounded-full px-2.5 py-1" style={{ backgroundColor: "#e6ff2b", color: "#0b4650" }}>{t.category}</span>
                      <h3 className="font-display font-bold text-lg mt-2" style={{ color: "#0b4650" }}>{t.name}</h3>
                      <div className="mt-1 flex items-baseline gap-2">
                        <span className="font-display font-bold" style={{ color: "#0b4650" }}>R{Math.round(price / 100).toLocaleString("en-ZA")}</span>
                        {orig && orig > price && <span className="text-sm line-through" style={{ color: "#4a6670" }}>R{Math.round(orig / 100).toLocaleString("en-ZA")}</span>}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Blog preview */}
      {posts.length > 0 && (
        <section className="px-4 sm:px-6 py-16">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-end justify-between flex-wrap gap-4 mb-8">
              <div>
                <p className="text-xs uppercase tracking-widest text-muted">From the Blog</p>
                <h2 className="font-display font-bold text-3xl sm:text-4xl mt-2" style={{ color: "#0b4650" }}>Practical insights.</h2>
              </div>
              <Link to="/blog" className="btn-ghost">Read all</Link>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              {posts.map((p) => (
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
          </div>
        </section>
      )}

      {/* FAQ */}
      <section className="px-4 sm:px-6 py-16">

        {reviews.length > 0 && (
          <div className="max-w-7xl mx-auto mb-20">
            <p className="text-xs uppercase tracking-widest text-muted">Client Reviews</p>
            <h2 className="font-display font-bold text-3xl sm:text-4xl mt-2">What our clients are saying.</h2>
            <div className="mt-10 grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {reviews.map((r) => (
                <div key={r.id} className="neu-raised rounded-3xl p-6 flex flex-col">
                  <div className="flex items-center gap-1 mb-3">
                    {Array.from({ length: r.rating }).map((_, i) => (
                      <Star key={i} size={16} fill="#e6ff2b" stroke="#e6ff2b" />
                    ))}
                  </div>
                  <p className="text-sm text-[#0b4650] flex-1">"{r.review_text}"</p>
                  <div className="flex items-center gap-3 mt-5 pt-5 border-t border-[#c5cdd4]">
                    {r.reviewer_photo_url && <img src={r.reviewer_photo_url} alt={`${r.reviewer_name} profile photo`} className="w-10 h-10 rounded-full object-cover" />}
                    <div>
                      <p className="font-display font-bold text-sm text-[#0b4650]">{r.reviewer_name}</p>
                      <p className="text-xs text-muted">{r.source}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        <div className="max-w-3xl mx-auto">
          <p className="text-xs uppercase tracking-widest text-muted">FAQ</p>
          <h2 className="font-display font-bold text-3xl sm:text-4xl mt-2">Questions you may already have.</h2>
          <div className="mt-8 space-y-3">
            {FAQ.map((f, i) => (
              <div key={i} className="neu-raised-sm rounded-2xl">
                <button onClick={() => setOpenFaq(openFaq === i ? null : i)} className="w-full text-left p-5 flex items-center justify-between gap-4">
                  <span className="font-display font-bold text-sm sm:text-base">{f.q}</span>
                  <ChevronDown size={18} color="#0b4650" className={`shrink-0 transition-transform ${openFaq === i ? "rotate-180" : ""}`} />
                </button>
                {openFaq === i && <div className="px-5 pb-5 text-sm text-muted">{f.a}</div>}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-4 sm:px-6 py-16">
        <div className="neu-raised max-w-4xl mx-auto rounded-3xl p-10 text-center">
          <h2 className="font-display font-bold text-3xl sm:text-4xl">Build a business that runs with intention.</h2>
          <p className="mt-4 max-w-xl mx-auto">If your business is ready to move from reactive operations to structured execution, this is where the shift begins.</p>
          <Link to="/contact" className="btn-cta mt-6 inline-flex">Work With Us</Link>
        </div>
      </section>

      <SpotterModal key={spotterKey} open={spotterOpen} onClose={() => setSpotterOpen(false)} />
    </>
  );
}