import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { CheckCircle } from "lucide-react";
import { Seo } from "@/lib/seo";
import { supabase } from "@/integrations/supabase/client";

type Opt = { id: string; name: string; payment_link: string | null };

export default function ThankYou() {
  const [templates, setTemplates] = useState<Opt[]>([]);
  const [email, setEmail] = useState("");
  const [selectedLink, setSelectedLink] = useState("");
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    supabase
      .from("templates")
      .select("id,name,payment_link")
      .eq("status", "published")
      .not("payment_link", "is", null)
      .then(({ data }) => setTemplates((data as any) || []));
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!email || !selectedLink) return;
    setSending(true);
    try {
      const r = await fetch("/api/send-canva-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customerEmail: email, templatePaymentLink: selectedLink }),
      });
      if (!r.ok) {
        const b = await r.json().catch(() => ({}));
        setError(b.error || "Could not send. Please try again.");
      } else {
        setDone(true);
      }
    } catch {
      setError("Network error. Please try again.");
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
          <h2 className="font-display font-bold text-3xl mt-4" style={{ color: "#0b4650", fontFamily: "Ubuntu, system-ui, sans-serif" }}>
            Payment Successful.
          </h2>
          <p className="mt-4 text-[15px]" style={{ color: "#4a6670", fontFamily: "Inter, system-ui, sans-serif" }}>
            Thank you for your purchase. Paystack has sent your download link to your email. You can also download your template directly from the Paystack confirmation page.
          </p>
          <p className="mt-3 text-[15px]" style={{ color: "#4a6670", fontFamily: "Inter, system-ui, sans-serif" }}>
            We are also sending your Canva template link separately to your email. Please check your inbox and spam folder. A Canva account is required to access and edit your template.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/templates" className="btn-cta">Browse More Templates</Link>
          </div>
          <Link to="/" className="inline-block mt-4 text-sm underline" style={{ color: "#0b4650" }}>Return to Home</Link>

          <div className="mt-10 pt-8 border-t border-[#c5cdd4] text-left">
            <h3 className="font-display font-bold text-base" style={{ color: "#0b4650", fontFamily: "Ubuntu, system-ui, sans-serif" }}>
              Get your Canva link by email
            </h3>
            <p className="mt-1 text-[13px]" style={{ color: "#4a6670", fontFamily: "Inter, system-ui, sans-serif" }}>
              Enter the email you used to pay and we will send your Canva template link directly to your inbox.
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
                  value={selectedLink}
                  onChange={(e) => setSelectedLink(e.target.value)}
                >
                  <option value="">Which template did you purchase?</option>
                  {templates.map((t) => (
                    <option key={t.id} value={t.payment_link || ""}>{t.name}</option>
                  ))}
                </select>
                {error && <p className="text-sm" style={{ color: "#b00020" }}>{error}</p>}
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
