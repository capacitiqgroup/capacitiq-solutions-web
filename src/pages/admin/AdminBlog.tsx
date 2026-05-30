import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Pencil, Trash2, Plus, X } from "lucide-react";

type Row = {
  id: string;
  title: string;
  slug: string;
  category: string | null;
  author: string | null;
  status: string;
  publish_date: string | null;
  featured_image: string | null;
  excerpt: string | null;
  body: string | null;
  tags: string[] | null;
};

const CATEGORIES = ["Strategy", "Operations", "Design", "PR", "Growth", "Technology", "Web Presence"];

const slugify = (s: string) => s.toLowerCase().trim().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-");

export default function AdminBlog() {
  const [rows, setRows] = useState<Row[]>([]);
  const [editing, setEditing] = useState<Partial<Row> | null>(null);

  async function load() {
    const { data } = await supabase.from("blog_posts").select("*").order("publish_date", { ascending: false });
    setRows((data as any) || []);
  }
  useEffect(() => { load(); }, []);

  async function save() {
    if (!editing) return;
    const payload: any = {
      title: editing.title, slug: editing.slug || slugify(editing.title || ""),
      category: editing.category, author: editing.author || "Capacitiq Team",
      status: editing.status || "published",
      publish_date: editing.publish_date || new Date().toISOString().slice(0, 10),
      featured_image: editing.featured_image || null,
      excerpt: editing.excerpt || null, body: editing.body || null,
      tags: editing.tags || null,
    };
    if (editing.id) await supabase.from("blog_posts").update(payload).eq("id", editing.id);
    else await supabase.from("blog_posts").insert(payload);
    setEditing(null); load();
  }

  async function del(id: string) {
    if (!confirm("Delete this post?")) return;
    await supabase.from("blog_posts").delete().eq("id", id);
    load();
  }

  return (
    <div>
      <Header title="Blog Posts" onAdd={() => setEditing({ status: "published", author: "Capacitiq Team" })} />
      <Table>
        <thead><tr><Th>Title</Th><Th>Category</Th><Th>Status</Th><Th>Date</Th><Th></Th></tr></thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.id} className="border-t border-[#c5cdd4]">
              <Td>{r.title}</Td>
              <Td>{r.category}</Td>
              <Td><Pill text={r.status} /></Td>
              <Td>{r.publish_date}</Td>
              <Td>
                <button onClick={() => setEditing(r)} className="p-2"><Pencil size={14} /></button>
                <button onClick={() => del(r.id)} className="p-2"><Trash2 size={14} /></button>
              </Td>
            </tr>
          ))}
        </tbody>
      </Table>

      {editing && (
        <Modal onClose={() => setEditing(null)} title={editing.id ? "Edit Post" : "New Post"}>
          <Field label="Title *"><input className="neu-inset w-full p-3 text-sm" value={editing.title || ""} onChange={(e) => setEditing({ ...editing, title: e.target.value, slug: editing.slug || slugify(e.target.value) })} /></Field>
          <Field label="Slug *"><input className="neu-inset w-full p-3 text-sm" value={editing.slug || ""} onChange={(e) => setEditing({ ...editing, slug: e.target.value })} /></Field>
          <Field label="Category *">
            <select className="neu-inset w-full p-3 text-sm" value={editing.category || ""} onChange={(e) => setEditing({ ...editing, category: e.target.value })}>
              <option value="">Select</option>
              {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
            </select>
          </Field>
          <Field label="Author"><input className="neu-inset w-full p-3 text-sm" value={editing.author || ""} onChange={(e) => setEditing({ ...editing, author: e.target.value })} /></Field>
          <Field label="Publish Date *"><input type="date" className="neu-inset w-full p-3 text-sm" value={editing.publish_date || ""} onChange={(e) => setEditing({ ...editing, publish_date: e.target.value })} /></Field>
          <Field label="Featured Image URL"><input className="neu-inset w-full p-3 text-sm" value={editing.featured_image || ""} onChange={(e) => setEditing({ ...editing, featured_image: e.target.value })} /></Field>
          <Field label="Excerpt *"><textarea rows={2} className="neu-inset w-full p-3 text-sm" value={editing.excerpt || ""} onChange={(e) => setEditing({ ...editing, excerpt: e.target.value })} /></Field>
          <Field label="Body *"><textarea rows={10} className="neu-inset w-full p-3 text-sm" value={editing.body || ""} onChange={(e) => setEditing({ ...editing, body: e.target.value })} /></Field>
          <Field label="Tags (comma-separated)"><input className="neu-inset w-full p-3 text-sm" value={(editing.tags || []).join(", ")} onChange={(e) => setEditing({ ...editing, tags: e.target.value.split(",").map((s) => s.trim()).filter(Boolean) })} /></Field>
          <StatusRadio value={editing.status || "published"} onChange={(v) => setEditing({ ...editing, status: v })} />
          <button className="btn-cta w-full mt-4" onClick={save}>Save</button>
        </Modal>
      )}
    </div>
  );
}

// ---------- shared admin UI ----------
export function Header({ title, onAdd }: { title: string; onAdd: () => void }) {
  return (
    <div className="flex items-center justify-between mb-6">
      <h1 className="font-display font-bold text-2xl" style={{ color: "#0b4650" }}>{title}</h1>
      <button onClick={onAdd} className="btn-cta inline-flex items-center gap-2"><Plus size={14} /> New</button>
    </div>
  );
}
export function Table({ children }: { children: React.ReactNode }) {
  return <div className="neu-raised rounded-3xl p-2 overflow-x-auto"><table className="w-full text-sm">{children}</table></div>;
}
export function Th({ children }: { children?: React.ReactNode }) { return <th className="text-left p-3 font-display text-xs uppercase" style={{ color: "#4a6670" }}>{children}</th>; }
export function Td({ children }: { children?: React.ReactNode }) { return <td className="p-3" style={{ color: "#0b4650" }}>{children}</td>; }
export function Pill({ text }: { text: string }) {
  const lime = text === "published" || text === "open";
  return <span className="rounded-full px-2.5 py-1 text-xs font-display font-bold" style={{ backgroundColor: lime ? "#e6ff2b" : "#dde3e8", color: "#0b4650" }}>{text}</span>;
}
export function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="mb-3"><label className="font-display text-sm block mb-2" style={{ color: "#0b4650" }}>{label}</label>{children}</div>;
}
export function StatusRadio({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div className="mb-3">
      <label className="font-display text-sm block mb-2" style={{ color: "#0b4650" }}>Status *</label>
      <div className="flex gap-4">
        {["published", "draft"].map((s) => (
          <label key={s} className="flex items-center gap-2 text-sm">
            <input type="radio" checked={value === s} onChange={() => onChange(s)} /> {s}
          </label>
        ))}
      </div>
    </div>
  );
}
export function Modal({ title, children, onClose }: { title: string; children: React.ReactNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 overflow-y-auto" style={{ background: "rgba(11,70,80,0.4)" }}>
      <div className="neu-raised rounded-3xl p-6 w-full max-w-2xl my-8" style={{ background: "#e8edf0" }}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display font-bold text-xl" style={{ color: "#0b4650" }}>{title}</h2>
          <button onClick={onClose} className="p-2"><X size={16} /></button>
        </div>
        {children}
      </div>
    </div>
  );
}
