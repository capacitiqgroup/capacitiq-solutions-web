import { useState } from "react";
import { BookOpen } from "lucide-react";
import { Seo } from "@/lib/seo";

const CATS = ["All", "Strategy", "Operations", "Design", "PR", "Growth", "Technology", "Web Presence"];

export default function Blog() {
  const [filter, setFilter] = useState("All");
  return (
    <>
      <Seo title="Blog | Capacitiq — Practical insights for growing businesses" description="Thinking on strategy, operations, design, PR, and web presence — written for founders building with intention." path="/blog" />
      <section className="px-4 sm:px-6 pt-10 pb-6">
        <div className="max-w-4xl mx-auto">
          <p className="text-xs uppercase tracking-widest text-muted">Blog</p>
          <h1 className="font-display font-bold text-4xl sm:text-5xl mt-2" style={{ color: "#0b4650" }}>Practical insights for growing businesses.</h1>
          <p className="mt-4" style={{ color: "#4a6670" }}>Thinking on strategy, operations, design, PR, and web presence — written for founders and business owners building with intention.</p>
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
            <BookOpen size={48} className="mx-auto" color="#4a6670" />
            <h3 className="font-display font-bold text-xl mt-4" style={{ color: "#0b4650" }}>No posts yet.</h3>
            <p className="text-sm mt-2" style={{ color: "#4a6670" }}>We are working on something worth reading. Check back soon.</p>
          </div>
        </div>
      </section>
    </>
  );
}