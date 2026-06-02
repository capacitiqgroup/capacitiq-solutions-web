import { Link } from "react-router-dom";
import { Mail, Phone, Linkedin, Instagram } from "lucide-react";
import { LogoMark } from "./LogoMark";
import { CONTACT } from "@/lib/site";

function TikTokIcon({ size = 20 }: { size?: number }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" width={size} height={size}>
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.78 1.52V6.76a4.85 4.85 0 0 1-1.01-.07z"/>
    </svg>
  );
}

function SocialBtn({ children, href }: { children: React.ReactNode; href: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="neu-raised-sm w-11 h-11 rounded-2xl inline-flex items-center justify-center text-[#0b4650]"
      aria-label="Social link"
    >
      {children}
    </a>
  );
}

export function Footer() {
  return (
    <footer className="px-4 sm:px-6 pb-8 pt-16">
      <div className="neu-raised max-w-7xl mx-auto rounded-3xl p-8 lg:p-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8">
          <div className="lg:col-span-2">
            <LogoMark />
            <p className="mt-4 text-sm text-muted max-w-xs">
              Build a business that operates with clarity and structure.
            </p>
          </div>
          <div>
            <h4 className="font-display text-sm uppercase tracking-wider mb-4">Connect With Us</h4>
            <div className="flex flex-col gap-3">
              <a href={`mailto:${CONTACT.email}`} className="neu-raised-sm rounded-full px-4 py-2.5 inline-flex items-center gap-2 text-sm">
                <Mail size={16} /> {CONTACT.email}
              </a>
              <a href={`tel:${CONTACT.phone}`} className="neu-raised-sm rounded-full px-4 py-2.5 inline-flex items-center gap-2 text-sm">
                <Phone size={16} /> {CONTACT.phone}
              </a>
            </div>
          </div>
          <div>
            <h4 className="font-display text-sm uppercase tracking-wider mb-4">Our Links</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/">Home</Link></li>
              <li><Link to="/company">About Us</Link></li>
              <li><Link to="/services">Services</Link></li>
              <li><Link to="/templates">Templates Shop</Link></li>
              <li><Link to="/portfolio">Portfolio</Link></li>
              <li><Link to="/careers">Careers</Link></li>
              <li><Link to="/blog">Blog</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-display text-sm uppercase tracking-wider mb-4">Legal &amp; More</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/privacy-policy">Privacy Policy</Link></li>
              <li><Link to="/terms-of-service">Terms of Service</Link></li>
              <li><Link to="/template-policy">Template Licence</Link></li>
              <li><Link to="/refund-policy">Refund Policy</Link></li>
              <li><Link to="/cookie-policy">Cookie Policy</Link></li>
              <li><Link to="/spotter-policy">Spotter Policy</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-8 border-t border-[#c5cdd4] flex flex-col items-center gap-6">
          <div>
            <h4 className="font-display text-sm uppercase tracking-wider mb-4 text-center">Follow Us</h4>
            <div className="flex items-center gap-3">
              <SocialBtn href="https://www.linkedin.com/company/capacitiq"><Linkedin size={20} /></SocialBtn>
              <SocialBtn href="https://www.instagram.com/capacitiq_za"><Instagram size={20} /></SocialBtn>
              <SocialBtn href="https://www.tiktok.com/@capacitiq"><TikTokIcon size={20} /></SocialBtn>
            </div>
          </div>
          <Link to="/contact" className="btn-cta">Get a Free Consultation</Link>
          <div style={{ display: "flex", gap: "16px", alignItems: "center", flexWrap: "wrap" }}>
            <a href="https://share.google/YeIYI2CfeNwysKbhx" target="_blank" rel="noopener noreferrer" style={{ display: "inline-block", textDecoration: "none", border: "none" }}>
              <img src="https://res.cloudinary.com/dewvhnks3/image/upload/v1780299742/download_mm2adq.png" alt="Review us on Google Business Profile" style={{ height: "32px", width: "auto", display: "block", border: "0" }} />
            </a>
            <a href="https://www.hellopeter.com/capacitiq" target="_blank" rel="noopener noreferrer" style={{ display: "inline-block", textDecoration: "none", border: "none" }}>
              <img src="https://res.cloudinary.com/dewvhnks3/image/upload/v1780299684/hellopeter_logo_l48gln.jpg" alt="Review us on HelloPeter" style={{ height: "32px", width: "auto", display: "block", border: "0" }} />
            </a>
          </div>
          <p className="text-xs text-muted text-center">© 2026 Capacitiq Solutions (Pty) Ltd</p>
          <button
            onClick={() => { localStorage.removeItem("capacitiq_cookie_consent"); window.location.reload(); }}
            className="text-xs underline text-[#4a6670]"
          >
            Cookie Settings
          </button>
        </div>
      </div>
    </footer>
  );
}