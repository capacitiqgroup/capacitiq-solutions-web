import { Link } from "react-router-dom";
import { ChevronRight, ChevronDown } from "lucide-react";
import { Seo } from "@/lib/seo";
import { useState } from "react";

const FAQ = [
  { q: "Why focus on systems before growth?", a: "Activity without structure produces inconsistency. Building the operating system first allows every resource, team member, or campaign to sit on something stable." },
  { q: "What makes your approach different?", a: "We do not separate strategy from execution. We think before we produce, document what we build, and leave you with something you can run without us." },
  { q: "Who do you work best with?", a: "Businesses that are past the idea stage but have not yet formalised how they operate." },
  { q: "Will you manage everything for us?", a: "No. We build the systems, support the execution, and document the processes — but you remain the operator." },
  { q: "What happens after the project is complete?", a: "Every engagement ends with a handover. You receive all assets, documentation, and access." },
  { q: "Is this suitable for early stage businesses?", a: "Yes. If you are generating any form of revenue and operating without systems, there is value to be unlocked immediately." },
];

export default function Company() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  return (
    <>
      <Seo title="About Capacitiq — Our Philosophy and Approach" description="Capacitiq Solutions (Pty) Ltd is a B-BBEE Level 1 registered business support agency operating remotely across South Africa." path="/company" />
      <section className="px-4 sm:px-6 pt-10 pb-12">
        <div className="max-w-4xl mx-auto">
          <p className="text-xs uppercase tracking-widest text-muted">Company</p>
          <h1 className="font-display font-bold text-4xl sm:text-5xl mt-2">Build a business that operates with clarity and structure.</h1>
          <p className="mt-4 text-lg">Capacitiq Solutions (Pty) Ltd, trading as Capacitiq. Registered in South Africa. B-BBEE Level 1 Contributor. Registration No. 2026/344156/07.</p>
        </div>
      </section>

      <section className="px-4 sm:px-6 py-12">
        <div className="max-w-7xl mx-auto grid md:grid-cols-3 gap-6">
          {[
            ["Who We Work With", "We work with businesses that are actively growing. Our clients are usually past the idea stage, but struggling with systems, consistency, or direction."],
            ["What We Combine", "We combine strategy and execution support. From consulting to design to operational assistance, we help your business not just plan, but implement."],
            ["How We Operate", "We integrate into your systems and improve how things function internally. We prioritise clarity, structure, and scalability."],
          ].map(([t, b]) => (
            <div key={t} className="neu-raised rounded-3xl p-6">
              <h3 className="font-display font-bold text-lg">{t}</h3>
              <p className="text-sm text-muted mt-3">{b}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="px-4 sm:px-6 py-16">
        <div className="max-w-4xl mx-auto">
          <h2 className="font-display font-bold text-3xl">Our Philosophy</h2>
          <p className="text-sm text-muted mt-2">What drives how we think and operate.</p>
          <div className="mt-6 space-y-4 text-[#0b4650]">
            <p>Capacitiq operates on a straightforward premise: businesses fail not because of lack of ideas, but because of lack of structure, clarity, and execution systems. We believe that growth without operational alignment creates instability, not success.</p>
            <p>Our work is grounded in creating clarity where there is confusion, consistency where there is inconsistency, and functional structure where businesses are operating on intuition rather than process.</p>
            <p>We do not see ourselves as traditional service providers, but as builders of internal capability that allows businesses to operate, communicate, and scale with intention rather than chaos.</p>
          </div>
          <div className="mt-10 grid md:grid-cols-2 gap-6">
            <div className="neu-raised rounded-3xl p-6">
              <h3 className="font-display font-bold text-lg">Vision</h3>
              <p className="text-sm mt-3">To become a leading business systems and execution partner for startups and SMEs across South Africa.</p>
            </div>
            <div className="neu-raised rounded-3xl p-6">
              <h3 className="font-display font-bold text-lg">Mission</h3>
              <p className="text-sm mt-3">To help businesses grow through clarity, structure, and execution support by combining strategy, systems, and service delivery.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 sm:px-6 py-16">
        <div className="max-w-7xl mx-auto">
          <h2 className="font-display font-bold text-3xl">How We Work</h2>
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {[
              ["Understand", "We begin by understanding how your business currently operates."],
              ["Define", "We define a focused approach that aligns operations with your growth stage."],
              ["Implement", "We support the execution of systems, processes, and assets."],
              ["Integrate", "We integrate into your workflow where necessary."],
              ["Outcome", "A business that operates with structure and executes with consistency."],
            ].map(([t, b], i, a) => (
              <div key={t} className="relative neu-raised rounded-3xl p-5">
                <span className="text-xs text-muted font-display">Step {i + 1}</span>
                <h3 className="font-display font-bold text-base mt-1">{t}</h3>
                <p className="text-xs text-muted mt-2">{b}</p>
                {i < a.length - 1 && <ChevronRight className="hidden lg:block absolute -right-3 top-1/2 -translate-y-1/2" color="#0b4650" size={18} />}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 sm:px-6 py-16">
        <div className="max-w-3xl mx-auto">
          <h2 className="font-display font-bold text-3xl">Company FAQ</h2>
          <div className="mt-6 space-y-3">
            {FAQ.map((f, i) => (
              <div key={i} className="neu-raised-sm rounded-2xl">
                <button onClick={() => setOpenFaq(openFaq === i ? null : i)} className="w-full text-left p-5 flex items-center justify-between gap-4">
                  <span className="font-display font-bold text-sm">{f.q}</span>
                  <ChevronDown size={18} color="#0b4650" className={`shrink-0 transition-transform ${openFaq === i ? "rotate-180" : ""}`} />
                </button>
                {openFaq === i && <div className="px-5 pb-5 text-sm text-muted">{f.a}</div>}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 sm:px-6 py-16">
        <div className="neu-raised max-w-4xl mx-auto rounded-3xl p-10 text-center">
          <h2 className="font-display font-bold text-3xl">Registered, compliant, and verified.</h2>
          <p className="mt-4 max-w-2xl mx-auto">Capacitiq Solutions (Pty) Ltd is a registered private company in South Africa and a verified B-BBEE Level 1 Contributor.</p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <span className="neu-raised-sm rounded-full px-5 py-2 text-sm font-display font-bold">B-BBEE Level 1 Contributor</span>
            <span className="neu-raised-sm rounded-full px-5 py-2 text-sm font-display font-bold">Registration No. 2026/344156/07</span>
          </div>
          <Link to="/contact" className="btn-cta mt-8 inline-flex">Work With Us</Link>
        </div>
      </section>
    </>
  );
}