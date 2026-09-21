import { useEffect } from "react";
import { LogOut, X } from "lucide-react";
import Avatar from "../../../../../../shared/components/ui/atoms/Avatar/Avatar";
import Overlay from "../../../../../../shared/components/ui/atoms/Overlay/Overlay";
import {
  NAV_BY_ROLE,
  ROLE_LABEL,
} from "../../../../../../shared/constants/nav";
import "./SideBar.scss";

export default function SideBar({
  role,
  activeItem = "",
  onSelect,
  userName,
  onLogout,
  open = false,
  onClose,
  badgeCount = 0,
  badgeLabel,
}) {
  const items = NAV_BY_ROLE[role] || [];

  useEffect(() => {
    if (!open) return;

    const onKey = (e) => {
      if (e.key === "Escape") onClose?.();
    };
    document.addEventListener("keydown", onKey);

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, onClose]);

  const select = (key) => {
    onSelect?.(key);
    onClose?.();
  };

  return (
    <>
      {open && <Overlay onClose={onClose} />}
      <aside
        className={["sidebar", open ? "sidebar--open" : ""]
          .filter(Boolean)
          .join(" ")}
      >
        <div className="sidebar__brand">
          <img
            src="/images/logo-r.png"
            alt="net2Rent"
            className="sidebar__logo"
          />
          <button
            type="button"
            className="sidebar__close"
            onClick={onClose}
            aria-label="Cerrar menú"
          >
            <X size={18} aria-hidden="true" />
          </button>
        </div>

        <nav className="sidebar__nav" aria-label="Menú principal">
          <ul className="sidebar__list">
            {items.map((item) => {
              const Icon = item.icon;
              const isActive = item.key === activeItem;
              return (
                <li key={item.key}>
                  <button
                    type="button"
                    className={[
                      "sidebar__item",
                      isActive ? "sidebar__item--active" : "",
                    ]
                      .filter(Boolean)
                      .join(" ")}
                    aria-current={isActive ? "page" : undefined}
                    onClick={() => select(item.key)}
                  >
                    <Icon size={18} aria-hidden="true" />
                    <span className="sidebar__item-label">{item.label}</span>
                    {item.key === "incidents" && badgeCount > 0 && (
                        <span
                            className="sidebar__badge"
                            aria-label={badgeLabel ?? `${badgeCount} incidencias`}
                        >
                          {badgeCount}
                        </span>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        <footer className="sidebar__user">
          <Avatar name={userName} size="md" />
          <span className="sidebar__user-meta">
            <strong className="sidebar__user-name">{userName}</strong>
            <span className="sidebar__user-role">{ROLE_LABEL[role]}</span>
          </span>
          <button
            type="button"
            className="sidebar__logout"
            onClick={onLogout}
            aria-label="Salir de la sesión"
            title="Salir"
          >
            <LogOut size={18} aria-hidden="true" />
          </button>
        </footer>
      </aside>
    </>
  );
}