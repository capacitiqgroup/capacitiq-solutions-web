import { useEffect, useState } from "react";
import { Plus, Minus, CheckCircle } from "lucide-react";
import { Seo } from "@/lib/seo";
import { supabase } from "@/integrations/supabase/client";
import { Modal } from "@/components/Modal";
import { SpotterModal } from "@/components/SpotterModal";

type Career = {
  id: string; title: string; location: string | null; type: string | null; status: string;
  overview: string | null; responsibilities: string[] | null; requirements: string[] | null;
  compensation: string | null; who_for: string | null;
};

const CULTURE = [
  ["Accountability", "Ownership of performance is non-negotiable. We expect execution from day one."],
  ["Clarity", "Clear expectations, clear deliverables, clear outcomes."],
  ["Consistent Execution", "Contractors operate independently and take full ownership of performance."],
  ["Remote and Flexible", "Manage your own time provided performance expectations are met."],
];

const JOB_LD = {
  "@context": "https://schema.org", "@type": "JobPosting",
  title: "Sales Spotter", description: "Refer qualified businesses to Capacitiq and earn 15% of their first invoice.",
  employmentType: "CONTRACTOR",
  hiringOrganization: { "@type": "Organization", name: "Capacitiq Solutions (Pty) Ltd", sameAs: "https://capacitiq.co.za" },
  jobLocation: { "@type": "Place", address: { "@type": "PostalAddress", addressLocality: "Johannesburg", addressRegion: "Gauteng", addressCountry: "ZA" } },
  datePosted: "2026-05-19", validThrough: "2026-12-31",
};

export default function Careers() {
  const [careers, setCareers] = useState<Career[]>([]);
  const [open, setOpen] = useState<string | null>(null);
  const [applyRole, setApplyRole] = useState<string | null>(null);
  const [spotterOpen, setSpotterOpen] = useState(false);

  useEffect(() => {
    supabase.from("careers").select("*").then(({ data }) => setCareers((data as any) || []));
  }, []);

  return (
    <>
      <Seo title="Careers | Capacitiq — Remote Performance-Based Roles" description="Remote, flexible, performance-based contractor roles at Capacitiq across South Africa." path="/careers" jsonLd={JOB_LD} />
      <section className="px-4 sm:px-6 pt-10 pb-10">
        <div className="max-w-4xl mx-auto">
          <p className="text-xs uppercase tracking-widest text-muted">Careers</p>
          <h1 className="font-display font-bold text-4xl sm:text-5xl mt-2">Careers</h1>
          <p className="mt-4">Work in a structured, performance-driven environment. Remote, flexible, independent contractor roles.</p>
        </div>
      </section>

      <section className="px-4 sm:px-6 py-10">
        <div className="max-w-7xl mx-auto grid sm:grid-cols-2 gap-4">
          {CULTURE.map(([t, b]) => (
            <div key={t} className="neu-raised rounded-3xl p-6">
              <h3 className="font-display font-bold text-lg">{t}</h3>
              <p className="text-sm text-muted mt-2">{b}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="px-4 sm:px-6 py-12">
        <div className="max-w-4xl mx-auto">
          <h2 className="font-display font-bold text-3xl">Open Roles</h2>
          <div className="mt-6 space-y-3">
            {careers.map((c) => {
              const isOpen = c.status === "open";
              const expanded = open === c.id;
              return (
                <div key={c.id} className="neu-raised rounded-3xl">
                  <button onClick={() => setOpen(expanded ? null : c.id)} className="w-full text-left p-6 flex items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-display font-bold text-lg">{c.title}</h3>
                        <span className={`rounded-full px-3 py-1 text-xs font-display font-bold ${isOpen ? "" : "neu-raised-sm text-muted"}`} style={isOpen ? { backgroundColor: "#dcfce7", color: "#166534" } : {}}>
                          {isOpen ? "Open" : "Applications Closed"}
                        </span>
                      </div>
                      <p className="text-xs text-muted mt-1">{c.location} · {c.type}</p>
                    </div>
                    {expanded ? <Minus size={20} /> : <Plus size={20} />}
                  </button>
                  {expanded && (
                    <div className="px-6 pb-6 space-y-4 text-sm">
                      <p>{c.overview}</p>
                      {c.responsibilities && (
                        <div>
                          <h4 className="font-display font-bold mb-2">Responsibilities</h4>
                          <ul className="space-y-1 list-disc pl-5 text-muted">{c.responsibilities.map((r) => <li key={r}>{r}</li>)}</ul>
                        </div>
                      )}
                      {c.requirements && (
                        <div>
                          <h4 className="font-display font-bold mb-2">Requirements</h4>
                          <ul className="space-y-1 list-disc pl-5 text-muted">{c.requirements.map((r) => <li key={r}>{r}</li>)}</ul>
                        </div>
                      )}
                      {c.compensation && <p><strong className="font-display">Compensation:</strong> <span className="text-muted">{c.compensation}</span></p>}
                      {isOpen && (
                        <button
                          className="btn-cta"
                          onClick={() => {
                            if (/spotter/i.test(c.title)) setSpotterOpen(true);
                            else setApplyRole(c.title);
                          }}
                        >
                          Apply Now
                        </button>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {applyRole && <ApplyModal role={applyRole} onClose={() => setApplyRole(null)} />}
      <SpotterModal open={spotterOpen} onClose={() => setSpotterOpen(false)} />
    </>
  );
}

function ApplyModal({ role, onClose }: { role: string; onClose: () => void }) {
  const [done, setDone] = useState(false);
  const [form, setForm] = useState({ fullName: "", email: "", phone: "", location: "", why: "", experience: "", linkedin: "", consent: false });
  const submit = async () => {
    if (!form.consent || form.why.length < 100) return;
    await supabase.from("submissions").insert({ kind: "career_application", data: { role, ...form } });
    try {
      await fetch("/api/send-career-application", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role, ...form }),
      });
    } catch {/* preview */}
    setDone(true);
  };
  return (
    <Modal open={true} onClose={onClose} title={`Apply for ${role}`} subtitle="We review every application personally. No automated rejections.">
      {done ? (
        <div className="text-center py-6">
          <CheckCircle size={56} className="mx-auto" color="#e6ff2b" />
          <h3 className="font-display font-bold text-xl mt-4">Application Received.</h3>
          <p className="text-sm text-muted mt-2">Thank you {form.fullName.split(" ")[0]}. We will be in touch if there is a fit.</p>
          <button className="btn-cta mt-6" onClick={onClose}>Close</button>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="neu-raised-sm rounded-full px-4 py-2 text-sm font-display font-bold inline-block">Role: {role}</div>
          {[
            ["Full Name *", "fullName"], ["Email Address *", "email", "email"], ["Phone Number", "phone", "tel"],
            ["City and Country *", "location"], ["LinkedIn or portfolio URL", "linkedin"],
          ].map(([label, key, type]) => (
            <div key={key as string}>
              <label className="font-display text-sm block mb-1">{label}</label>
              <input type={(type as string) || "text"} className="neu-inset w-full p-3 text-sm" value={(form as any)[key as string]} onChange={(e) => setForm({ ...form, [key as string]: e.target.value })} />
            </div>
          ))}
          <div>
            <label className="font-display text-sm block mb-1">Why do you want to work with Capacitiq? *</label>
            <textarea rows={4} className="neu-inset w-full p-3 text-sm" value={form.why} onChange={(e) => setForm({ ...form, why: e.target.value })} />
            <p className="text-xs text-muted mt-1">{form.why.length}/100 min</p>
          </div>
          <div>
            <label className="font-display text-sm block mb-1">Relevant experience *</label>
            <textarea rows={3} className="neu-inset w-full p-3 text-sm" value={form.experience} onChange={(e) => setForm({ ...form, experience: e.target.value })} />
          </div>
          <label className="flex gap-2 items-start text-sm">
            <input type="checkbox" className="mt-1" checked={form.consent} onChange={(e) => setForm({ ...form, consent: e.target.checked })} />
            <span>I confirm the information is accurate and consent to Capacitiq storing my application for recruitment purposes.</span>
          </label>
          <button className="btn-cta w-full" onClick={submit}>Submit Application</button>
        </div>
      )}
    </Modal>
  );
}