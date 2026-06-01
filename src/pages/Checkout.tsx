import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { User, MessageCircle, CheckCircle } from "lucide-react";
import { Seo } from "@/lib/seo";
import { useCart, formatZAR } from "@/lib/cart";

const WA_NUMBER = "27640620354";

export default function Checkout() {
  const cart = useCart();
  const [step, setStep] = useState<0 | 1 | 2>(0);
  const [info, setInfo] = useState({
    fullName: "", email: "", phone: "", company: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const totalCents = cart.total();
  const items = cart.items;
  const isAllFree = items.length > 0 && items.every((i) => i.price === 0);

  const validInfo = useMemo(() => !!(info.fullName && info.email), [info]);

  if (items.length === 0 && step !== 2) {
    return (
      <section className="px-4 sm:px-6 py-20 text-center">
        <p>Your cart is empty.</p>
        <Link to="/templates" className="btn-cta mt-4 inline-flex">Browse Templates</Link>
      </section>
    );
  }

  function buildWhatsAppUrl() {
    const lines = items.map((i) => `- ${i.name}`).join("\n");
    const totalRand = `R${Math.round(totalCents / 100).toLocaleString("en-ZA")}`;
    const msg = `Hi Capacitiq, I would like to purchase the following template(s):\n\n${lines}\n\nOrder Total: ${totalRand}\n\nName: ${info.fullName}\nEmail: ${info.email}\nPhone: ${info.phone || "Not provided"}\n\nPlease send me a payment link.`;
    return `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(msg)}`;
  }

  async function handleGetFreeTemplate() {
    setError(null);
    setLoading(true);
    try {
      const r = await fetch("/api/deliver-free-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: info.fullName,
          customerEmail: info.email,
          templateIds: items.map((i) => i.id),
        }),
      });
      if (!r.ok) { setError("Could not deliver the free template. Please try again."); setLoading(false); return; }
      // Remove abandoned cart after successful free delivery
      try {
        await fetch("/api/save-abandoned-cart", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ customerEmail: info.email }),
        });
      } catch {}
      cart.clear();
      setStep(2);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleContinueToReview() {
    // Save abandoned cart silently — do not block progression if this fails
    try {
      await fetch("/api/save-abandoned-cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerEmail: info.email,
          customerName: info.fullName,
          cartItems: items.map((it) => ({
            id: it.id,
            name: it.name,
            category: it.category,
            launch_price: it.launch_price ?? it.price,
            preview_image: it.preview_image,
            payment_link: it.payment_link,
            discount_payment_link: it.discount_payment_link,
          })),
        }),
      });
    } catch (e) {
      console.log("Abandoned cart save failed silently");
    }
    setStep(1);
  }

  function handleProceed() {
    if (items.length === 1 && items[0].payment_link) {
      // Single paid item — open Paystack directly, also delete abandoned cart
      try {
        fetch("/api/save-abandoned-cart", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ customerEmail: info.email }),
        });
      } catch {}
      window.open(items[0].payment_link!, "_blank");
    } else {
      window.open(buildWhatsAppUrl(), "_blank");
    }
  }

  return (
    <>
      <Seo title="Secure Checkout | Capacitiq" description="Complete your template order via WhatsApp or get your free template delivered instantly." path="/templates/checkout" />
      <section className="px-4 sm:px-6 pt-10 pb-16">
        <div className="max-w-7xl mx-auto">
          <h1 className="font-display font-bold text-4xl" style={{ color: "#0b4650" }}>Secure Checkout</h1>

          <div className="mt-6 flex flex-wrap gap-2">
            {[{ i: User, l: "Information" }, { i: MessageCircle, l: "Confirm" }, { i: CheckCircle, l: "Done" }].map((s, i) => {
              const active = i === step, complete = i < step;
              return (
                <span key={i} className={`rounded-full px-4 py-2 text-xs font-display font-bold inline-flex items-center gap-2 ${active ? "" : "neu-raised-sm"}`} style={active ? { backgroundColor: "#e6ff2b", color: "#0b4650" } : {}}>
                  {complete ? <CheckCircle size={14} color="#0b4650" /> : <s.i size={14} />}
                  Step {i + 1}: {s.l}
                </span>
              );
            })}
          </div>

          <div className="mt-8 grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 neu-raised rounded-3xl p-6 sm:p-8">
              {step === 0 && (
                <div className="space-y-4">
                  <h2 className="font-display font-bold text-xl" style={{ color: "#0b4650" }}>Your Information</h2>
                  <CInput label="Full Name *" value={info.fullName} onChange={(v) => setInfo({ ...info, fullName: v })} />
                  <CInput label="Email Address *" type="email" value={info.email} onChange={(v) => setInfo({ ...info, email: v })} />
                  {!isAllFree && (
                    <>
                      <CInput label="Phone Number" type="tel" value={info.phone} onChange={(v) => setInfo({ ...info, phone: v })} />
                      <CInput label="Company Name" value={info.company} onChange={(v) => setInfo({ ...info, company: v })} />
                    </>
                  )}
                  <button className="btn-cta w-full" disabled={!validInfo} onClick={handleContinueToReview}>
                    Continue
                  </button>
                </div>
              )}

              {step === 1 && (
                <div className="space-y-5">
                  <h2 className="font-display font-bold text-xl" style={{ color: "#0b4650" }}>Order Review</h2>
                  <div className="space-y-3">
                    {items.map((it) => (
                      <div key={it.id} className="flex items-center gap-3 neu-raised-sm rounded-2xl p-3">
                        {it.preview_image && <img src={it.preview_image} alt={`${it.name} preview`} className="w-20 rounded-xl object-cover" style={{ aspectRatio: "16/9" }} />}
                        <div className="flex-1 min-w-0">
                          <p className="font-display font-bold text-sm" style={{ color: "#0b4650" }}>{it.name}</p>
                          <p className="text-xs italic" style={{ color: "#4a6670" }}>{it.category}</p>
                        </div>
                        <span className="font-display font-bold text-sm" style={{ color: "#0b4650" }}>{it.price === 0 ? "FREE" : formatZAR(it.price)}</span>
                      </div>
                    ))}
                  </div>
                  <div className="border-t border-[#c5cdd4] pt-4 space-y-2 text-sm" style={{ color: "#0b4650" }}>
                    <div className="flex justify-between"><span>Subtotal</span><span>{formatZAR(totalCents)}</span></div>
                    <div className="flex justify-between"><span>Shipping</span><span>FREE (Digital)</span></div>
                    <div className="flex justify-between font-display font-bold text-lg pt-2 border-t border-[#c5cdd4]"><span>Total</span><span>{formatZAR(totalCents)}</span></div>
                  </div>

                  {error && <p className="text-sm" style={{ color: "#b00020" }}>{error}</p>}

                  <button className="text-sm" style={{ color: "#4a6670" }} onClick={() => setStep(0)}>← Back to Information</button>

                  {isAllFree ? (
                    <button
                      disabled={loading}
                      onClick={handleGetFreeTemplate}
                      className="w-full inline-flex items-center justify-center gap-3 rounded-2xl font-display font-bold uppercase tracking-wide disabled:opacity-60"
                      style={{ height: 52, backgroundColor: "#e6ff2b", color: "#0b4650", fontFamily: "Ubuntu, system-ui, sans-serif" }}
                    >
                      <CheckCircle size={20} /> {loading ? "Sending..." : "Get Your Free Template"}
                    </button>
                  ) : (
                    <>
                      <a
                        href={buildWhatsAppUrl()}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full inline-flex items-center justify-center gap-3 rounded-2xl font-display font-bold uppercase tracking-wide"
                        style={{ height: 52, backgroundColor: "#e6ff2b", color: "#0b4650", fontFamily: "Ubuntu, system-ui, sans-serif" }}
                      >
                        <MessageCircle size={20} /> Continue on WhatsApp
                      </a>
                      <p className="text-xs text-center" style={{ color: "#4a6670", fontFamily: "Inter, system-ui, sans-serif" }}>
                        For multi-template orders we send your payment link via WhatsApp and deliver your Canva links by email.
                      </p>
                    </>
                  )}
                </div>
              )}

              {step === 2 && (
                <div className="text-center py-10">
                  <CheckCircle size={64} className="mx-auto" color="#e6ff2b" />
                  <h2 className="font-display font-bold text-2xl mt-4" style={{ color: "#0b4650", fontFamily: "Ubuntu, system-ui, sans-serif" }}>
                    Your template is on its way.
                  </h2>
                  <p className="mt-3 max-w-md mx-auto" style={{ color: "#4a6670", fontFamily: "Inter, system-ui, sans-serif" }}>
                    We have sent your free Canva template to {info.email}. Check your inbox and spam folder.
                  </p>
                  <div className="mt-6 flex justify-center">
                    <Link to="/templates" className="btn-cta">Return to Templates</Link>
                  </div>
                </div>
              )}
            </div>

            {step !== 2 && (
              <aside className="neu-raised rounded-3xl p-6 h-fit lg:sticky lg:top-28">
                <h2 className="font-display font-bold text-lg" style={{ color: "#0b4650" }}>Order Summary</h2>
                <div className="mt-4 space-y-3">
                  {items.map((it) => (
                    <div key={it.id} className="flex items-center gap-3">
                      {it.preview_image && <img src={it.preview_image} alt={`${it.name} preview`} className="w-20 rounded-xl object-cover neu-raised-sm" style={{ aspectRatio: "16/9" }} />}
                      <div className="min-w-0 flex-1">
                        <p className="font-display font-bold text-sm truncate" style={{ color: "#0b4650" }}>{it.name}</p>
                        <p className="text-xs italic" style={{ color: "#4a6670" }}>{it.category}</p>
                      </div>
                      <span className="text-sm font-display" style={{ color: "#0b4650" }}>{it.price === 0 ? "FREE" : formatZAR(it.price)}</span>
                    </div>
                  ))}
                </div>
                <div className="border-t border-[#c5cdd4] mt-4 pt-4 space-y-1 text-sm" style={{ color: "#0b4650" }}>
                  <div className="flex justify-between"><span>Subtotal</span><span>{formatZAR(totalCents)}</span></div>
                  <div className="flex justify-between"><span>Shipping</span><span>FREE (Digital)</span></div>
                </div>
                <div className="border-t border-[#c5cdd4] mt-2 pt-3 flex justify-between font-display font-bold text-lg" style={{ color: "#0b4650" }}>
                  <span>Total</span><span>{formatZAR(totalCents)}</span>
                </div>
                <p className="text-xs mt-4" style={{ color: "#4a6670" }}>A Canva account is required. Template delivered by email upon payment.</p>
              </aside>
            )}
          </div>
        </div>
      </section>
    </>
  );
}

function CInput({ label, value, onChange, type = "text" }: { label: string; value: string; onChange: (v: string) => void; type?: string }) {
  return (
    <div>
      <label className="font-display text-sm block mb-2" style={{ color: "#0b4650" }}>{label}</label>
      <input type={type} className="neu-inset w-full p-3 text-sm" value={value} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}
