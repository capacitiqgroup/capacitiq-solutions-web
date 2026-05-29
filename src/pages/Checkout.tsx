import { useState } from "react";
import { Link } from "react-router-dom";
import { User, MessageCircle, CheckCircle, ShieldCheck } from "lucide-react";
import { Seo } from "@/lib/seo";
import { useCart, formatZAR } from "@/lib/cart";
import { supabase } from "@/integrations/supabase/client";

const WA_NUMBER = "27640620354";

export default function Checkout() {
  const cart = useCart();
  const [step, setStep] = useState<0 | 1 | 2>(0);
  const [info, setInfo] = useState({
    fullName: "", email: "", phone: "", company: "",
    address: "", city: "", country: "South Africa", zip: "",
  });

  const totalCents = cart.total();
  const items = cart.items;

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
    const msg =
`Hi Capacitiq, I would like to purchase the following template(s):

${lines}

Order Total: ${totalRand}

My details:
Name: ${info.fullName}
Email: ${info.email}
Phone: ${info.phone || "Not provided"}

Please send me a payment link.`;
    return `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(msg)}`;
  }

  async function sendOrderRequest() {
    const totalRand = `R${Math.round(totalCents / 100).toLocaleString("en-ZA")}`;
    const orderData = {
      customer: { ...info },
      templates: items.map((i) => ({ id: i.id, name: i.name, price: i.price })),
      total: totalRand,
      totalCents,
      timestamp: new Date().toISOString(),
    };
    // Persist a record in submissions
    try {
      await supabase.from("submissions" as any).insert({ kind: "template_order_request", data: orderData } as any);
    } catch {/* non-blocking */}
    // Internal email notification
    try {
      await fetch("/api/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: "hello@capacitiq.co.za",
          subject: `New Template Order Request — ${info.fullName}`,
          type: "template_order_request",
          payload: orderData,
          text: `New template order request from ${info.fullName} (${info.email}). Total ${totalRand}. Templates: ${items.map((i) => i.name).join(", ")}.`,
        }),
      });
    } catch {/* non-blocking */}
  }

  function handleContinueToWhatsApp() {
    const waUrl = buildWhatsAppUrl();
    // Fire-and-forget: send notification and persist
    sendOrderRequest();
    window.open(waUrl, "_blank", "noopener,noreferrer");
    setStep(2);
  }

  const validInfo =
    info.fullName && info.email &&
    info.address && info.city && info.country && info.zip;

  return (
    <>
      <Seo title="Secure Checkout | Capacitiq" description="Place your order via WhatsApp. We will send you a payment link within minutes." path="/templates/checkout" />
      <section className="px-4 sm:px-6 pt-10 pb-16">
        <div className="max-w-7xl mx-auto">
          <h1 className="font-display font-bold text-4xl" style={{ color: "#0b4650" }}>Secure Checkout</h1>

          <div className="mt-6 flex flex-wrap gap-2">
            {[{ i: User, l: "Information" }, { i: MessageCircle, l: "Order Review" }, { i: CheckCircle, l: "Confirmation" }].map((s, i) => {
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
                  <button className="btn-cta w-full" disabled={!validInfo} onClick={() => setStep(1)}>
                    Continue to Order Review
                  </button>
                </div>
              )}

              {step === 1 && (
                <div className="space-y-5">
                  <h2 className="font-display font-bold text-xl" style={{ color: "#0b4650" }}>Order Review</h2>
                  <div className="space-y-3">
                    {items.map((it) => (
                      <div key={it.id} className="flex items-center gap-3 neu-raised-sm rounded-2xl p-3">
                        {it.preview_image && <img src={it.preview_image} alt={`${it.name} preview`} className="w-14 h-14 rounded-xl object-cover" />}
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

                  <button className="text-sm" style={{ color: "#4a6670" }} onClick={() => setStep(0)}>← Back to Information</button>
                  <button
                    onClick={handleContinueToWhatsApp}
                    className="w-full inline-flex items-center justify-center gap-3 rounded-2xl font-display font-bold uppercase tracking-wide"
                    style={{ height: 52, backgroundColor: "#e6ff2b", color: "#0b4650", fontFamily: "Ubuntu, system-ui, sans-serif" }}
                  >
                    <MessageCircle size={20} /> Continue to Payment via WhatsApp
                  </button>
                  <p className="text-sm text-center" style={{ color: "#4a6670", fontFamily: "Inter, system-ui, sans-serif" }}>
                    We will send you a payment link within a few minutes. Once payment is confirmed your template will be delivered to your email.
                  </p>
                  <p className="text-xs text-center inline-flex items-center justify-center gap-1.5 w-full" style={{ color: "#4a6670" }}>
                    <ShieldCheck size={14} /> Your details are sent directly to us via WhatsApp. We never store your card details.
                  </p>
                </div>
              )}

              {step === 2 && (
                <div className="text-center py-10">
                  <CheckCircle size={64} className="mx-auto" color="#e6ff2b" />
                  <h2 className="font-display font-bold text-2xl mt-4" style={{ color: "#0b4650", fontFamily: "Ubuntu, system-ui, sans-serif" }}>Request Sent.</h2>
                  <p className="mt-3 max-w-md mx-auto" style={{ color: "#4a6670", fontFamily: "Inter, system-ui, sans-serif" }}>
                    Thank you {info.fullName}. Your WhatsApp should have opened with your order details. We will send you a payment link shortly. Once payment is confirmed your template will be delivered to {info.email}.
                  </p>
                  <div className="mt-6 flex flex-col sm:flex-row justify-center items-center gap-3">
                    <Link to="/templates" className="btn-ghost">Return to Templates</Link>
                    <a href={buildWhatsAppUrl()} target="_blank" rel="noopener noreferrer" className="btn-cta inline-flex items-center gap-2">
                      <MessageCircle size={16} /> Open WhatsApp Again
                    </a>
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
                      {it.preview_image && <img src={it.preview_image} alt={`${it.name} preview`} className="w-12 h-12 rounded-xl object-cover neu-raised-sm" />}
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
                <p className="text-xs mt-4" style={{ color: "#4a6670" }}>A Canva account is required. Template will be emailed once payment is confirmed.</p>
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
