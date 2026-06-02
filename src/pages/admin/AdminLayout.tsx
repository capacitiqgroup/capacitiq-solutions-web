import { useEffect, useState } from "react";
import { Navigate, NavLink, Outlet, useNavigate } from "react-router-dom";
import { FileText, Layout as LayoutIcon, Briefcase, Star, LogOut, Menu, X, ShoppingBag, ShoppingCart } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const NAV = [
  { to: "/admin/blog", label: "Blog Posts", icon: FileText },
  { to: "/admin/templates", label: "Templates", icon: LayoutIcon },
  { to: "/admin/portfolio", label: "Portfolio", icon: Briefcase },
  { to: "/admin/orders", label: "Orders", icon: ShoppingBag },
  { to: "/admin/abandoned-carts", label: "Abandoned Carts", icon: ShoppingCart },
  { to: "/admin/reviews", label: "Reviews", icon: Star },
];

export default function AdminLayout() {
  const [checking, setChecking] = useState(true);
  const [ok, setOk] = useState(false);
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;
    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      setOk(!!data.session);
      setChecking(false);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => {
      setOk(!!s);
    });
    return () => { mounted = false; sub.subscription.unsubscribe(); };
  }, []);

  if (checking) return <section className="px-6 py-20" />;
  if (!ok) return <Navigate to="/admin/login" replace />;

  async function signOut() {
    await supabase.auth.signOut();
    navigate("/admin/login");
  }

  return (
    <div className="min-h-screen" style={{ background: "#e8edf0" }}>
      <header className="lg:hidden px-4 py-3 flex items-center justify-between">
        <span className="font-display font-bold" style={{ color: "#0b4650" }}>Admin</span>
        <button className="neu-raised-sm rounded-xl p-2" onClick={() => setOpen(!open)}>
          {open ? <X size={18} /> : <Menu size={18} />}
        </button>
      </header>
      <div className="flex">
        <aside className={`${open ? "block" : "hidden"} lg:block w-full lg:w-64 lg:min-h-screen p-4`}>
          <div className="neu-raised rounded-3xl p-4 lg:sticky lg:top-4">
            <p className="font-display font-bold mb-4" style={{ color: "#0b4650" }}>Capacitiq Admin</p>
            <nav className="space-y-1">
              {NAV.map((n) => (
                <NavLink
                  key={n.to}
                  to={n.to}
                  onClick={() => setOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-display ${isActive ? "neu-inset" : "hover:bg-[#dde3e8]"}`
                  }
                  style={{ color: "#0b4650" }}
                >
                  <n.icon size={16} /> {n.label}
                </NavLink>
              ))}
            </nav>
            <button onClick={signOut} className="mt-6 flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-display w-full hover:bg-[#dde3e8]" style={{ color: "#0b4650" }}>
              <LogOut size={16} /> Sign Out
            </button>
          </div>
        </aside>
        <main className="flex-1 p-4 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
