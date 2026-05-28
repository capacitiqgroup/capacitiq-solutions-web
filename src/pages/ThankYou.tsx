import { Link } from "react-router-dom";
import { CheckCircle } from "lucide-react";
import { Seo } from "@/lib/seo";

export default function ThankYou() {
  return (
    <>
      <Seo title="Thank You | Capacitiq" description="Payment received." path="/templates/thank-you" />
      <section className="px-4 sm:px-6 pt-16 pb-24">
        <div className="neu-raised max-w-2xl mx-auto rounded-3xl p-10 text-center">
          <CheckCircle size={64} className="mx-auto" color="#e6ff2b" />
          <h1 className="font-display font-bold text-3xl mt-4">Thank you.</h1>
          <p className="mt-4 text-base">We have received your payment. Please check your email for your template and further details.</p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link to="/templates" className="btn-cta">Browse More Templates</Link>
            <Link to="/" className="btn-ghost">Return to Home</Link>
          </div>
        </div>
      </section>
    </>
  );
}