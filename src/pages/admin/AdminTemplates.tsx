import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Pencil, Trash2 } from "lucide-react";
import { Header, Table, Th, Td, Pill, Field, StatusRadio, Modal } from "./AdminBlog";

type Row = {
  id: string;
  name: string;
  category: string;
  price: number;
  launch_price: number | null;
  standard_price: number | null;
  description: string | null;
  preview_image: string | null;
  canva_link: string | null;
  payment_link: string | null;
  status: string;
};

const CATS = ["Social Media", "Presentations", "Business Docs", "Brand", "Email", "Events"];

export default function AdminTemplates() {
  const [rows, setRows] = useState<Row[]>([]);
  const [editing, setEditing] = useState<Partial<Row> | null>(null);

  async function load() {
    const { data } = await supabase.from("templates").select("*").order("created_at", { ascending: false });
    setRows((data as any) || []);
  }
  useEffect(() => { load(); }, []);

  async function save() {
    if (!editing) return;
    const launch = Number(editing.launch_price ?? 0);
    const standard = Number(editing.standard_price ?? 0);
    const payload: any = {
      name: editing.name,
      category: editing.category,
      price: launch,
      launch_price: launch,
      standard_price: standard,
      description: editing.description || null,
      preview_image: editing.preview_image || null,
      canva_link: editing.canva_link || null,
      payment_link: editing.payment_link || null,
      status: editing.status || "published",
    };
    if (editing.id) await supabase.from("templates").update(payload).eq("id", editing.id);
    else await supabase.from("templates").insert(payload);
    setEditing(null); load();
  }

  async function del(id: string) {
    if (!confirm("Delete this template?")) return;
    await supabase.from("templates").delete().eq("id", id);
    load();
  }

  // Helpers — store rand in form but the DB stores cents
  function setRand(field: "launch_price" | "standard_price", rand: string) {
    const cents = Math.round(Number(rand || 0) * 100);
    setEditing({ ...editing!, [field]: cents });
  }
  const toRand = (cents: number | null | undefined) => (cents == null ? "" : (cents / 100).toString());

  return (
    <div>
      <Header title="Templates" onAdd={() => setEditing({ status: "published", category: "Social Media" })} />
      <Table>
        <thead><tr><Th>Name</Th><Th>Category</Th><Th>Launch</Th><Th>Status</Th><Th></Th></tr></thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.id} className="border-t border-[#c5cdd4]">
              <Td>{r.name}</Td><Td>{r.category}</Td><Td>R{((r.launch_price ?? r.price) / 100).toFixed(0)}</Td>
              <Td><Pill text={r.status} /></Td>
              <Td>
                <button onClick={() => setEditing(r)} className="p-2"><Pencil size={14} /></button>
                <button onClick={() => del(r.id)} className="p-2"><Trash2 size={14} /></button>
              </Td>
            </tr>
          ))}
        </tbody>
      </Table>

      {editing && (
        <Modal onClose={() => setEditing(null)} title={editing.id ? "Edit Template" : "New Template"}>
          <Field label="Template Name *"><input className="neu-inset w-full p-3 text-sm" value={editing.name || ""} onChange={(e) => setEditing({ ...editing, name: e.target.value })} /></Field>
          <Field label="Category *">
            <select className="neu-inset w-full p-3 text-sm" value={editing.category || ""} onChange={(e) => setEditing({ ...editing, category: e.target.value })}>
              {CATS.map((c) => <option key={c}>{c}</option>)}
            </select>
          </Field>
          <Field label="Launch Price * (Rands)"><input type="number" className="neu-inset w-full p-3 text-sm" value={toRand(editing.launch_price as any)} onChange={(e) => setRand("launch_price", e.target.value)} /></Field>
          <Field label="Standard Price * (Rands)"><input type="number" className="neu-inset w-full p-3 text-sm" value={toRand(editing.standard_price as any)} onChange={(e) => setRand("standard_price", e.target.value)} /></Field>
          <Field label="Description *"><textarea rows={4} className="neu-inset w-full p-3 text-sm" value={editing.description || ""} onChange={(e) => setEditing({ ...editing, description: e.target.value })} /></Field>
          <Field label="Preview Image URL * (16x9)"><input className="neu-inset w-full p-3 text-sm" value={editing.preview_image || ""} onChange={(e) => setEditing({ ...editing, preview_image: e.target.value })} /></Field>
          <Field label="Canva Template Link (Private — delivered by email after purchase)"><input className="neu-inset w-full p-3 text-sm" value={editing.canva_link || ""} onChange={(e) => setEditing({ ...editing, canva_link: e.target.value })} /></Field>
          <Field label="Payment Link (Paystack URL)"><input className="neu-inset w-full p-3 text-sm" value={editing.payment_link || ""} onChange={(e) => setEditing({ ...editing, payment_link: e.target.value })} /></Field>
          <StatusRadio value={editing.status || "published"} onChange={(v) => setEditing({ ...editing, status: v })} />
          <button className="btn-cta w-full mt-4" onClick={save}>Save</button>
        </Modal>
      )}
    </div>
  );
}
