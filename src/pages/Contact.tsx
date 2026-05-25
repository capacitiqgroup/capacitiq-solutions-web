import { useState } from "react";
import { Mail, Phone, Clock, CheckCircle } from "lucide-react";
import { Seo } from "@/lib/seo";
import { CONTACT } from "@/lib/site";

const SERVICES = ["Business Strategy and Operations", "Marketing and Growth", "Public Relations", "Virtual Assistance", "Graphic Design", "Not Sure", "Other"];
const OPERATING = ["Less than 6 months", "6 to 12 months", "1 to 3 years", "3 plus years"];
const BUDGETS = ["Below R2,000", "R2,000 to R5,000", "R5,000 to R10,000", "R10,000 plus"];
const TIMELINES = ["Immediately", "Within 1 month", "1 to 2 months", "3 plus months"];
const READY = ["Yes", "No", "Just Exploring"];

export default function Contact() {
  const [step, setStep] = useState(0);
  const [done, setDone] = useState(false);
  const [form, setForm] = useState({
    fullName: "", email: "", phone: "", businessName: "",
    overview: "", operating: "",
    services: [] as string[], helpWith: "",
    budget: "", timeline: "", ready: "", notes: "", consent: false,
  });

  const set = (k: string, v: any) => setForm((f) => ({ ...f, [k]: v }));

  async function submit() {
    if (!form.consent) return;
    try {
      await fetch("/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kind: "contact", data: form }),
      });
    } catch {/* preview */}
    setDone(true);
  }

  const stepLabels = ["Your Details", "Business Overview", "Service Selection", "Budget & Timeline"];

  return (
    <>
      <Seo title="Contact Capacitiq — Start the Process" description="Ready to build a business that operates with clarity? Contact Capacitiq to start the process." path="/contact" />
      <section className="px-4 sm:px-6 pt-10 pb-12">
        <div className="max-w-4xl mx-auto">
          <p className="text-xs uppercase tracking-widest text-muted">Contact</p>
          <h1 className="font-display font-bold text-4xl sm:text-5xl mt-2">If you are ready for structured growth.</h1>
          <p className="mt-4">This is not a quick fix service. The work requires clarity, responsiveness, and willingness to implement.</p>
        </div>
      </section>

      <section className="px-4 sm:px-6 pb-16">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 neu-raised rounded-3xl p-6 sm:p-8">
            {done ? (
              <div className="text-center py-10">
                <CheckCircle size={56} className="mx-auto" color="#e6ff2b" />
                <h2 className="font-display font-bold text-2xl mt-4">Message received.</h2>
                <p className="text-sm text-muted mt-2 max-w-md mx-auto">We will get back to you within one business day during business hours, Monday to Friday, 9:00am to 5:00pm.</p>
              </div>
            ) : (
              <>
                <div className="flex flex-wrap gap-2 mb-6">
                  {stepLabels.map((l, i) => (
                    <span key={l} className={`rounded-full px-3 py-1.5 text-xs font-display font-bold ${i === step ? "" : "neu-raised-sm"}`} style={i === step ? { backgroundColor: "#e6ff2b", color: "#0b4650" } : {}}>
                      {i < step && "✓ "}{i + 1}. {l}
                    </span>
                  ))}
                </div>

                {step === 0 && (
                  <div className="space-y-4">
                    <Field label="Full Name *"><input className="neu-inset w-full p-3 text-sm" value={form.fullName} onChange={(e) => set("fullName", e.target.value)} /></Field>
                    <Field label="Email Address *"><input type="email" className="neu-inset w-full p-3 text-sm" value={form.email} onChange={(e) => set("email", e.target.value)} /></Field>
                    <Field label="Phone Number"><input type="tel" className="neu-inset w-full p-3 text-sm" value={form.phone} onChange={(e) => set("phone", e.target.value)} /></Field>
                    <Field label="Business Name *"><input className="neu-inset w-full p-3 text-sm" value={form.businessName} onChange={(e) => set("businessName", e.target.value)} /></Field>
                    <button className="btn-cta" disabled={!form.fullName || !form.email || !form.businessName} onClick={() => setStep(1)}>Continue →</button>
                  </div>
                )}

                {step === 1 && (
                  <div className="space-y-4">
                    <Field label="What does your business do? *"><textarea className="neu-inset w-full p-3 text-sm" rows={4} value={form.overview} onChange={(e) => set("overview", e.target.value)} /></Field>
                    <Field label="How long have you been operating? *">
                      <Radios opts={OPERATING} value={form.operating} onChange={(v) => set("operating", v)} name="operating" />
                    </Field>
                    <div className="flex gap-3 items-center">
                      <button className="text-sm text-muted" onClick={() => setStep(0)}>← Back</button>
                      <button className="btn-cta" disabled={!form.overview || !form.operating} onClick={() => setStep(2)}>Continue →</button>
                    </div>
                  </div>
                )}

                {step === 2 && (
                  <div className="space-y-4">
                    <Field label="Which services are you interested in? *">
                      <div className="flex flex-wrap gap-2">
                        {SERVICES.map((s) => (
                          <label key={s} className="neu-raised-sm rounded-full px-3 py-2 inline-flex items-center gap-2 cursor-pointer text-xs">
                            <input type="checkbox" checked={form.services.includes(s)} onChange={(e) => {
                              set("services", e.target.checked ? [...form.services, s] : form.services.filter((x) => x !== s));
                            }} />
                            {s}
                          </label>
                        ))}
                      </div>
                    </Field>
                    <Field label="What do you need help with? *"><textarea className="neu-inset w-full p-3 text-sm" rows={4} value={form.helpWith} onChange={(e) => set("helpWith", e.target.value)} /></Field>
                    <div className="flex gap-3 items-center">
                      <button className="text-sm text-muted" onClick={() => setStep(1)}>← Back</button>
                      <button className="btn-cta" disabled={!form.services.length || !form.helpWith} onClick={() => setStep(3)}>Continue →</button>
                    </div>
                  </div>
                )}

                {step === 3 && (
                  <div className="space-y-4">
                    <Field label="What is your budget range? *"><Radios opts={BUDGETS} value={form.budget} onChange={(v) => set("budget", v)} name="budget" /></Field>
                    <Field label="When do you need this service? *"><Radios opts={TIMELINES} value={form.timeline} onChange={(v) => set("timeline", v)} name="timeline" /></Field>
                    <Field label="Are you ready to move forward if there is a good fit? *"><Radios opts={READY} value={form.ready} onChange={(v) => set("ready", v)} name="ready" /></Field>
                    <Field label="Any additional notes?"><textarea className="neu-inset w-full p-3 text-sm" rows={3} value={form.notes} onChange={(e) => set("notes", e.target.value)} /></Field>
                    <label className="flex gap-2 items-start text-sm">
                      <input type="checkbox" checked={form.consent} onChange={(e) => set("consent", e.target.checked)} className="mt-1" />
                      <span>I understand that this is a paid service and I will be contacted regarding my enquiry.</span>
                    </label>
                    <div className="flex gap-3 items-center">
                      <button className="text-sm text-muted" onClick={() => setStep(2)}>← Back</button>
                      <button className="btn-cta flex-1" disabled={!form.budget || !form.timeline || !form.ready || !form.consent} onClick={submit}>Send Message</button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          <div className="space-y-4">
            <div className="neu-raised rounded-3xl p-6 space-y-3">
              <div className="neu-raised-sm rounded-full px-4 py-2.5 inline-flex items-center gap-2 text-sm w-full"><Phone size={16} /> WhatsApp: {CONTACT.phone}</div>
              <div className="neu-raised-sm rounded-full px-4 py-2.5 inline-flex items-center gap-2 text-sm w-full"><Mail size={16} /> {CONTACT.email}</div>
              <div className="neu-raised-sm rounded-2xl px-4 py-3 text-sm">
                <div className="flex items-center gap-2 font-display font-bold"><Clock size={16} /> Response Time</div>
                <p className="text-xs text-muted mt-2">
                  We will get back to you within one business day. Business hours are Monday to Friday, 9:00am to 5:00pm.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div><label className="font-display text-sm block mb-2">{label}</label>{children}</div>;
}

function Radios({ opts, value, onChange, name }: { opts: string[]; value: string; onChange: (v: string) => void; name: string }) {
  return (
    <div className="flex flex-wrap gap-2">
      {opts.map((o) => (
        <label key={o} className="neu-raised-sm rounded-full px-3 py-2 inline-flex items-center gap-2 cursor-pointer text-xs">
          <input type="radio" name={name} value={o} checked={value === o} onChange={() => onChange(o)} />
          {o}
        </label>
      ))}
    </div>
  );
}