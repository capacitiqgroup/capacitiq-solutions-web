import { Link } from "react-router-dom";
import { LOGO_SVG } from "@/lib/site";

export function LogoMark(_: { withWord?: boolean } = {}) {
  return (
    <Link to="/" className="inline-flex items-center gap-3 group" aria-label="Capacitiq home">
      <span className="logo-tile">
        <img src={LOGO_SVG} alt="Capacitiq logo" />
      </span>
    </Link>
  );
}
