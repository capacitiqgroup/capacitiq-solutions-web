import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { CheckCircle } from "lucide-react";
import { Seo } from "@/lib/seo";
import { supabase } from "@/integrations/supabase/client";

type Opt = { id: string; name: string };

export default function ThankYou() {
  const [templates, setTemplates] = useState<Opt[]>([]);
  const [email, setEmail] = useState("");
  const [selectedId, setSelectedId] = useState("");
  const [paymentReference, setPaymentReference] = useState("");
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const e = params.get("email") || params.get("customer_email") || "";
    const ref = params.get("reference") || params.get("trxref") || "";
    if (e && e.includes("@")) setEmail(e);
    if (ref) setPaymentReference(ref);
  }, []);

  useEffect(() => {
    supabase
      .from("templates")
      .select("id,name")
      .eq("status", "published")
      .order("name")
      .then(({ data }) => setTemplates((data as any) || []));
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!email || !selectedId) return;
    setSending(true);
    try {
      const r = await fetch("/api/send-canva-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customerEmail: email, templateId: selectedId }),
      });
      if (!r.ok) {
        const b = await r.json().catch(() => ({}));
        setError(b.error || "Could not send. Please try again or contact us on WhatsApp.");
      } else {
        setDone(true);
      }
    } catch {
      setError("Network error. Please try again or contact us on WhatsApp.");
    } finally {
      setSending(false);
    }
  }

  return (
    <>
      <Seo title="Payment Successful | Capacitiq" description="Thank you for your purchase. Your Canva template link has been emailed to you." path="/templates/thank-you" />
      <section className="px-4 sm:px-6 pt-10 pb-16">
        <div className="max-w-2xl mx-auto neu-raised rounded-3xl p-8 sm:p-10 text-center">
          <CheckCircle size={64} className="mx-auto" color="#e6ff2b" />
          <h1 className="font-display font-bold text-3xl mt-4" style={{ color: "#0b4650" }}>
            Payment Successful.
          </h1>
          <p className="mt-4 text-[15px]" style={{ color: "#4a6670" }}>
            Thank you for your purchase. Paystack has sent your download receipt to your email. We are also sending your Canva template link separately — please check your inbox and spam folder. A Canva account is required to access and edit your template.
          </p>
          {paymentReference && (
            <p className="mt-3 text-xs" style={{ color: "#4a6670" }}>
              Order reference: {paymentReference}
            </p>
          )}

          <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/templates" className="btn-cta">Browse More Templates</Link>
          </div>
          <Link to="/" className="inline-block mt-4 text-sm underline" style={{ color: "#0b4650" }}>Return to Home</Link>

          <div className="mt-10 pt-8 border-t border-[#c5cdd4] text-left">
            <h2 className="font-display font-bold text-base" style={{ color: "#0b4650" }}>
              Get your Canva link by email
            </h2>
            <p className="mt-1 text-[13px]" style={{ color: "#4a6670" }}>
              Enter the email you used to pay and pick the template you purchased — we will email your Canva link straight to your inbox.
            </p>

            {done ? (
              <div className="mt-4 neu-raised-sm rounded-2xl p-4 text-sm" style={{ color: "#0b4650" }}>
                Canva link sent. Check your inbox and spam folder.
              </div>
            ) : (
              <form onSubmit={submit} className="mt-4 space-y-3">
                <input
                  type="email"
                  required
                  placeholder="Email address"
                  className="neu-inset w-full p-3 text-sm"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <select
                  required
                  className="neu-inset w-full p-3 text-sm"
                  value={selectedId}
                  onChange={(e) => setSelectedId(e.target.value)}
                >
                  <option value="">Which template did you purchase?</option>
                  {templates.map((t) => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
                {error && (
                  <div className="space-y-3">
                    <p className="text-sm" style={{ color: "#b00020" }}>{error}</p>
                    <a
                      href="https://wa.me/27640620354"
                      target="_blank"
                      rel="noreferrer"
                      className="btn-ghost w-full inline-flex items-center justify-center"
                    >
                      Contact Us on WhatsApp
                    </a>
                  </div>
                )}
                <button className="btn-cta w-full" disabled={sending}>
                  {sending ? "Sending..." : "Send My Canva Link"}
                </button>
              </form>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
