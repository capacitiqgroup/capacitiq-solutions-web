import { useEffect, useState } from "react";
import { Seo } from "@/lib/seo";

export default function ThankYou() {
  const [reference, setReference] = useState("");
  const [email, setEmail] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const ref = params.get("reference") || params.get("trxref") || "";
    const em = params.get("email") || params.get("customer_email") || "";
    if (ref) setReference(ref);
    if (em && em.includes("@")) setEmail(em);
  }, []);

  return (
    <>
      <Seo title="Payment Successful | Capacitiq" description="Thank you for your purchase. Your Canva template link has been emailed to you." path="/templates/thank-you" />
      <div style={{ minHeight: "60vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "48px 24px" }}>
        <div
          style={{
            maxWidth: "560px",
            width: "100%",
            background: "#e8edf0",
            borderRadius: "20px",
            boxShadow: "8px 8px 16px #c5cdd4, -8px -8px 16px #ffffff",
            padding: "48px 40px",
            textAlign: "center",
          }}
        >
          <div
            style={{
              width: "80px",
              height: "80px",
              background: "#e6ff2b",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 24px",
              boxShadow: "6px 6px 12px #c5cdd4, -6px -6px 12px #ffffff",
            }}
          >
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#0b4650" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>

          <h1 style={{ fontFamily: "Ubuntu, sans-serif", fontWeight: 700, color: "#0b4650", fontSize: "28px", margin: "0 0 12px" }}>
            Payment Successful.
          </h1>

          <p style={{ fontFamily: "Inter, sans-serif", color: "#4a6670", fontSize: "16px", lineHeight: 1.6, margin: "0 0 8px" }}>
            Thank you for your purchase. Paystack has sent your download link and receipt to your email address.
          </p>

          <p style={{ fontFamily: "Inter, sans-serif", color: "#4a6670", fontSize: "15px", lineHeight: 1.6, margin: "0 0 24px" }}>
            Check your inbox and spam folder. Your Canva template link will also arrive separately from noreply@capacitiq.co.za within a few minutes.
          </p>

          {reference && (
            <p style={{ fontFamily: "Inter, sans-serif", color: "#4a6670", fontSize: "13px", margin: "0 0 24px" }}>
              Order reference: <strong style={{ color: "#0b4650" }}>{reference}</strong>
            </p>
          )}

          {email && (
            <p style={{ fontFamily: "Inter, sans-serif", color: "#4a6670", fontSize: "13px", margin: "0 0 32px" }}>
              Confirmation sent to: <strong style={{ color: "#0b4650" }}>{email}</strong>
            </p>
          )}

          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <a
              href="/templates"
              style={{
                display: "block",
                background: "#e6ff2b",
                color: "#0b4650",
                fontFamily: "Ubuntu, sans-serif",
                fontWeight: 700,
                fontSize: "14px",
                textDecoration: "none",
                padding: "14px 32px",
                borderRadius: "50px",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                boxShadow: "6px 6px 12px #c5cdd4, -6px -6px 12px #ffffff",
              }}
            >
              Browse More Templates
            </a>

            <a
              href="/"
              style={{
                display: "block",
                fontFamily: "Inter, sans-serif",
                color: "#4a6670",
                fontSize: "14px",
                textDecoration: "none",
                padding: "10px",
              }}
            >
              Return to Home
            </a>
          </div>

          <div
            style={{
              marginTop: "32px",
              padding: "16px",
              background: "#f5f7f8",
              borderRadius: "12px",
              borderLeft: "4px solid #e6ff2b",
            }}
          >
            <p style={{ fontFamily: "Inter, sans-serif", fontSize: "13px", color: "#4a6670", margin: 0 }}>
              Did not receive your email? Contact us at{" "}
              <a href="mailto:hello@capacitiq.co.za" style={{ color: "#0b4650" }}>hello@capacitiq.co.za</a>
              {" "}or{" "}
              <a href="https://wa.me/27640620354" style={{ color: "#0b4650" }}>WhatsApp 064 062 0354</a>
              {" "}with your order reference and we will send your template manually.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
