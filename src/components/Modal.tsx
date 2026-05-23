import { useEffect } from "react";
import { X } from "lucide-react";

export function Modal({
  open,
  onClose,
  title,
  subtitle,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40" />
      <div
        className="neu-raised relative w-full max-w-lg rounded-3xl p-6 sm:p-8 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute top-4 right-4 neu-raised-sm w-10 h-10 rounded-2xl inline-flex items-center justify-center"
        >
          <X size={20} color="#0b4650" />
        </button>
        <h2 className="font-display font-bold text-2xl pr-12">{title}</h2>
        {subtitle && <p className="text-sm text-muted mt-2">{subtitle}</p>}
        <div className="mt-6">{children}</div>
      </div>
    </div>
  );
}