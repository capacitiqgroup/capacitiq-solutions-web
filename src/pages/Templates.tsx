import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Layout as LayoutIcon, CheckCircle, Check } from "lucide-react";
import { Seo } from "@/lib/seo";
import { supabase } from "@/integrations/supabase/client";
import { useCart, formatZAR, type CartItem } from "@/lib/cart";

type T = {
  id: string; name: string; category: string;
  price: number; launch_price: number | null; standard_price: number | null;
  description: string | null; preview_image: string | null; status: string;
};

const CATEGORIES = ["All", "Social Media", "Presentations", "Business Docs", "Brand", "Email", "Events"];

export default function Templates() {
  const [items, setItems] = useState<T[] | null>(null);
  const [filter, setFilter] = useState("All");
  const cart = useCart();
  const [justAdded, setJustAdded] = useState<string | null>(null);

  useEffect(() => {
    supabase
      .from("templates")
      .select("id,name,category,price,launch_price,standard_price,description,preview_image,status")
      .eq("status", "published")
      .then(({ data }) => setItems((data as any) || []));
  }, []);

  const filtered = useMemo(
    () => (items === null ? [] : (filter === "All" ? items : items.filter((t) => t.category === filter))),
    [items, filter]
  );

  function addToCart(t: T, priceCents: number) {
    cart.addItem({ id: t.id, name: t.name, category: t.category, price: priceCents, preview_image: t.preview_image, launch_price: t.launch_price, standard_price: t.standard_price } as CartItem);
    setJustAdded(t.id);
    setTimeout(() => setJustAdded((cur) => (cur === t.id ? null : cur)), 1500);
  }

  return (
    <>
      <Seo title="Canva Template Shop | Capacitiq" description="Ready-to-brand Canva templates for South African businesses. Social media, pitch decks, business docs." path="/templates" />
      <section className="px-4 sm:px-6 pt-10 pb-6">
        <div className="max-w-4xl mx-auto">
          <p className="text-xs uppercase tracking-widest text-muted">Template Shop</p>
          <h1 className="font-display font-bold text-4xl sm:text-5xl mt-2">Canva templates that support consistent execution.</h1>
          <p className="mt-4">Ready to brand. Editable files delivered on purchase. A Canva account is required.</p>
        </div>
      </section>

      <section className="px-4 sm:px-6 pt-2 pb-4">
        <div className="max-w-7xl mx-auto flex flex-wrap gap-2">
          {CATEGORIES.map((c) => {
            const active = c === filter;
            return (
              <button
                key={c}
                onClick={() => setFilter(c)}
                className={`rounded-full px-4 py-2 text-xs font-display font-bold ${active ? "" : "neu-raised-sm text-[#4a6670]"}`}
                style={active ? { backgroundColor: "#e6ff2b", color: "#0b4650" } : {}}
              >
                {c}
              </button>
            );
          })}
        </div>
      </section>

      <section className="px-4 sm:px-6 py-8">
        <div className="max-w-7xl mx-auto">
          {items === null ? null : items.length === 0 ? (
            <div className="neu-raised rounded-3xl p-10 text-center max-w-xl mx-auto">
              <LayoutIcon size={48} className="mx-auto" color="#4a6670" />
              <h3 className="font-display font-bold text-xl mt-4">Templates coming soon.</h3>
              <p className="text-sm text-muted mt-2">Drop your email below to be notified when the first pack drops.</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((t) => {
                const inCart = cart.has(t.id);
                const priceCents = t.launch_price ?? t.price;
                const isFree = priceCents === 0;
                const wasJustAdded = justAdded === t.id;
                return (
                  <div key={t.id} className="neu-raised rounded-3xl p-5 flex flex-col">
                    {t.preview_image && (
                      <Link to={`/templates/${t.id}`}>
                        <img src={t.preview_image} alt={`${t.name} preview`} className="w-full aspect-square object-cover rounded-2xl" loading="lazy" />
                      </Link>
                    )}
                    <div className="mt-4 flex-1 flex flex-col">
                      <span className="text-xs font-display font-bold rounded-full px-2.5 py-1 self-start" style={{ backgroundColor: "#e6ff2b", color: "#0b4650" }}>{t.category}</span>
                      <Link to={`/templates/${t.id}`}>
                        <h3 className="font-display font-bold text-lg mt-2 hover:underline">{t.name}</h3>
                      </Link>
                      {isFree ? (
                        <span className="mt-1 inline-block self-start rounded-full px-3 py-1 text-xs font-display font-bold" style={{ backgroundColor: "#e6ff2b", color: "#0b4650" }}>FREE</span>
                      ) : (
                        <div className="mt-1 flex items-baseline gap-2">
                          <p className="text-xl font-display font-bold">{formatZAR(priceCents)}</p>
                          {t.standard_price && t.standard_price > priceCents && (
                            <p className="text-sm text-muted line-through">{formatZAR(t.standard_price)}</p>
                          )}
                        </div>
                      )}
                      <p className="text-sm text-muted mt-2 line-clamp-2">{t.description}</p>
                      <button
                        className={inCart || wasJustAdded ? "btn-ghost mt-4 w-full inline-flex items-center justify-center gap-2" : "btn-cta mt-4 w-full"}
                        disabled={inCart && !wasJustAdded}
                        onClick={() => !inCart && addToCart(t, priceCents)}
                      >
                        {wasJustAdded ? (<><Check size={16} /> Added</>) : inCart ? (<><Check size={16} /> In Cart</>) : isFree ? "Get Free Template" : "Add to Cart"}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      <Waitlist />
    </>
  );
}

function Waitlist() {
  const [email, setEmail] = useState("");
  const [suggestion, setSuggestion] = useState("");
  const [done, setDone] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    await supabase.from("template_waitlist").insert({ email, suggestion });
    try {
      await fetch("/api/template-waitlist", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, suggestion }) });
    } catch {/* preview */}
    setDone(true);
  }

  return (
    <section className="px-4 sm:px-6 py-16">
      <div className="neu-raised max-w-3xl mx-auto rounded-3xl p-8 lg:p-10">
        <h2 className="font-display font-bold text-3xl">Stay in the loop.</h2>
        <p className="text-sm text-muted mt-2">New template packs drop regularly. Tell us what you want to see next.</p>
        {done ? (
          <div className="mt-6 flex items-center gap-3 text-sm"><CheckCircle color="#e6ff2b" /> You are on the list. We will let you know when new packs drop.</div>
        ) : (
          <form className="mt-6 space-y-3" onSubmit={submit}>
            <input type="email" required placeholder="your@email.com" className="neu-inset w-full p-3 text-sm" value={email} onChange={(e) => setEmail(e.target.value)} />
            <textarea required rows={2} placeholder="e.g. Real estate, fitness, coaching — tell us what your business needs" className="neu-inset w-full p-3 text-sm" value={suggestion} onChange={(e) => setSuggestion(e.target.value)} />
            <button className="btn-cta w-full">Join the Waitlist</button>
          </form>
        )}
      </div>
    </section>
  );
}