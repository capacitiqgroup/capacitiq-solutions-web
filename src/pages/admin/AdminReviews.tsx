import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Pencil, Trash2, Star } from "lucide-react";
import { Header, Table, Th, Td, Field, Modal } from "./AdminBlog";

type Row = {
  id: string;
  reviewer_name: string;
  reviewer_photo_url: string | null;
  rating: number;
  review_text: string;
  review_date: string;
  source: string;
  is_visible: boolean;
};

export default function AdminReviews() {
  const [rows, setRows] = useState<Row[]>([]);
  const [editing, setEditing] = useState<Partial<Row> | null>(null);

  async function load() {
    const { data } = await supabase.from("reviews").select("*").order("review_date", { ascending: false });
    setRows((data as any) || []);
  }
  useEffect(() => { load(); }, []);

  async function save() {
    if (!editing) return;
    const payload: any = {
      reviewer_name: editing.reviewer_name,
      reviewer_photo_url: editing.reviewer_photo_url || null,
      rating: editing.rating || 5,
      review_text: editing.review_text,
      review_date: editing.review_date || new Date().toISOString().slice(0, 10),
      source: editing.source || "Google",
      is_visible: editing.is_visible ?? true,
    };
    if (editing.id) await supabase.from("reviews").update(payload).eq("id", editing.id);
    else await supabase.from("reviews").insert(payload);
    setEditing(null); load();
  }

  async function del(id: string) {
    if (!confirm("Delete this review?")) return;
    await supabase.from("reviews").delete().eq("id", id); load();
  }

  async function toggleVisible(r: Row) {
    await supabase.from("reviews").update({ is_visible: !r.is_visible }).eq("id", r.id);
    setRows(rows.map((x) => x.id === r.id ? { ...x, is_visible: !r.is_visible } : x));
  }

  return (
    <div>
      <Header title="Reviews" onAdd={() => setEditing({ rating: 5, is_visible: true, source: "Google" })} />
      <Table>
        <thead><tr><Th>Name</Th><Th>Rating</Th><Th>Date</Th><Th>Visible</Th><Th></Th></tr></thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.id} className="border-t border-[#c5cdd4]">
              <Td>{r.reviewer_name}</Td>
              <Td><StarRow value={r.rating} /></Td>
              <Td>{r.review_date}</Td>
              <Td>
                <label className="inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" checked={r.is_visible} onChange={() => toggleVisible(r)} />
                  <div className="w-9 h-5 rounded-full peer-checked:bg-[#e6ff2b] bg-[#c5cdd4] relative transition">
                    <div className={`absolute top-0.5 ${r.is_visible ? "left-[18px]" : "left-0.5"} w-4 h-4 bg-white rounded-full transition`} />
                  </div>
                </label>
              </Td>
              <Td>
                <button onClick={() => setEditing(r)} className="p-2"><Pencil size={14} /></button>
                <button onClick={() => del(r.id)} className="p-2"><Trash2 size={14} /></button>
              </Td>
            </tr>
          ))}
        </tbody>
      </Table>

      {editing && (
        <Modal onClose={() => setEditing(null)} title={editing.id ? "Edit Review" : "New Review"}>
          <Field label="Reviewer Name *"><input className="neu-inset w-full p-3 text-sm" value={editing.reviewer_name || ""} onChange={(e) => setEditing({ ...editing, reviewer_name: e.target.value })} /></Field>
          <Field label="Reviewer Photo URL"><input className="neu-inset w-full p-3 text-sm" value={editing.reviewer_photo_url || ""} onChange={(e) => setEditing({ ...editing, reviewer_photo_url: e.target.value })} /></Field>
          <Field label="Rating *">
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((n) => (
                <button key={n} type="button" onClick={() => setEditing({ ...editing, rating: n })}>
                  <Star size={22} fill={(editing.rating || 0) >= n ? "#e6ff2b" : "none"} color="#0b4650" />
                </button>
              ))}
            </div>
          </Field>
          <Field label="Review Text *"><textarea rows={5} className="neu-inset w-full p-3 text-sm" value={editing.review_text || ""} onChange={(e) => setEditing({ ...editing, review_text: e.target.value })} /></Field>
          <Field label="Review Date *"><input type="date" className="neu-inset w-full p-3 text-sm" value={editing.review_date || new Date().toISOString().slice(0, 10)} onChange={(e) => setEditing({ ...editing, review_date: e.target.value })} /></Field>
          <Field label="Visible">
            <label className="inline-flex items-center gap-2 text-sm">
              <input type="checkbox" checked={editing.is_visible ?? true} onChange={(e) => setEditing({ ...editing, is_visible: e.target.checked })} />
              Show on website
            </label>
          </Field>
          <button className="btn-cta w-full mt-4" onClick={save}>Save</button>
        </Modal>
      )}
    </div>
  );
}

function StarRow({ value }: { value: number }) {
  return <div className="flex">{[1, 2, 3, 4, 5].map((n) => <Star key={n} size={14} fill={n <= value ? "#e6ff2b" : "none"} color="#0b4650" />)}</div>;
}
