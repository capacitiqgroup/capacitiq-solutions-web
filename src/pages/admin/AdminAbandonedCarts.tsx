import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ShoppingCart, Trash2, ChevronDown } from "lucide-react";

type CartItem = {
  id?: string;
  name?: string;
  preview_image?: string | null;
  launch_price?: number | null;
  price?: number | null;
  discount_payment_link?: string | null;
};
type Row = {
  id: string;
  customer_name: string | null;
  customer_email: string;
  cart_items: CartItem[];
  email_sent: boolean;
  email_sent_at: string | null;
  created_at: string;
  updated_at: string;
};

function formatSAST(iso: string | null) {
  if (!iso) return "—";
  const d = new Date(iso);
  return d.toLocaleString("en-ZA", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit", timeZone: "Africa/Johannesburg" });
}

function cartTotal(items: CartItem[]) {
  return (items || []).reduce((s, i) => s + (Number(i.launch_price ?? i.price ?? 0) || 0), 0);
}

export default function AdminAbandonedCarts() {
  const [rows, setRows] = useState<Row[]>([]);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const { data } = await supabase.from("abandoned_carts").select("*").order("updated_at", { ascending: false });
    setRows((data as any) || []);
    setLoading(false);
  }
  useEffect(() => { load(); }, []);

  async function del(id: string) {
    if (!confirm("Delete this abandoned cart?")) return;
    await supabase.from("abandoned_carts").delete().eq("id", id);
    load();
  }

  const total = rows.length;
  const sent = rows.filter((r) => r.email_sent).length;
  const pending = total - sent;

  return (
    <div>
      <h1 className="font-display font-bold text-2xl mb-6" style={{ color: "#0b4650" }}>Abandoned Carts</h1>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {[
          { label: "Total Abandoned", value: total },
          { label: "Emails Sent", value: sent },
          { label: "Pending", value: pending },
        ].map((s) => (
          <div key={s.label} className="neu-raised rounded-3xl p-6">
            <p className="text-xs uppercase tracking-widest" style={{ color: "#4a6670" }}>{s.label}</p>
            <p className="font-display font-bold text-3xl mt-2" style={{ color: "#0b4650" }}>{s.value}</p>
          </div>
        ))}
      </div>

      {loading ? null : rows.length === 0 ? (
        <div className="neu-raised rounded-3xl p-10 text-center max-w-xl mx-auto">
          <ShoppingCart size={48} color="#4a6670" className="mx-auto" />
          <h3 className="font-display font-bold text-xl mt-4" style={{ color: "#0b4650" }}>No abandoned carts yet.</h3>
          <p className="text-sm mt-2" style={{ color: "#4a6670" }}>Cart data will appear here when customers add items and do not complete checkout.</p>
        </div>
      ) : (
        <div className="neu-raised rounded-3xl p-2 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr>
                <th className="text-left p-3 font-display text-xs uppercase" style={{ color: "#4a6670" }}>Date</th>
                <th className="text-left p-3 font-display text-xs uppercase" style={{ color: "#4a6670" }}>Customer</th>
                <th className="text-left p-3 font-display text-xs uppercase" style={{ color: "#4a6670" }}>Email</th>
                <th className="text-left p-3 font-display text-xs uppercase" style={{ color: "#4a6670" }}>Templates</th>
                <th className="text-left p-3 font-display text-xs uppercase" style={{ color: "#4a6670" }}>Total</th>
                <th className="text-left p-3 font-display text-xs uppercase" style={{ color: "#4a6670" }}>Status</th>
                <th className="text-left p-3 font-display text-xs uppercase" style={{ color: "#4a6670" }}>Sent</th>
                <th className="p-3"></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => {
                const isOpen = expanded === r.id;
                const total = cartTotal(r.cart_items || []);
                return (
                  <>
                    <tr key={r.id} className="border-t border-[#c5cdd4] cursor-pointer hover:bg-[#dde3e8]" onClick={() => setExpanded(isOpen ? null : r.id)}>
                      <td className="p-3" style={{ color: "#0b4650" }}>{formatSAST(r.updated_at)}</td>
                      <td className="p-3" style={{ color: "#0b4650" }}>{r.customer_name || "—"}</td>
                      <td className="p-3"><a href={`mailto:${r.customer_email}`} onClick={(e) => e.stopPropagation()} style={{ color: "#0b4650", textDecoration: "underline" }}>{r.customer_email}</a></td>
                      <td className="p-3" style={{ color: "#0b4650" }}>{(r.cart_items || []).map((i) => i.name).filter(Boolean).join(", ") || "—"}</td>
                      <td className="p-3" style={{ color: "#0b4650" }}>{total === 0 ? "FREE" : `R${Math.round(total / 100).toLocaleString("en-ZA")}`}</td>
                      <td className="p-3">
                        <span className="rounded-full px-2.5 py-1 text-xs font-display font-bold" style={{ backgroundColor: r.email_sent ? "#bbf7d0" : "#fde68a", color: "#0b4650" }}>
                          {r.email_sent ? "Sent" : "Pending"}
                        </span>
                      </td>
                      <td className="p-3" style={{ color: "#4a6670" }}>{r.email_sent_at ? formatSAST(r.email_sent_at) : "—"}</td>
                      <td className="p-3 flex items-center gap-1">
                        <ChevronDown size={14} style={{ transform: isOpen ? "rotate(180deg)" : "none", transition: "transform 0.15s" }} />
                        <button onClick={(e) => { e.stopPropagation(); del(r.id); }} className="p-2" aria-label="Delete"><Trash2 size={14} color="#dc2626" /></button>
                      </td>
                    </tr>
                    {isOpen && (
                      <tr className="border-t border-[#c5cdd4]" style={{ background: "#f0f3f6" }}>
                        <td colSpan={8} className="p-4">
                          <div className="space-y-3">
                            {(r.cart_items || []).map((it, idx) => {
                              const price = Number(it.launch_price ?? it.price ?? 0) || 0;
                              return (
                                <div key={idx} className="flex items-center gap-3">
                                  {it.preview_image ? (
                                    <img src={it.preview_image} alt={it.name || ""} style={{ width: 32, height: 32, objectFit: "cover", borderRadius: 6 }} />
                                  ) : (
                                    <div style={{ width: 32, height: 32, background: "#cfe0e3", borderRadius: 6 }} />
                                  )}
                                  <div className="flex-1">
                                    <p className="text-sm font-display font-bold" style={{ color: "#0b4650" }}>{it.name}</p>
                                    <p className="text-xs" style={{ color: "#4a6670" }}>
                                      {price === 0 ? "FREE" : `R${Math.round(price / 100).toLocaleString("en-ZA")}`}
                                      {it.discount_payment_link && (
                                        <> · <a href={it.discount_payment_link} target="_blank" rel="noreferrer" style={{ color: "#0b4650", textDecoration: "underline" }}>Discount link</a></>
                                      )}
                                    </p>
                                  </div>
                                </div>
                              );
                            })}
                            <div className="text-xs pt-2 border-t border-[#c5cdd4]" style={{ color: "#4a6670" }}>
                              <p>Email: <a href={`mailto:${r.customer_email}`} style={{ color: "#0b4650", textDecoration: "underline" }}>{r.customer_email}</a></p>
                              <p>Created: {formatSAST(r.created_at)}</p>
                              <p>Updated: {formatSAST(r.updated_at)}</p>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
