import { useEffect, useState } from "react";
import { Seo } from "@/lib/seo";
import { supabase } from "@/integrations/supabase/client";
import { LEGAL_PAGES } from "./legal-content";

export default function LegalPage({ slug }: { slug: string }) {
  const doc = LEGAL_PAGES.find((p) => p.slug === slug)!;
  const [override, setOverride] = useState<string | null>(null);

  useEffect(() => {
    supabase
      .from("legal_pages")
      .select("content")
      .eq("slug", slug)
      .maybeSingle()
      .then(({ data }) => {
        if (data?.content) setOverride(data.content);
      });
  }, [slug]);

  return (
    <>
      <Seo title={doc.seoTitle} description={doc.seoDescription} path={`/${slug}`} />
      <section className="px-4 sm:px-6 py-16">
        <div className="neu-raised max-w-3xl mx-auto rounded-3xl p-8 lg:p-12">
          <p className="text-xs uppercase tracking-widest text-muted mb-2">Legal</p>
          <h1 className="font-display font-bold text-3xl sm:text-4xl">{doc.title}</h1>
          <p className="text-sm text-muted mt-2">Effective Date: {doc.effectiveDate}</p>
          {override ? (
            <div className="mt-8 prose prose-sm max-w-none whitespace-pre-wrap text-[#0b4650]">{override}</div>
          ) : (
            <div className="mt-8 space-y-6">
              {doc.sections.map((s) => (
                <div key={s.heading}>
                  <h2 className="font-display font-bold text-lg">{s.heading}</h2>
                  <p className="text-sm leading-relaxed mt-2 text-[#0b4650]">{s.body}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}