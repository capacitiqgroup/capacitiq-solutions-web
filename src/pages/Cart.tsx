import { Link } from "react-router-dom";
import { Trash2, ShoppingBag } from "lucide-react";
import { Seo } from "@/lib/seo";
import { useCart, formatZAR } from "@/lib/cart";

export default function Cart() {
  const { items, removeItem, clear, total } = useCart();

  return (
    <>
      <Seo title="Shopping Cart | Capacitiq" description="Your Capacitiq template cart." path="/templates/cart" />
      <section className="px-4 sm:px-6 pt-10 pb-16">
        <div className="max-w-7xl mx-auto">
          <h1 className="font-display font-bold text-4xl">Shopping Cart</h1>

          {items.length === 0 ? (
            <div className="neu-raised rounded-3xl p-10 text-center max-w-xl mx-auto mt-10">
              <ShoppingBag size={48} className="mx-auto" color="#4a6670" />
              <h3 className="font-display font-bold text-xl mt-4">Your cart is empty.</h3>
              <p className="text-sm text-muted mt-2">Browse our template collection and add something to your cart.</p>
              <Link to="/templates" className="btn-cta mt-6 inline-flex">Browse Templates</Link>
            </div>
          ) : (
            <div className="mt-8 grid lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 neu-raised rounded-3xl p-6">
                <div className="space-y-4">
                  {items.map((it) => (
                    <div key={it.id} className="flex items-center gap-4 p-3 neu-raised-sm rounded-2xl">
                      {it.preview_image && <img src={it.preview_image} alt={it.name} className="w-16 h-16 rounded-xl object-cover" />}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-display font-bold text-sm truncate">{it.name}</h3>
                        <p className="text-xs italic text-muted">{it.category}</p>
                      </div>
                      <span className="font-display font-bold text-sm">{formatZAR(it.price)}</span>
                      <button onClick={() => removeItem(it.id)} aria-label="Remove" className="neu-raised-sm rounded-xl w-10 h-10 inline-flex items-center justify-center">
                        <Trash2 size={16} color="#0b4650" />
                      </button>
                    </div>
                  ))}
                </div>
                <button className="btn-ghost mt-6" onClick={clear}>Empty Cart</button>
              </div>

              <aside className="neu-raised rounded-3xl p-6 h-fit lg:sticky lg:top-28">
                <h2 className="font-display font-bold text-lg">Cart Summary</h2>
                <div className="space-y-2 text-sm mt-4">
                  <div className="flex justify-between"><span>Subtotal</span><span>{formatZAR(total())}</span></div>
                  <div className="flex justify-between"><span>Shipping</span><span>FREE (Digital)</span></div>
                </div>
                <div className="border-t border-[#c5cdd4] mt-4 pt-4 flex justify-between font-display font-bold text-lg">
                  <span>Total</span><span>{formatZAR(total())}</span>
                </div>
                <Link to="/templates/checkout" className="btn-cta mt-6 w-full">Proceed to Checkout</Link>
                <p className="text-xs text-muted mt-4">Visa · Mastercard</p>
              </aside>
            </div>
          )}
        </div>
      </section>
    </>
  );
}