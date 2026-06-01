import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Check } from "lucide-react";
import { Seo } from "@/lib/seo";
import { supabase } from "@/integrations/supabase/client";
import { useCart, formatZAR, type CartItem } from "@/lib/cart";

type T = {
  id: string; name: string; category: string;
  price: number; launch_price: number | null; standard_price: number | null;
  description: string | null; preview_image: string | null; status: string;
  payment_link: string | null;
  discount_payment_link: string | null;
};

export default function TemplateDetail() {
  const { templateId } = useParams<{ templateId: string }>();
  const [t, setT] = useState<T | null>(null);
  const [notFound, setNotFound] = useState(false);
  const cart = useCart();
  const [justAdded, setJustAdded] = useState(false);

  useEffect(() => {
    if (!templateId) return;
    supabase
      .from("templates")
      .select("id,name,category,price,launch_price,standard_price,description,preview_image,status,payment_link,discount_payment_link")
      .eq("id", templateId)
      .eq("status", "published")
      .maybeSingle()
      .then(({ data }) => {
        if (!data) setNotFound(true);
        else setT(data as any);
      });
  }, [templateId]);

  if (notFound) {
    return (
      <section className="px-4 sm:px-6 py-20 text-center">
        <p className="text-muted">Template not found.</p>
        <Link to="/templates" className="btn-cta mt-4 inline-flex">Browse Templates</Link>
      </section>
    );
  }
  if (!t) return <section className="px-4 sm:px-6 py-20" />;

  const priceCents = t.launch_price ?? t.price;
  const isFree = priceCents === 0;
  const inCart = cart.has(t.id);

  function add() {
    if (!t) return;
    cart.addItem({ id: t.id, name: t.name, category: t.category, price: priceCents, preview_image: t.preview_image, launch_price: t.launch_price, standard_price: t.standard_price, payment_link: t.payment_link, discount_payment_link: t.discount_payment_link } as CartItem);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1500);
  }

  const desc = (t.description || "").slice(0, 155);

  return (
    <>
      <Seo title={`${t.name} | Capacitiq Template Shop`} description={desc} path={`/templates/${t.id}`} />
      <section className="px-4 sm:px-6 pt-10 pb-16">
        <div className="max-w-5xl mx-auto">
          <Link to="/templates" className="inline-flex items-center gap-1 text-sm text-[#4a6670] hover:text-[#0b4650]"><ArrowLeft size={14} /> Back to Templates</Link>
          <div className="grid md:grid-cols-2 gap-8 mt-6">
            <div
              className="neu-raised rounded-3xl flex items-center justify-center"
              style={{ background: "#e8edf0", padding: 24, borderRadius: 20, width: "100%", maxWidth: "100%" }}
            >
              {t.preview_image && (
                <img
                  src={t.preview_image}
                  alt={`${t.name} preview`}
                  style={{ width: "100%", maxWidth: "100%", maxHeight: 560, objectFit: "contain", borderRadius: 12, display: "block", height: "auto" }}
                />
              )}
            </div>
            <div>
              <span className="text-xs font-display font-bold rounded-full px-2.5 py-1" style={{ backgroundColor: "#e6ff2b", color: "#0b4650" }}>{t.category}</span>
              <h1 className="font-display font-bold text-4xl mt-4" style={{ color: "#0b4650" }}>{t.name}</h1>
              {isFree ? (
                <span className="mt-4 inline-block rounded-full px-4 py-1.5 text-sm font-display font-bold" style={{ backgroundColor: "#e6ff2b", color: "#0b4650" }}>FREE</span>
              ) : (
                <div className="mt-4 flex items-baseline gap-3">
                  <p className="text-3xl font-display font-bold">{formatZAR(priceCents)}</p>
                  {t.standard_price && t.standard_price > priceCents && (
                    <p className="text-lg text-muted line-through">{formatZAR(t.standard_price)}</p>
                  )}
                </div>
              )}
              <div className="mt-6 space-y-3 text-[15px]" style={{ color: "#4a6670", lineHeight: 1.7 }}>
                {(t.description || "").split(/\n\n+/).map((p, i) => <p key={i}>{p}</p>)}
              </div>
              <div className="mt-6 space-y-2">
                {!isFree && t.payment_link && (
                  <a href={t.payment_link} target="_blank" rel="noopener noreferrer" className="btn-cta w-full text-center">Buy Now</a>
                )}
                <button
                  className={inCart || justAdded ? "btn-ghost w-full inline-flex items-center justify-center gap-2" : (isFree ? "btn-cta w-full" : "btn-ghost w-full")}
                  disabled={inCart && !justAdded}
                  onClick={() => !inCart && add()}
                >
                  {justAdded ? (<><Check size={16} /> Added</>) : inCart ? (<><Check size={16} /> In Cart</>) : isFree ? "Get For Free" : "Add to Cart"}
                </button>
              </div>
              <p className="text-xs mt-3" style={{ color: "#4a6670" }}>A Canva account is required to access and edit this template. All sales are final once a link has been delivered.</p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}