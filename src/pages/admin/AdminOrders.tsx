import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ChevronDown, ChevronRight } from "lucide-react";

type Order = {
  id: string;
  created_at: string;
  customer_name: string;
  customer_email: string;
  items: { id: string; name: string; price: number }[];
  amount_in_cents: number;
  status: string;
  yoco_charge_id: string | null;
};

export default function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [open, setOpen] = useState<string | null>(null);

  useEffect(() => {
    supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false })
      .then(({ data }) => setOrders((data as any) || []));
  }, []);

  function fmtDate(s: string) {
    const d = new Date(s);
    return d.toLocaleString("en-ZA", { timeZone: "Africa/Johannesburg", day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }) + " SAST";
  }

  function fmtAmount(c: number) {
    return c === 0 ? "FREE" : `R${Math.round(c / 100).toLocaleString("en-ZA")}`;
  }

  function pillStyle(status: string) {
    if (status === "paid") return { background: "#22c55e", color: "#ffffff" };
    if (status === "free") return { background: "#e6ff2b", color: "#0b4650" };
    return { background: "#c5cdd4", color: "#0b4650" };
  }

  return (
    <div className="neu-raised rounded-3xl p-6">
      <h1 className="font-display font-bold text-2xl mb-6" style={{ color: "#0b4650" }}>Orders</h1>
      {orders.length === 0 ? (
        <p className="text-sm text-muted">No orders yet.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ background: "#dde3e8", color: "#0b4650" }}>
                <th className="text-left p-3 w-8"></th>
                <th className="text-left p-3">Date</th>
                <th className="text-left p-3">Customer</th>
                <th className="text-left p-3">Email</th>
                <th className="text-left p-3">Templates</th>
                <th className="text-left p-3">Amount</th>
                <th className="text-left p-3">Status</th>
                <th className="text-left p-3">Reference</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => {
                const isOpen = open === o.id;
                const ref = o.yoco_charge_id || o.id;
                return (
                  <>
                    <tr
                      key={o.id}
                      className="cursor-pointer border-t border-[#c5cdd4]"
                      onClick={() => setOpen(isOpen ? null : o.id)}
                    >
                      <td className="p-3">{isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}</td>
                      <td className="p-3">{fmtDate(o.created_at)}</td>
                      <td className="p-3">{o.customer_name}</td>
                      <td className="p-3">{o.customer_email}</td>
                      <td className="p-3">{(o.items || []).map((i) => i.name).join(", ")}</td>
                      <td className="p-3">{fmtAmount(o.amount_in_cents)}</td>
                      <td className="p-3">
                        <span style={{ ...pillStyle(o.status), padding: "3px 10px", borderRadius: 999, fontSize: 11, fontWeight: 700, textTransform: "uppercase" }}>
                          {o.status}
                        </span>
                      </td>
                      <td className="p-3 font-mono text-xs">{ref.slice(0, 20)}</td>
                    </tr>
                    {isOpen && (
                      <tr key={`${o.id}-d`}>
                        <td colSpan={8} className="p-4" style={{ background: "#f5f7f8" }}>
                          <div className="space-y-2 text-sm">
                            <p><strong>Full reference:</strong> <span className="font-mono">{ref}</span></p>
                            <p><strong>Templates:</strong></p>
                            <ul className="list-disc pl-6">
                              {(o.items || []).map((i, idx) => (
                                <li key={idx}>{i.name} — {fmtAmount(i.price)}</li>
                              ))}
                            </ul>
                            <p>
                              <a className="underline" style={{ color: "#0b4650" }} href={`mailto:${o.customer_email}`}>
                                Email {o.customer_email}
                              </a>
                            </p>
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
