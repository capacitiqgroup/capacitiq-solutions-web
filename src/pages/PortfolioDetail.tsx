import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Seo } from "@/lib/seo";
import { supabase } from "@/integrations/supabase/client";

type Item = {
  id: string; title: string; subtitle: string | null; category: string | null;
  hero_image: string | null; excerpt: string | null;
  gallery_images: string[] | null;
  sections: { heading?: string; body?: string }[] | null;
};

function PortfolioGallery({ heroImage, galleryImages, title }: { heroImage: string | null; galleryImages: string[]; title: string }) {
  const allImages = [heroImage, ...(galleryImages || [])].filter(Boolean) as string[];
  const [currentIndex, setCurrentIndex] = useState(0);
  if (allImages.length === 0) return null;
  const goNext = () => setCurrentIndex((p) => (p + 1) % allImages.length);
  const goPrev = () => setCurrentIndex((p) => (p - 1 + allImages.length) % allImages.length);

  return (
    <div style={{ position: "relative", width: "100%", marginBottom: "32px" }}>
      <div className="img-16x9 rounded-neu" style={{ position: "relative" }}>
        <img src={allImages[currentIndex]} alt={`${title} — image ${currentIndex + 1} of ${allImages.length}`} style={{ transition: "opacity 0.3s ease" }} />
        {allImages.length > 1 && (
          <>
            <button onClick={goPrev} aria-label="Previous image" style={{ position: "absolute", left: "16px", top: "50%", transform: "translateY(-50%)", background: "rgba(232, 237, 240, 0.92)", border: "none", borderRadius: "50%", width: "44px", height: "44px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", boxShadow: "4px 4px 8px #c5cdd4, -4px -4px 8px #ffffff", zIndex: 2 }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0b4650" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>
            </button>
            <button onClick={goNext} aria-label="Next image" style={{ position: "absolute", right: "16px", top: "50%", transform: "translateY(-50%)", background: "rgba(232, 237, 240, 0.92)", border: "none", borderRadius: "50%", width: "44px", height: "44px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", boxShadow: "4px 4px 8px #c5cdd4, -4px -4px 8px #ffffff", zIndex: 2 }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0b4650" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6" /></svg>
            </button>
          </>
        )}
      </div>
      {allImages.length > 1 && (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", marginTop: "12px" }}>
          {allImages.map((_, index) => (
            <button key={index} onClick={() => setCurrentIndex(index)} aria-label={`Go to image ${index + 1}`} style={{ width: index === currentIndex ? "24px" : "8px", height: "8px", borderRadius: "50px", background: index === currentIndex ? "#0b4650" : "#c5cdd4", border: "none", cursor: "pointer", padding: 0, transition: "all 0.2s ease" }} />
          ))}
          <span style={{ fontFamily: "Inter, sans-serif", fontSize: "12px", color: "#4a6670", marginLeft: "8px" }}>{currentIndex + 1} / {allImages.length}</span>
        </div>
      )}
      {allImages.length >= 3 && (
        <div style={{ display: "flex", gap: "8px", marginTop: "12px", overflowX: "auto", paddingBottom: "4px" }}>
          {allImages.map((img, index) => (
            <button key={index} onClick={() => setCurrentIndex(index)} aria-label={`View image ${index + 1}`} style={{ flexShrink: 0, width: "80px", height: "45px", borderRadius: "8px", overflow: "hidden", border: index === currentIndex ? "2px solid #0b4650" : "2px solid transparent", padding: 0, cursor: "pointer", background: "#e8edf0", boxShadow: index === currentIndex ? "0 0 0 2px #e6ff2b" : "none", transition: "all 0.2s ease" }}>
              <img src={img} alt={`Thumbnail ${index + 1}`} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function PortfolioDetail() {
  const { portfolioId } = useParams<{ portfolioId: string }>();
  const [item, setItem] = useState<Item | null>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!portfolioId) return;
    supabase.from("portfolio_items").select("id, title, subtitle, category, excerpt, hero_image, gallery_images, sections, tags, status").eq("id", portfolioId).eq("status", "published").maybeSingle()
      .then(({ data }) => { if (!data) setNotFound(true); else setItem(data as any); });
  }, [portfolioId]);

  if (notFound) {
    return (
      <section className="px-4 sm:px-6 py-20 text-center">
        <p className="text-muted">Project not found.</p>
        <Link to="/portfolio" className="btn-cta mt-4 inline-flex">Back to Portfolio</Link>
      </section>
    );
  }
  if (!item) return <section className="px-4 sm:px-6 py-20" />;

  return (
    <>
      <Seo title={`${item.title} | Capacitiq Portfolio`} description={item.excerpt || item.title} path={`/portfolio/${item.id}`} />
      <article className="px-4 sm:px-6 pt-10 pb-20">
        <div className="max-w-4xl mx-auto">
          <Link to="/portfolio" className="inline-flex items-center gap-1 text-sm text-[#4a6670] hover:text-[#0b4650] mb-6"><ArrowLeft size={14} /> Back to Portfolio</Link>
          <PortfolioGallery heroImage={item.hero_image} galleryImages={(item.gallery_images as string[]) || []} title={item.title} />
          {item.category && (
            <span className="mt-2 inline-block rounded-full px-3 py-1 text-xs font-display font-bold" style={{ backgroundColor: "#e6ff2b", color: "#0b4650" }}>{item.category}</span>
          )}
          <h1 className="font-display font-bold text-4xl sm:text-5xl mt-4" style={{ color: "#0b4650" }}>{item.title}</h1>
          {item.subtitle && <p className="italic mt-3 text-lg" style={{ color: "#4a6670" }}>{item.subtitle}</p>}
          <hr className="my-8 border-t-2" style={{ borderColor: "#0b4650", maxWidth: 80 }} />
          {(item.sections || []).map((s, i) => (
            <div key={i} className="mb-12">
              {s.heading && <h2 className="font-display font-bold text-2xl mb-3" style={{ color: "#0b4650" }}>{s.heading}</h2>}
              {s.body && <p style={{ color: "#4a6670", lineHeight: 1.8 }}>{s.body}</p>}
            </div>
          ))}
          <div className="neu-raised rounded-3xl p-8 mt-12 text-center">
            <p className="font-display font-bold text-xl" style={{ color: "#0b4650" }}>Interested in working with us?</p>
            <Link to="/contact" className="btn-cta mt-4 inline-flex">Get In Touch</Link>
          </div>
        </div>
      </article>
    </>
  );
}
