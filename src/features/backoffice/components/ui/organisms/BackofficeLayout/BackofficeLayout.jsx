import { useState, useEffect } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import SideBar from "../SideBar/SideBar.jsx";
import StickyHero from "../StickyHero/StickyHero.jsx";
import { useAuthStore } from "../../../../../auth/store/authStore.js";
import {
  getInitialTheme,
  setTheme,
} from "../../../../../../shared/utils/theme.js";
import { NAV_BY_ROLE, ROLES } from "../../../../../../shared/constants/nav.js";
import { listIncidents } from "../../../../services/incidentApi.js";
import "./BackofficeLayout.scss";

const ROUTE_TO_KEY = {
  "/backoffice": "incidents",
  "/backoffice/incidencias": "incidents",
  "/backoffice/nueva-incidencia": "new-incident",
  "/backoffice/alojamientos": "lodgings",
  "/backoffice/usuarios": "users",
  "/backoffice/perfil": "profile",
};

const KEY_TO_PATH = Object.values(NAV_BY_ROLE)
  .flat()
  .reduce((acc, item) => {
    if (!(item.key in acc)) acc[item.key] = item.path;
    return acc;
  }, {});

export default function BackofficeLayout() {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const navigate = useNavigate();
  const location = useLocation();

  const [theme, setThemeState] = useState(getInitialTheme);
  const [menuOpen, setMenuOpen] = useState(false);

  const items = NAV_BY_ROLE[user.role] || [];
  const activeKey = ROUTE_TO_KEY[location.pathname] ?? "";
  const activeItem = items.find((i) => i.key === activeKey);

  const userName = `${user.firstName} ${user.lastName}`.trim();

  const [badgeCount, setBadgeCount] = useState(0);
  const [badgeLabel, setBadgeLabel] = useState("");
  useEffect(() => {
    let active = true;
    const isOperator = user.role === ROLES.OPERATOR;
    const params = isOperator
      ? { scope: "MINE", size: 1 }
      : { status: "NEW", size: 1 };
    listIncidents(params)
      .then((res) => {
        if (!active) return;
        const c = res.counters ?? {};
        const count = isOperator
          ? (c.ASSIGNED ?? 0) + (c.IN_PROGRESS ?? 0) + (c.PAUSED ?? 0)
          : (c.NEW ?? 0);
        setBadgeCount(count);
        setBadgeLabel(
          isOperator
            ? `${count} incidencias asignadas a ti`
            : `${count} incidencias nuevas`,
        );
      })
      .catch(() => {
        if (active) {
          setBadgeCount(0);
          setBadgeLabel("");
        }
      });
    return () => {
      active = false;
    };
  }, [location.pathname, user.role]);

  function toggleTheme() {
    const next = theme === "dark" ? "light" : "dark";
    setThemeState(next);
    setTheme(next);
  }

  function handleSelect(key) {
    const path = KEY_TO_PATH[key];
    if (path) navigate(path);
    setMenuOpen(false);
  }

  function handleLogout() {
    logout();
    navigate("/login");
  }

  return (
    <div className="backoffice-layout">
      <a className="skip-link" href="#backoffice-content">
        Saltar al contenido
      </a>
      <SideBar
        role={user.role}
        activeItem={activeKey}
        onSelect={handleSelect}
        userName={userName}
        onLogout={handleLogout}
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        badgeCount={badgeCount}
        badgeLabel={badgeLabel}
      />
      <div className="backoffice-layout__main">
        <StickyHero
          title={
            activeItem?.label ??
            (location.pathname.startsWith("/backoffice/incidencias/")
              ? "Detalle de incidencia"
              : "")
          }
          subtitle={activeItem?.subtitle ?? ""}
          theme={theme}
          onToggleTheme={toggleTheme}
          onMenuClick={() => setMenuOpen(true)}
        />
        <main className="backoffice-layout__content" id="backoffice-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}