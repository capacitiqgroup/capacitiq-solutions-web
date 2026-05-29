import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { User, MessageCircle, CheckCircle, ShieldCheck, CreditCard } from "lucide-react";
import { usePaystackPayment } from "react-paystack";
import { Seo } from "@/lib/seo";
import { useCart, formatZAR } from "@/lib/cart";
import { supabase } from "@/integrations/supabase/client";

const WA_NUMBER = "27640620354";
const PAYSTACK_PUBLIC = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY as string | undefined;

export default function Checkout() {
  const cart = useCart();
  const [step, setStep] = useState<0 | 1 | 2>(0);
  const [info, setInfo] = useState({
    fullName: "", email: "", phone: "", company: "",
    address: "", city: "", country: "South Africa", zip: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paymentRef, setPaymentRef] = useState<string | null>(null);
  const [paystackArgs, setPaystackArgs] = useState({
    reference: "", email: "", amount: 0, publicKey: PAYSTACK_PUBLIC || "",
    currency: "ZAR", channels: ["card", "eft"] as string[], accessCode: "",
  });

  const totalCents = cart.total();
  const items = cart.items;
  const isAllFree = items.length > 0 && items.every((i) => i.price === 0);

  // Adjust required fields when free
  useEffect(() => {
    if (isAllFree) {
      setInfo((p) => ({ ...p, address: "n/a", city: "n/a", zip: "0000" }));
    }
  }, [isAllFree]);

  const initializePayment = usePaystackPayment(paystackArgs as any);

  // Trigger Paystack popup once config is ready (reference set)
  useEffect(() => {
    if (!paystackArgs.reference || !paystackArgs.accessCode) return;
    initializePayment({
      onSuccess: (tx: any) => {
        cart.clear();
        setPaymentRef(tx?.reference || paystackArgs.reference);
        setStep(2);
      },
      onClose: () => {
        setError("Payment was cancelled. You can try again.");
      },
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paystackArgs.reference, paystackArgs.accessCode]);

  const validInfo = useMemo(() => {
    if (isAllFree) return !!(info.fullName && info.email);
    return !!(info.fullName && info.email && info.address && info.city && info.country && info.zip);
  }, [info, isAllFree]);

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

  async function handlePayNow() {
    setError(null);
    setLoading(true);
    try {
      const r = await fetch("/api/paystack-init", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          templateIds: items.map((i) => i.id),
          customerEmail: info.email,
          customerName: info.fullName,
        }),
      });
      if (!r.ok) { setError("Payment system error. Please try again."); setLoading(false); return; }
      const { access_code, reference, amount } = await r.json();
      setPaystackArgs((p) => ({ ...p, reference, email: info.email, amount, accessCode: access_code }));
    } catch (e) {
      setError("Could not start payment. Please try again.");
    } finally {
      setLoading(false);
    }
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
      cart.clear();
      setStep(2);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Seo title="Secure Checkout | Capacitiq" description="Pay securely with Paystack. Your template is delivered to your inbox the moment payment clears." path="/templates/checkout" />
      <section className="px-4 sm:px-6 pt-10 pb-16">
        <div className="max-w-7xl mx-auto">
          <h1 className="font-display font-bold text-4xl" style={{ color: "#0b4650" }}>Secure Checkout</h1>

          <div className="mt-6 flex flex-wrap gap-2">
            {[{ i: User, l: "Information" }, { i: CreditCard, l: "Payment" }, { i: CheckCircle, l: "Confirmation" }].map((s, i) => {
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
                      <h2 className="font-display font-bold text-xl pt-4" style={{ color: "#0b4650" }}>Billing Details</h2>
                      <CInput label="Billing Address *" value={info.address} onChange={(v) => setInfo({ ...info, address: v })} />
                      <CInput label="City *" value={info.city} onChange={(v) => setInfo({ ...info, city: v })} />
                      <div>
                        <label className="font-display text-sm block mb-2" style={{ color: "#0b4650" }}>Country *</label>
                        <select className="neu-inset w-full p-3 text-sm" value={info.country} onChange={(e) => setInfo({ ...info, country: e.target.value })}>
                          {["South Africa", "Namibia", "Botswana", "Lesotho", "Eswatini", "Zimbabwe", "Other"].map((c) => <option key={c}>{c}</option>)}
                        </select>
                      </div>
                      <CInput label="Postal Code *" value={info.zip} onChange={(v) => setInfo({ ...info, zip: v })} />
                    </>
                  )}
                  <button className="btn-cta w-full" disabled={!validInfo} onClick={() => setStep(1)}>
                    {isAllFree ? "Continue" : "Continue to Order Review"}
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
                      <button
                        disabled={loading || !PAYSTACK_PUBLIC}
                        onClick={handlePayNow}
                        className="w-full inline-flex items-center justify-center gap-3 rounded-2xl font-display font-bold uppercase tracking-wide disabled:opacity-60"
                        style={{ height: 52, backgroundColor: "#e6ff2b", color: "#0b4650", fontFamily: "Ubuntu, system-ui, sans-serif" }}
                      >
                        <CreditCard size={20} /> {loading ? "Starting Payment..." : `Pay Now ${formatZAR(totalCents)}`}
                      </button>
                      <p className="text-xs text-center" style={{ color: "#4a6670", fontFamily: "Inter, system-ui, sans-serif" }}>
                        Prefer to pay via EFT or bank transfer?{" "}
                        <a href={buildWhatsAppUrl()} target="_blank" rel="noopener noreferrer" className="underline" style={{ color: "#0b4650" }}>
                          Contact us on WhatsApp
                        </a>.
                      </p>
                      <p className="text-xs text-center inline-flex items-center justify-center gap-1.5 w-full" style={{ color: "#4a6670" }}>
                        <ShieldCheck size={14} /> Secured by Paystack. We never store your card details.
                      </p>
                    </>
                  )}
                </div>
              )}

              {step === 2 && (
                <div className="text-center py-10">
                  <CheckCircle size={64} className="mx-auto" color="#e6ff2b" />
                  <h2 className="font-display font-bold text-2xl mt-4" style={{ color: "#0b4650", fontFamily: "Ubuntu, system-ui, sans-serif" }}>
                    {isAllFree ? "Your template is on its way." : "Payment Successful."}
                  </h2>
                  <p className="mt-3 max-w-md mx-auto" style={{ color: "#4a6670", fontFamily: "Inter, system-ui, sans-serif" }}>
                    {isAllFree
                      ? `We have sent your free Canva template to ${info.email}. Check your inbox and spam folder.`
                      : `Your template has been sent to ${info.email}. Please check your inbox and spam folder. A Canva account is required.`}
                  </p>
                  {paymentRef && <p className="mt-2 text-xs" style={{ color: "#4a6670" }}>Reference: {paymentRef}</p>}
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
