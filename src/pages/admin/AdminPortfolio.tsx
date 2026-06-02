import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Pencil, Trash2, Plus, X } from "lucide-react";
import { Header, Table, Th, Td, Pill, Field, StatusRadio, Modal } from "./AdminBlog";

type Section = { heading: string; body: string };
type Row = {
  id: string;
  title: string;
  subtitle: string | null;
  category: string | null;
  excerpt: string | null;
  hero_image: string | null;
  gallery_images: string[] | null;
  sections: Section[] | null;
  tags: string[] | null;
  status: string;
};

const CATS = ["Strategy", "Design", "PR", "Operations", "Web", "Infrastructure"];

export default function AdminPortfolio() {
  const [rows, setRows] = useState<Row[]>([]);
  const [editing, setEditing] = useState<Partial<Row> | null>(null);

  async function load() {
    const { data } = await supabase.from("portfolio_items").select("*").order("created_at", { ascending: false });
    setRows((data as any) || []);
  }
  useEffect(() => { load(); }, []);

  async function save() {
    if (!editing) return;
    const payload: any = {
      title: editing.title, subtitle: editing.subtitle || null,
      category: editing.category, excerpt: editing.excerpt || null,
      hero_image: editing.hero_image || null,
      gallery_images: (editing.gallery_images || []).filter((u) => u && u.trim()),
      sections: editing.sections || [],
      tags: editing.tags || null,
      status: editing.status || "published",
    };
    if (editing.id) await supabase.from("portfolio_items").update(payload).eq("id", editing.id);
    else await supabase.from("portfolio_items").insert(payload);
    setEditing(null); load();
  }

  async function del(id: string) {
    if (!confirm("Delete this item?")) return;
    await supabase.from("portfolio_items").delete().eq("id", id);
    load();
  }

  function updateSection(i: number, key: keyof Section, value: string) {
    const next = [...(editing!.sections || [])];
    next[i] = { ...next[i], [key]: value };
    setEditing({ ...editing!, sections: next });
  }
  function addSection() {
    setEditing({ ...editing!, sections: [...(editing!.sections || []), { heading: "", body: "" }] });
  }
  function removeSection(i: number) {
    setEditing({ ...editing!, sections: (editing!.sections || []).filter((_, j) => j !== i) });
  }

  return (
    <div>
      <Header title="Portfolio" onAdd={() => setEditing({ status: "published", category: "Strategy", sections: [] })} />
      <Table>
        <thead><tr><Th>Title</Th><Th>Category</Th><Th>Status</Th><Th></Th></tr></thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.id} className="border-t border-[#c5cdd4]">
              <Td>{r.title}</Td><Td>{r.category}</Td><Td><Pill text={r.status} /></Td>
              <Td>
                <button onClick={() => setEditing(r)} className="p-2"><Pencil size={14} /></button>
                <button onClick={() => del(r.id)} className="p-2"><Trash2 size={14} /></button>
              </Td>
            </tr>
          ))}
        </tbody>
      </Table>

      {editing && (
        <Modal onClose={() => setEditing(null)} title={editing.id ? "Edit Portfolio Item" : "New Portfolio Item"}>
          <Field label="Title *"><input className="neu-inset w-full p-3 text-sm" value={editing.title || ""} onChange={(e) => setEditing({ ...editing, title: e.target.value })} /></Field>
          <Field label="Subtitle *"><input className="neu-inset w-full p-3 text-sm" value={editing.subtitle || ""} onChange={(e) => setEditing({ ...editing, subtitle: e.target.value })} /></Field>
          <Field label="Category *">
            <select className="neu-inset w-full p-3 text-sm" value={editing.category || ""} onChange={(e) => setEditing({ ...editing, category: e.target.value })}>
              {CATS.map((c) => <option key={c}>{c}</option>)}
            </select>
          </Field>
          <Field label="Excerpt *"><textarea rows={2} className="neu-inset w-full p-3 text-sm" value={editing.excerpt || ""} onChange={(e) => setEditing({ ...editing, excerpt: e.target.value })} /></Field>
          <Field label="Hero Image URL * (16x9)"><input className="neu-inset w-full p-3 text-sm" value={editing.hero_image || ""} onChange={(e) => setEditing({ ...editing, hero_image: e.target.value })} /></Field>
          <div className="mb-4">
            <label style={{ display: "block", fontFamily: "Inter, sans-serif", fontSize: "13px", color: "#0b4650", marginBottom: "6px", fontWeight: 500 }}>
              Additional Gallery Images
              <span style={{ fontWeight: 400, color: "#4a6670", marginLeft: "8px", fontSize: "12px" }}>Optional — up to 10 images, 16x9 ratio</span>
            </label>
            {(editing.gallery_images || []).map((url, index) => (
              <div key={index} style={{ display: "flex", gap: "8px", marginBottom: "8px", alignItems: "center" }}>
                <input
                  type="text"
                  value={url}
                  onChange={(e) => {
                    const updated = [...(editing.gallery_images || [])];
                    updated[index] = e.target.value;
                    setEditing({ ...editing, gallery_images: updated });
                  }}
                  placeholder={`Image ${index + 1} URL — paste Cloudinary link`}
                  className="neu-inset"
                  style={{ flex: 1, padding: "10px 14px", fontFamily: "Inter, sans-serif", fontSize: "13px", color: "#0b4650" }}
                />
                <button
                  type="button"
                  onClick={() => setEditing({ ...editing, gallery_images: (editing.gallery_images || []).filter((_, i) => i !== index) })}
                  style={{ background: "#e8edf0", border: "none", borderRadius: "50%", width: "36px", height: "36px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", boxShadow: "4px 4px 8px #c5cdd4, -4px -4px 8px #ffffff", flexShrink: 0 }}
                  aria-label="Remove image"
                >
                  <Trash2 size={14} color="#dc2626" />
                </button>
              </div>
            ))}
            {(editing.gallery_images || []).length < 10 && (
              <button
                type="button"
                onClick={() => setEditing({ ...editing, gallery_images: [...(editing.gallery_images || []), ""] })}
                style={{ background: "#e8edf0", border: "none", borderRadius: "12px", padding: "10px 20px", fontFamily: "Ubuntu, sans-serif", fontWeight: 700, fontSize: "13px", color: "#0b4650", cursor: "pointer", boxShadow: "4px 4px 8px #c5cdd4, -4px -4px 8px #ffffff", textTransform: "uppercase", letterSpacing: "0.05em" }}
              >
                + Add Image
              </button>
            )}
          </div>
          <div className="mb-3">
            <label className="font-display text-sm block mb-2" style={{ color: "#0b4650" }}>Sections</label>
            {(editing.sections || []).map((s, i) => (
              <div key={i} className="neu-inset rounded-2xl p-3 mb-2 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs" style={{ color: "#4a6670" }}>Section {i + 1}</span>
                  <button onClick={() => removeSection(i)} className="p-1"><X size={14} /></button>
                </div>
                <input placeholder="Heading" className="neu-inset w-full p-2 text-sm" value={s.heading} onChange={(e) => updateSection(i, "heading", e.target.value)} />
                <textarea placeholder="Body" rows={3} className="neu-inset w-full p-2 text-sm" value={s.body} onChange={(e) => updateSection(i, "body", e.target.value)} />
              </div>
            ))}
            <button onClick={addSection} className="text-sm inline-flex items-center gap-1" style={{ color: "#0b4650" }}><Plus size={14} /> Add Section</button>
          </div>
          <Field label="Tags (comma-separated)"><input className="neu-inset w-full p-3 text-sm" value={(editing.tags || []).join(", ")} onChange={(e) => setEditing({ ...editing, tags: e.target.value.split(",").map((s) => s.trim()).filter(Boolean) })} /></Field>
          <StatusRadio value={editing.status || "published"} onChange={(v) => setEditing({ ...editing, status: v })} />
          <button className="btn-cta w-full mt-4" onClick={save}>Save</button>
        </Modal>
      )}
    </div>
  );
}
