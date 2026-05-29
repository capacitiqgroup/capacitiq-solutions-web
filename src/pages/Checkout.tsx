import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { User, CreditCard, CheckCircle, Lock, AlertCircle, ExternalLink } from "lucide-react";
import { Seo } from "@/lib/seo";
import { useCart, formatZAR } from "@/lib/cart";

export default function Checkout() {
  const cart = useCart();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [orderId, setOrderId] = useState("");
  const [info, setInfo] = useState({ fullName: "", email: "", company: "", address: "", city: "", country: "South Africa", zip: "" });
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);

  if (cart.items.length === 0 && step !== 2) {
    return (
      <section className="px-4 sm:px-6 py-20 text-center">
        <p>Your cart is empty.</p>
        <Link to="/templates" className="btn-cta mt-4 inline-flex">Browse Templates</Link>
      </section>
    );
  }

  const totalCents = cart.total();
  const isFree = totalCents === 0;

  async function chargeServer(newOrderId: string) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30000);
    try {
      const resp = await fetch("/api/charge", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token: null, currency: "ZAR", orderId: newOrderId,
          customerEmail: info.email, customerName: info.fullName,
          templateIds: cart.items.map((i) => i.id),
          itemIds: cart.items.map((i) => i.id),
        }),
        signal: controller.signal,
      });
      clearTimeout(timeout);
      return await resp.json();
    } catch (e: any) {
      clearTimeout(timeout);
      if (e?.name === "AbortError") {
        return { success: false, error: "The request timed out. Please check your connection and try again." };
      }
      throw e;
    }
  }

  async function claimFree() {
    if (!info.fullName || !info.email) return;
    setError(null);
    setProcessing(true);
    const newOrderId = crypto.randomUUID();
    try {
      const r = await chargeServer(newOrderId);
      if (r.success) { setOrderId(newOrderId); cart.clear(); setStep(2); }
      else { setError(r.error || "Could not complete."); setProcessing(false); }
    } catch (e: any) {
      setError("This only works on Vercel deployment. " + (e?.message || ""));
      setProcessing(false);
    }
  }

  function goToYoco() {
    setError(null);
    setProcessing(true);
    // Persist pending order context so the thank-you page can resolve it
    try {
      sessionStorage.setItem(
        "capacitiq_pending_payment",
        JSON.stringify({
          email: info.email,
          name: info.fullName,
          totalCents,
          itemIds: cart.items.map((i) => i.id),
          ts: Date.now(),
        })
      );
    } catch {/* ignore */}
    const url = new URL("https://pay.yoco.com/capacitiq");
    // Amount is locked server-side on Yoco's payment page; we still pass it as a prefill.
    url.searchParams.set("amount", String(totalCents));
    s.set("reference", info.email);
    window.location.href = url.toString();
  }

  return (
    <>
      <Seo title="Secure Checkout | Capacitiq" description="Secure Capacitiq template checkout." path="/templates/checkout" />
      <section className="px-4 sm:px-6 pt-10 pb-16">
        <div className="max-w-7xl mx-auto">
          <h1 className="font-display font-bold text-4xl">{isFree ? "Get Your Templates" : "Secure Checkout"}</h1>

          <div className="mt-6 flex flex-wrap gap-2">
            {[{ i: User, l: "Information" }, { i: CreditCard, l: isFree ? "Confirm" : "Payment" }, { i: CheckCircle, l: "Confirmation" }].map((s, i) => {
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
                  <h2 className="font-display font-bold text-xl">Your Information</h2>
                  <CInput label="Full Name *" value={info.fullName} onChange={(v) => setInfo({ ...info, fullName: v })} />
                  <CInput label="Email Address *" type="email" value={info.email} onChange={(v) => setInfo({ ...info, email: v })} />
                  <CInput label="Company Name" value={info.company} onChange={(v) => setInfo({ ...info, company: v })} />
                  {!isFree && (
                    <>
                      <h2 className="font-display font-bold text-xl pt-4">Billing Details</h2>
                      <CInput label="Billing Address *" value={info.address} onChange={(v) => setInfo({ ...info, address: v })} />
                      <CInput label="City *" value={info.city} onChange={(v) => setInfo({ ...info, city: v })} />
                      <div>
                        <label className="font-display text-sm block mb-2">Country *</label>
                        <select className="neu-inset w-full p-3 text-sm" value={info.country} onChange={(e) => setInfo({ ...info, country: e.target.value })}>
                          {["South Africa", "Namibia", "Botswana", "Lesotho", "Eswatini", "Zimbabwe", "Other"].map((c) => <option key={c}>{c}</option>)}
                        </select>
                      </div>
                      <CInput label="Zip or Postal Code *" value={info.zip} onChange={(v) => setInfo({ ...info, zip: v })} />
                    </>
                  )}
                  <button
                    className="btn-cta w-full"
                    disabled={!info.fullName || !info.email || (!isFree && (!info.address || !info.city || !info.zip))}
                    onClick={() => setStep(1)}
                  >
                    {isFree ? "Continue" : "Continue to Payment"}
                  </button>
                </div>
              )}

              {step === 1 && (
                <div className="space-y-4">
                  {isFree ? (
                    <>
                      <h2 className="font-display font-bold text-xl">You are getting these for free.</h2>
                      <div className="space-y-3">
                        {cart.items.map((it) => (
                          <div key={it.id} className="flex items-center gap-3 neu-raised-sm rounded-2xl p-3">
                            {it.preview_image && <img src={it.preview_image} alt={it.name} className="w-14 h-14 rounded-xl object-cover" />}
                            <div className="flex-1 min-w-0">
                              <p className="font-display font-bold text-sm">{it.name}</p>
                              <p className="text-xs italic text-muted">{it.category}</p>
                            </div>
                            <span className="text-xs font-display font-bold rounded-full px-2.5 py-1" style={{ backgroundColor: "#e6ff2b", color: "#0b4650" }}>FREE</span>
                          </div>
                        ))}
                      </div>
                      <p className="text-sm text-muted">Your Canva template links will be emailed to <strong>{info.email}</strong>.</p>
                      <button className="text-sm text-muted" onClick={() => setStep(0)}>← Back to Information</button>
                      <button className="btn-cta w-full" style={{ height: 52 }} disabled={processing} onClick={claimFree}>
                        {processing ? "Processing…" : "Get Your Templates Free"}
                      </button>
                    </>
                  ) : (
                    <>
                      <h2 className="font-display font-bold text-xl">Secure Payment via Yoco</h2>
                      <div className="neu-raised-sm rounded-2xl p-5 space-y-3">
                        <p className="text-sm">You will be redirected to Yoco's secure payment page to complete your purchase.</p>
                        <div className="text-sm">
                          <div className="flex justify-between"><span className="text-muted">Amount</span><strong>{formatZAR(totalCents)}</strong></div>
                          <div className="flex justify-between mt-1"><span className="text-muted">Reference</span><strong className="truncate ml-3">{info.email}</strong></div>
                        </div>
                        <p className="text-xs text-muted inline-flex items-center gap-1.5"><Lock size={14} /> The amount is locked. You cannot change it on the Yoco page.</p>
                      </div>
                      <button className="text-sm text-muted" onClick={() => setStep(0)}>← Back to Information</button>
                      <button className="btn-cta w-full inline-flex items-center justify-center gap-2" style={{ height: 52 }} disabled={processing} onClick={goToYoco}>
                        {processing ? "Redirecting…" : <>Continue to Yoco · Pay {formatZAR(totalCents)} <ExternalLink size={16} /></>}
                      </button>
                      <p className="text-xs text-muted text-center">After payment, you will be returned to our thank-you page and your template will be emailed to you.</p>
                    </>
                  )}
                  {error && (
                    <div className="neu-raised-sm rounded-2xl p-4 border-l-4" style={{ borderLeftColor: "#dc2626" }}>
                      <div className="flex items-start gap-2 text-sm" style={{ color: "#dc2626" }}>
                        <AlertCircle size={20} className="shrink-0 mt-0.5" />
                        <div>
                          <p>{error}</p>
                          <button className="underline mt-2" onClick={() => setError(null)}>Try again</button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {step === 2 && (
                <div className="text-center py-10">
                  <CheckCircle size={64} className="mx-auto" color="#e6ff2b" />
                  <h2 className="font-display font-bold text-2xl mt-4">{isFree ? "All done." : "Payment Successful."}</h2>
                  <p className="mt-3 max-w-md mx-auto">Thank you. Your Canva template link has been sent to {info.email}. Please check your inbox and spam folder. A Canva account is required to access your template.</p>
                  <p className="text-xs text-muted mt-4">Order reference: {orderId}</p>
                  <div className="mt-6 flex flex-col items-center gap-2">
                    <button className="btn-cta" onClick={() => navigate("/templates")}>Browse More Templates</button>
                    <Link to="/" className="text-sm text-muted">Return to Home</Link>
                  </div>
                </div>
              )}
            </div>

            {step !== 2 && (
              <aside className="neu-raised rounded-3xl p-6 h-fit lg:sticky lg:top-28">
                <h2 className="font-display font-bold text-lg">Order Summary</h2>
                <div className="mt-4 space-y-3">
                  {cart.items.map((it) => (
                    <div key={it.id} className="flex items-center gap-3">
                      {it.preview_image && <img src={it.preview_image} alt={it.name} className="w-12 h-12 rounded-xl object-cover neu-raised-sm" />}
                      <div className="min-w-0 flex-1">
                        <p className="font-display font-bold text-sm truncate">{it.name}</p>
                        <p className="text-xs italic text-muted">{it.category}</p>
                      </div>
                      <span className="text-sm font-display">{it.price === 0 ? "FREE" : formatZAR(it.price)}</span>
                    </div>
                  ))}
                </div>
                <div className="border-t border-[#c5cdd4] mt-4 pt-4 space-y-1 text-sm">
                  <div className="flex justify-between"><span>Subtotal</span><span>{isFree ? "FREE" : formatZAR(totalCents)}</span></div>
                  <div className="flex justify-between"><span>Shipping</span><span>FREE (Digital)</span></div>
                </div>
                <div className="border-t border-[#c5cdd4] mt-2 pt-3 flex justify-between font-display font-bold text-lg">
                  <span>Total</span><span>{isFree ? "FREE" : formatZAR(totalCents)}</span>
                </div>
                <p className="text-xs text-muted mt-4">You will receive a download link via email.</p>
                <p className="text-xs text-muted mt-3">Standard packs are licensed for personal or business use only. All digital product sales are final. A Canva account is required.</p>
              </aside>
            )}
          </div>
        </div>
      </section>
    </>
  );
}

function CInput({ label, value, onChange, type = "text", placeholder }: { label: string; value: string; onChange: (v: string) => void; type?: string; placeholder?: string }) {
  return (
    <div>
      <label className="font-display text-sm block mb-2">{label}</label>
      <input type={type} placeholder={placeholder} className="neu-inset w-full p-3 text-sm" value={value} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}
