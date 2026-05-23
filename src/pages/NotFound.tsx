import { Link } from "react-router-dom";
import { Seo } from "@/lib/seo";

export default function NotFound() {
  return (
    <>
      <Seo title="Not Found | Capacitiq" description="Page not found" path="/404" />
      <section className="px-4 sm:px-6 py-24">
        <div className="neu-raised max-w-xl mx-auto rounded-3xl p-10 text-center">
          <h1 className="text-5xl font-display font-bold">404</h1>
          <p className="text-muted mt-3">This page does not exist.</p>
          <Link to="/" className="btn-cta mt-6">Go Home</Link>
        </div>
      </section>
    </>
  );
}