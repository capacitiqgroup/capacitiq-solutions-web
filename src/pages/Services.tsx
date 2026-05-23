import { Link } from "react-router-dom";
import { CheckCircle } from "lucide-react";
import { Seo } from "@/lib/seo";

const PILLARS = [
  { id: "business-strategy", n: "01", title: "Business Strategy and Operations", tagline: "Build the foundation. Create the systems. Lead with clarity.", body: "We help you move from instinct and improvisation to structured, documented, and intentional operations. We work with founders and leadership teams to identify operational gaps, build the systems that remove decision fatigue, and document how your business actually runs so it can scale without breaking.", deliverables: ["Operational diagnostic and gap analysis", "Process and workflow documentation", "Standard operating procedures", "Decision and escalation frameworks", "Quarterly review cadence"] },
  { id: "marketing-growth", n: "02", title: "Marketing and Growth", tagline: "Be seen. Be understood. Be chosen.", body: "We build positioning, systems, and campaigns that attract the right people and convert them. Marketing should not be a guessing game.", deliverables: ["Positioning and messaging architecture", "Content systems and editorial calendar", "Launch and campaign planning", "Funnel and conversion design", "Performance reporting cadence"] },
  { id: "public-relations", n: "03", title: "Public Relations", tagline: "Shape the narrative. Build the authority.", body: "PR at Capacitiq is about authority, not noise. We craft how your business is positioned in the market and how you communicate consistently across every touchpoint.", deliverables: ["Communication strategy", "Authority positioning framework", "Spokesperson and message training", "Stakeholder communication plans", "Crisis and response protocols"] },
  { id: "virtual-assistance", n: "04", title: "Virtual Assistance", tagline: "Stop doing everything. Start running a business.", body: "Our virtual assistance is not freelance admin. It is structured execution support that integrates into your workflow so the operational load no longer sits on the founder's desk.", deliverables: ["Inbox and calendar management", "Scheduling and coordination", "Document and CRM upkeep", "Reporting and follow-up", "Process documentation as we go"] },
  { id: "graphic-design", n: "05", title: "Graphic Design", tagline: "Look like you mean business.", body: "Every asset we produce is built to support how you communicate, sell, and operate. Brand-consistent and execution-ready.", deliverables: ["Sales and pitch decks", "Social and content templates", "Editable Canva systems", "Document and proposal templates", "Brand consistency guidelines"] },
];

export default function Services() {
  return (
    <>
      <Seo title="Our Services | Capacitiq — Business Strategy and Design" description="Five integrated service pillars — business strategy, marketing, PR, virtual assistance, and graphic design — built for South African startups and SMEs." path="/services" />
      <section className="px-4 sm:px-6 pt-10 pb-12">
        <div className="max-w-4xl mx-auto">
          <p className="text-xs uppercase tracking-widest text-muted">Services</p>
          <h1 className="font-display font-bold text-4xl sm:text-5xl mt-2">Know what to expect before you commit.</h1>
          <p className="mt-4 text-lg">Five integrated disciplines plus a fully managed web presence offering. Custom quotations are always available.</p>
        </div>
      </section>

      <section className="px-4 sm:px-6 pb-16">
        <div className="max-w-7xl mx-auto space-y-10">
          {PILLARS.map((p) => (
            <div key={p.id} id={p.id} className="neu-raised rounded-3xl p-8 lg:p-10 grid lg:grid-cols-3 gap-8 scroll-mt-32">
              <div className="lg:col-span-2">
                <span className="neu-raised-sm inline-block rounded-xl px-3 py-1 text-xs font-display font-bold">{p.n}</span>
                <h2 className="font-display font-bold text-2xl sm:text-3xl mt-4">{p.title}</h2>
                <p className="text-sm text-muted mt-2 italic">{p.tagline}</p>
                <p className="mt-4">{p.body}</p>
                <Link to="/contact" className="btn-cta mt-6 inline-flex">Apply This To Your Business</Link>
              </div>
              <div className="neu-raised-sm rounded-2xl p-6">
                <h3 className="font-display font-bold text-sm uppercase tracking-wider mb-4">Deliverables</h3>
                <ul className="space-y-3">
                  {p.deliverables.map((d) => (
                    <li key={d} className="flex gap-2 items-start text-sm">
                      <CheckCircle size={16} color="#0b4650" className="mt-0.5 shrink-0" />
                      <span>{d}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="px-4 sm:px-6 py-16">
        <div className="neu-raised max-w-4xl mx-auto rounded-3xl p-10 text-center">
          <h2 className="font-display font-bold text-3xl">Start structuring your business operations.</h2>
          <p className="mt-4">Once reviewed, reach out with clarity on what fits your business.</p>
          <Link to="/contact" className="btn-cta mt-6 inline-flex">Apply This To Your Business</Link>
        </div>
      </section>
    </>
  );
}