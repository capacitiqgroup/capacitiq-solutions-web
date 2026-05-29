import { useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { Menu, X, ShoppingCart } from "lucide-react";
import { NAV } from "@/lib/site";
import { LogoMark } from "./LogoMark";
import { useCart } from "@/lib/cart";

export function Navbar() {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const count = useCart((s) => s.items.length);

  useEffect(() => { setOpen(false); }, [location.pathname]);
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  const CartBtn = (
    <Link to="/templates/cart" aria-label="View cart" className="relative neu-raised-sm w-11 h-11 rounded-2xl inline-flex items-center justify-center">
      <ShoppingCart size={20} color="#0b4650" />
      {count > 0 && (
        <span className="absolute -top-1 -right-1 min-w-[20px] h-5 px-1 rounded-full text-[11px] font-display font-bold inline-flex items-center justify-center" style={{ backgroundColor: "#e6ff2b", color: "#0b4650" }}>{count}</span>
      )}
    </Link>
  );

  return (
    <header className="sticky top-4 z-40 px-4 sm:px-6">
      <div className="neu-raised mx-auto max-w-7xl rounded-full px-4 sm:px-6 py-3 flex items-center justify-between">
        <LogoMark />
        <nav className="hidden lg:flex items-center gap-6 xl:gap-8">
          {NAV.map((item) => (
            <NavLink key={item.to} to={item.to} end={item.to === "/"} className="relative font-display text-sm text-[#0b4650] py-2">
              {({ isActive }) => (
                <>
                  {item.label}
                  {isActive && <span className="absolute left-1/2 -translate-x-1/2 -bottom-1 w-1.5 h-1.5 rounded-full" style={{ backgroundColor: "#e6ff2b" }} />}
                </>
              )}
            </NavLink>
          ))}
        </nav>
        <div className="hidden lg:flex items-center gap-4">
          <Link to="/careers" className="text-sm text-[#0b4650]">Spotter Program</Link>
          {CartBtn}
          <Link to="/contact" className="btn-cta !py-2.5 !px-5">Work With Us</Link>
        </div>
        <div className="lg:hidden flex items-center gap-2">
          {CartBtn}
          <button onClick={() => setOpen(true)} className="neu-raised-sm w-11 h-11 rounded-2xl inline-flex items-center justify-center" aria-label="Open menu">
            <Menu size={22} color="#0b4650" />
          </button>
        </div>
      </div>

      {open && (
        <div className="lg:hidden fixed inset-0 z-50" onClick={() => setOpen(false)}>
          <div className="absolute inset-0 bg-black/30" />
          <div className="absolute top-0 left-0 right-0 neu-raised m-4 rounded-3xl p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <LogoMark />
              <button onClick={() => setOpen(false)} className="neu-raised-sm w-11 h-11 rounded-2xl inline-flex items-center justify-center" aria-label="Close menu">
                <X size={22} color="#0b4650" />
              </button>
            </div>
            <div className="flex flex-col gap-3">
              {NAV.map((item) => (
                <NavLink key={item.to} to={item.to} end={item.to === "/"} className="neu-raised-sm rounded-2xl px-5 py-4 font-display text-base text-[#0b4650] flex items-center gap-3">
                  {({ isActive }) => (
                    <>
                      {isActive && <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: "#e6ff2b" }} />}
                      {item.label}
                    </>
                  )}
                </NavLink>
              ))}
              <Link to="/careers" className="neu-raised-sm rounded-2xl px-5 py-4 font-display text-base text-[#0b4650]">Spotter Program</Link>
              <Link to="/contact" className="btn-cta w-full mt-2">Work With Us</Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
