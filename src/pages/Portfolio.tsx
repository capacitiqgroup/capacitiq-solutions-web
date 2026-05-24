import { useState } from "react";
import { Briefcase } from "lucide-react";
import { Link } from "react-router-dom";
import { Seo } from "@/lib/seo";

const CATS = ["All", "Strategy", "Design", "PR", "Operations", "Web"];

export default function Portfolio() {
  const [filter, setFilter] = useState("All");
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
        <div className="max-w-xl mx-auto">
          <div className="neu-raised rounded-3xl p-10 text-center">
            <Briefcase size={48} className="mx-auto" color="#4a6670" />
            <h3 className="font-display font-bold text-xl mt-4" style={{ color: "#0b4650" }}>Case studies coming soon.</h3>
            <p className="text-sm mt-2" style={{ color: "#4a6670" }}>
              We are documenting our work and will be sharing case studies shortly. In the meantime get in touch to discuss what we can build for you.
            </p>
            <Link to="/contact" className="btn-cta mt-6 inline-flex">Get In Touch</Link>
          </div>
        </div>
      </section>
    </>
  );
}