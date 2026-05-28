import { Link } from "react-router-dom";
import { X, Trash2, ShoppingBag } from "lucide-react";
import { useEffect } from "react";
import { useCart, formatZAR } from "@/lib/cart";

export function CartDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { items, removeItem, total } = useCart();
  const subtotal = total();

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60]" role="dialog" aria-label="Cart Summary">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <aside className="absolute right-0 top-0 h-full w-full sm:w-[420px] p-4 sm:p-5 flex">
        <div className="neu-raised rounded-3xl w-full p-6 flex flex-col" style={{ backgroundColor: "#e8edf0" }}>
          <div className="flex items-center justify-between">
            <h2 className="font-display font-bold text-xl text-[#0b4650]">Cart Summary</h2>
            <button onClick={onClose} aria-label="Close cart" className="neu-raised-sm w-10 h-10 rounded-2xl inline-flex items-center justify-center">
              <X size={20} color="#0b4650" />
            </button>
          </div>

          {items.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center">
              <ShoppingBag size={40} color="#4a6670" />
              <p className="font-display font-bold mt-4 text-[#0b4650]">Your cart is empty.</p>
              <Link to="/templates" onClick={onClose} className="btn-cta mt-5">Browse Templates</Link>
            </div>
          ) : (
            <>
              <div className="mt-5 flex-1 overflow-y-auto space-y-3 pr-1">
                {items.map((it) => (
                  <div key={it.id} className="flex items-center gap-3 neu-raised-sm rounded-2xl p-3">
                    {it.preview_image && <img src={it.preview_image} alt={it.name} className="w-12 h-12 rounded-xl object-cover" />}
                    <div className="flex-1 min-w-0">
                      <p className="font-display font-bold text-sm truncate text-[#0b4650]">{it.name}</p>
                      <p className="text-xs italic text-muted">{it.category}</p>
                    </div>
                    <span className="font-display font-bold text-sm text-[#0b4650]">{it.price === 0 ? "FREE" : formatZAR(it.price)}</span>
                    <button onClick={() => removeItem(it.id)} aria-label="Remove" className="neu-raised-sm rounded-xl w-9 h-9 inline-flex items-center justify-center">
                      <Trash2 size={14} color="#0b4650" />
                    </button>
                  </div>
                ))}
              </div>

              <div className="mt-5 border-t border-[#c5cdd4] pt-4 space-y-2 text-sm text-[#0b4650]">
                <div className="flex justify-between"><span>Subtotal</span><span>{subtotal === 0 ? "FREE" : formatZAR(subtotal)}</span></div>
                <div className="flex justify-between"><span>Shipping</span><span>FREE (Digital)</span></div>
                <div className="flex justify-between font-display font-bold text-lg pt-2 border-t border-[#c5cdd4]">
                  <span>Total</span><span>{subtotal === 0 ? "FREE" : formatZAR(subtotal)}</span>
                </div>
              </div>

              <Link to="/templates/checkout" onClick={onClose} className="btn-cta mt-5 w-full text-center">Proceed to Checkout</Link>
            </>
          )}
        </div>
      </aside>
    </div>
  );
}