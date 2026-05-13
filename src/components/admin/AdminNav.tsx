import { Link, useLocation } from "react-router-dom";
import { Package, ShoppingCart } from "lucide-react";
import s from "./AdminNav.module.css";

const NAV_ITEMS = [
  { path: "/admin", label: "Products", icon: Package },
  { path: "/admin/orders", label: "Orders", icon: ShoppingCart },
];

export default function AdminNav() {
  const { pathname } = useLocation();

  const isActive = (path: string) => {
    if (path === "/admin") return pathname === "/admin";
    return pathname.startsWith(path);
  };

  return (
    <div className={s.adminBar}>
      <Link to="/admin" className={s.adminLogo}>
        RAVEN <span className={s.adminBadge}>ADMIN</span>
      </Link>

      <span className={s.adminSep}>/</span>

      <nav className={s.navLinks}>
        {NAV_ITEMS.map(({ path, label, icon: Icon }) => (
          <Link
            key={path}
            to={path}
            className={isActive(path) ? s.navLinkActive : s.navLink}
          >
            <Icon size={13} />
            {label}
          </Link>
        ))}
      </nav>

      <div className={s.spacer} />

      <Link to="/" className={s.storeBtn}>
        View Store
      </Link>
    </div>
  );
}
