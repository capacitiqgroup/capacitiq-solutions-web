import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
    dataLayer?: any[];
  }
}

const STORAGE_KEY = "capacitiq_cookie_consent";

export function applyStoredConsent() {
  if (typeof window === "undefined") return;
  const consent = localStorage.getItem(STORAGE_KEY);
  if (consent === "all" && typeof window.gtag === "function") {
    window.gtag("consent", "update", { analytics_storage: "granted" });
  }
}

export function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem(STORAGE_KEY);
    if (!consent) setVisible(true);
    else applyStoredConsent();
  }, []);

  function acceptAll() {
    localStorage.setItem(STORAGE_KEY, "all");
    if (typeof window.gtag === "function") {
      window.gtag("consent", "update", { analytics_storage: "granted" });
    }
    setVisible(false);
  }

  function essentialOnly() {
    localStorage.setItem(STORAGE_KEY, "essential");
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-label="Cookie consent"
      style={{
        position: "fixed",
        left: 0,
        right: 0,
        bottom: 0,
        background: "#0b4650",
        color: "#ffffff",
        padding: "20px 32px",
        zIndex: 9999,
      }}
    >
      <div className="max-w-7xl mx-auto grid gap-6 lg:grid-cols-[1fr_auto] items-center">
        <div>
          <p style={{ fontFamily: "Ubuntu, system-ui, sans-serif", fontWeight: 700, fontSize: 16, margin: 0 }}>
            We use cookies on this website.
          </p>
          <p style={{ fontFamily: "Inter, system-ui, sans-serif", fontSize: 14, opacity: 0.85, margin: "6px 0 0" }}>
            We use essential cookies to keep the website working properly and optional cookies for analytics and performance tracking. You can choose what you accept.
          </p>
          <p style={{ margin: "10px 0 0", display: "flex", gap: 16, flexWrap: "wrap" }}>
            <Link to="/cookie-policy" style={{ color: "#ffffff", textDecoration: "underline", fontSize: 12 }}>Cookie Policy</Link>
            <Link to="/privacy-policy" style={{ color: "#ffffff", textDecoration: "underline", fontSize: 12 }}>Privacy Policy</Link>
          </p>
          <div style={{ marginTop: 12, display: "flex", gap: 8, flexWrap: "wrap" }}>
            <span style={{ background: "rgba(255,255,255,0.12)", color: "#ffffff", padding: "4px 10px", borderRadius: 999, fontSize: 11 }}>
              Essential cookies: Keep the website working — login, cart, forms. Always active.
            </span>
            <span style={{ background: "rgba(255,255,255,0.12)", color: "#ffffff", padding: "4px 10px", borderRadius: 999, fontSize: 11 }}>
              Optional cookies: Google Analytics for visitor statistics. Helps us improve the site.
            </span>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 lg:flex-row">
          <button
            onClick={acceptAll}
            style={{
              background: "#e6ff2b",
              color: "#0b4650",
              fontFamily: "Ubuntu, system-ui, sans-serif",
              fontWeight: 700,
              textTransform: "uppercase",
              borderRadius: 50,
              padding: "12px 24px",
              border: "none",
              cursor: "pointer",
              letterSpacing: "0.04em",
              fontSize: 13,
            }}
          >
            Accept All Cookies
          </button>
          <button
            onClick={essentialOnly}
            style={{
              background: "transparent",
              color: "#ffffff",
              fontFamily: "Ubuntu, system-ui, sans-serif",
              fontWeight: 700,
              textTransform: "uppercase",
              borderRadius: 50,
              padding: "12px 24px",
              border: "1px solid rgba(255,255,255,0.4)",
              cursor: "pointer",
              letterSpacing: "0.04em",
              fontSize: 13,
            }}
          >
            Essential Only
          </button>
        </div>
      </div>
    </div>
  );
}

export function resetCookieConsent() {
  localStorage.removeItem(STORAGE_KEY);
  window.location.reload();
}
