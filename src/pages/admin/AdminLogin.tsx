import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

const ALLOWED = ["admin@capacitiq.co.za", "rmolapisi@capacitiq.co.za"];

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const nav = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) nav("/admin/templates");
    });
  }, [nav]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!ALLOWED.includes(email.toLowerCase().trim())) {
      setError("This email is not authorised for admin access.");
      return;
    }
    setLoading(true);
    const { error: err } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (err) { setError(err.message); return; }
    nav("/admin/templates");
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: "#e8edf0" }}>
      <div className="neu-raised rounded-3xl p-8 w-full max-w-md">
        <p className="text-xs uppercase tracking-widest" style={{ color: "#4a6670" }}>Capacitiq Solutions</p>
        <h2 className="font-display font-bold text-2xl mt-2" style={{ color: "#0b4650" }}>Admin Access</h2>
        <form onSubmit={submit} className="mt-6 space-y-3">
          <div>
            <label className="font-display text-sm block mb-2" style={{ color: "#0b4650" }}>Email</label>
            <input type="email" required className="neu-inset w-full p-3 text-sm" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div>
            <label className="font-display text-sm block mb-2" style={{ color: "#0b4650" }}>Password</label>
            <input type="password" required className="neu-inset w-full p-3 text-sm" value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          {error && <p className="text-sm" style={{ color: "#b00020" }}>{error}</p>}
          <button className="btn-cta w-full" disabled={loading}>{loading ? "Signing in..." : "Sign In"}</button>
        </form>
      </div>
    </div>
  );
}
