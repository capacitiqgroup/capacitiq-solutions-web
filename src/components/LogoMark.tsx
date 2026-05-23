import { Link } from "react-router-dom";
import { LOGO_SVG } from "@/lib/site";

export function LogoMark({ withWord = true }: { withWord?: boolean }) {
  return (
    <Link to="/" className="inline-flex items-center gap-3 group">
      <span className="logo-tile">
        <img src={LOGO_SVG} alt="Capacitiq logo" />
      </span>
      {withWord && (
        <span className="font-display font-bold text-[1.05rem] tracking-tight" style={{ color: "#0b4650" }}>
          Solutions
        </span>
      )}
    </Link>
  );
}