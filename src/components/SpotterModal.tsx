import { useState } from "react";
import { Modal } from "./Modal";
import { CheckCircle } from "lucide-react";

export function SpotterModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    spotterName: "", spotterEmail: "", spotterPhone: "",
    leadName: "", leadCompany: "", leadContact: "",
    aware: "Yes", notes: "",
    accountName: "", bankName: "", accountNumber: "",
    consent: false,
  });

  const handle = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm({ ...form, [k]: e.target.value });

  const canSubmit =
    !!form.spotterName && !!form.spotterEmail && !!form.leadName && !!form.leadCompany &&
    !!form.leadContact && !!form.accountName && !!form.bankName && !!form.accountNumber && form.consent;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    setSubmitting(true);
    try {
      await fetch("/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kind: "spotter", data: form }),
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
          <h3 className="font-display font-bold text-xl mt-4" style={{ color: "#0b4650" }}>Referral Received.</h3>
          <p className="text-sm mt-2" style={{ color: "#4a6670" }}>
            Thank you for referring {form.leadCompany}. We will reach out to your lead within 48 hours and keep you posted on the outcome.
          </p>
          <button className="btn-cta mt-6" onClick={onClose}>Close</button>
        </div>
      ) : (
        <form className="space-y-4" onSubmit={onSubmit}>
          <Input label="Your Name *" value={form.spotterName} onChange={handle("spotterName")} required />
          <Input label="Your Email *" type="email" value={form.spotterEmail} onChange={handle("spotterEmail")} required />
          <Input label="Your Phone" type="tel" value={form.spotterPhone} onChange={handle("spotterPhone")} />
          <Input label="Lead Name *" value={form.leadName} onChange={handle("leadName")} required />
          <Input label="Lead Company *" value={form.leadCompany} onChange={handle("leadCompany")} required />
          <Input label="Lead Contact (email or phone) *" value={form.leadContact} onChange={handle("leadContact")} required />
          <div>
            <label className="font-display text-sm block mb-2">Does the referred business know they are being referred? *</label>
            <div className="flex gap-3">
              {["Yes", "No"].map((opt) => (
                <label key={opt} className="neu-raised-sm rounded-full px-4 py-2 inline-flex items-center gap-2 cursor-pointer text-sm">
                  <input type="radio" name="aware" value={opt} checked={form.aware === opt} onChange={handle("aware")} />
                  {opt}
                </label>
              ))}
            </div>
          </div>
          <div>
            <label className="font-display text-sm block mb-2">Notes — what do they need help with?</label>
            <textarea className="neu-inset w-full p-3 text-sm" rows={3} value={form.notes} onChange={handle("notes")} />
          </div>

          <div className="pt-4 border-t border-[#c5cdd4]">
            <h4 className="font-display font-bold text-sm" style={{ color: "#0b4650" }}>Your Payment Details</h4>
            <p className="text-xs mt-1" style={{ color: "#4a6670" }}>
              Your banking details are collected solely for the purpose of processing your commission if a referral results in a paid engagement. They will not be used for any other purpose.
            </p>
          </div>
          <Input label="Account Holder Name *" value={form.accountName} onChange={handle("accountName")} required />
          <Input label="Bank Name *" placeholder="e.g. Capitec, FNB, Standard Bank, Nedbank, Absa" value={form.bankName} onChange={handle("bankName")} required />
          <Input label="Account Number *" value={form.accountNumber} onChange={handle("accountNumber")} required />

          <label className="flex gap-2 items-start text-sm">
            <input type="checkbox" className="mt-1" checked={form.consent} onChange={(e) => setForm({ ...form, consent: e.target.checked })} />
            <span>
              I have read and agree to the Capacitiq{" "}
              <a href="/spotter-policy" target="_blank" rel="noreferrer" className="underline" style={{ color: "#0b4650" }}>Spotter Programme Policy</a>{" "}
              and confirm that the referred business is aware that their details are being submitted, or I have their permission to do so.
            </span>
          </label>

          <button className="btn-cta w-full" disabled={!canSubmit || submitting}>
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