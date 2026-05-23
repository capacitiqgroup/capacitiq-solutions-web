import { useState } from "react";
import { Modal } from "./Modal";
import { CheckCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export function SpotterModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    yourName: "", yourEmail: "", yourPhone: "",
    leadName: "", leadCompany: "", leadContact: "",
    awareness: "Yes", notes: "",
  });

  const handle = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm({ ...form, [k]: e.target.value });

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    await supabase.from("submissions").insert({ kind: "spotter", data: form });
    try {
      await fetch("/api/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject: `New Spotter Referral — ${form.leadCompany}`,
          to: "hello@capacitiq.co.za",
          text: Object.entries(form).map(([k, v]) => `${k}: ${v}`).join("\n"),
        }),
      });
    } catch { /* preview env */ }
    setSubmitting(false);
    setSubmitted(true);
  }

  return (
    <Modal open={open} onClose={onClose} title="Refer a Business. Earn Commission." subtitle="Know an SME that needs structure? Refer them. If they sign with us, you earn.">
      {submitted ? (
        <div className="text-center py-6">
          <CheckCircle size={56} className="mx-auto" color="#e6ff2b" />
          <h3 className="font-display font-bold text-xl mt-4">Referral Received.</h3>
          <p className="text-sm text-muted mt-2">Thanks. We will follow up with the lead and let you know when commission triggers.</p>
        </div>
      ) : (
        <form className="space-y-4" onSubmit={onSubmit}>
          <Input label="Your Name *" value={form.yourName} onChange={handle("yourName")} required />
          <Input label="Your Email *" type="email" value={form.yourEmail} onChange={handle("yourEmail")} required />
          <Input label="Your Phone" type="tel" value={form.yourPhone} onChange={handle("yourPhone")} />
          <Input label="Lead Name *" value={form.leadName} onChange={handle("leadName")} required />
          <Input label="Lead Company *" value={form.leadCompany} onChange={handle("leadCompany")} required />
          <Input label="Lead Contact (email or phone) *" value={form.leadContact} onChange={handle("leadContact")} required />
          <div>
            <label className="font-display text-sm block mb-2">Does the referred business know they are being referred? *</label>
            <div className="flex gap-3">
              {["Yes", "No"].map((opt) => (
                <label key={opt} className="neu-raised-sm rounded-full px-4 py-2 inline-flex items-center gap-2 cursor-pointer text-sm">
                  <input type="radio" name="awareness" value={opt} checked={form.awareness === opt} onChange={handle("awareness")} />
                  {opt}
                </label>
              ))}
            </div>
          </div>
          <div>
            <label className="font-display text-sm block mb-2">Notes — what do they need help with?</label>
            <textarea className="neu-inset w-full p-3 text-sm" rows={3} value={form.notes} onChange={handle("notes")} />
          </div>
          <button className="btn-cta w-full" disabled={submitting}>
            {submitting ? "Submitting…" : "Submit Referral"}
          </button>
        </form>
      )}
    </Modal>
  );
}

function Input({ label, ...props }: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  return (
    <div>
      <label className="font-display text-sm block mb-2">{label}</label>
      <input className="neu-inset w-full p-3 text-sm" {...props} />
    </div>
  );
}