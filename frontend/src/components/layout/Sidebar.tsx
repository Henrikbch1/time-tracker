import { NavLink } from "react-router-dom";
import { useLanguage } from "../../context/LanguageContext";
import t from "../../i18n";
import {
  ChartIcon,
  ClockIcon,
  CloseIcon,
  DashboardIcon,
  SettingsIcon,
} from "../icons";
import type { Key } from "../../i18n";

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

interface NavItem {
  to: string;
  labelKey: Key;
  Icon: (props: { className?: string }) => React.ReactElement;
}

const NAV_ITEMS: NavItem[] = [
  { to: "/", labelKey: "navDashboard", Icon: DashboardIcon },
  { to: "/track", labelKey: "navTracking", Icon: ClockIcon },
  { to: "/reports", labelKey: "navReports", Icon: ChartIcon },
  { to: "/settings", labelKey: "navSettings", Icon: SettingsIcon },
];

export function Sidebar({ open, onClose }: SidebarProps) {
  const { language } = useLanguage();

  return (
    <>
      {/* Mobile backdrop */}
      <button
        type="button"
        aria-hidden={!open}
        tabIndex={-1}
        onClick={onClose}
        className={`fixed inset-0 z-30 bg-slate-900/40 backdrop-blur-sm transition-opacity lg:hidden ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />

      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-[264px] flex-col border-r px-4 py-5 transition-transform duration-200 lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
        style={{
          background: "var(--surface)",
          borderColor: "var(--border)",
        }}
      >
        <div className="flex items-center justify-between px-2">
          <div className="flex items-center gap-2.5">
            <span
              className="flex h-9 w-9 items-center justify-center rounded-xl text-white"
              style={{ background: "var(--primary)" }}
            >
              <ClockIcon className="h-5 w-5" />
            </span>
            <div className="leading-tight">
              <p
                className="display-face text-base font-bold"
                style={{ color: "var(--text)" }}
              >
                {t("appName", language)}
              </p>
              <p
                className="text-[0.7rem]"
                style={{ color: "var(--text-subtle)" }}
              >
                {t("appTagline", language)}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="ghost-button lg:hidden"
            aria-label={t("closeMenu", language)}
          >
            <CloseIcon className="h-5 w-5" />
          </button>
        </div>

        <nav className="mt-7 flex flex-1 flex-col gap-1">
          {NAV_ITEMS.map(({ to, labelKey, Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === "/"}
              onClick={onClose}
              className="sidebar-link"
            >
              {({ isActive }) => (
                <span
                  className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition"
                  style={{
                    background: isActive
                      ? "var(--primary-soft)"
                      : "transparent",
                    color: isActive ? "var(--primary)" : "var(--text-muted)",
                  }}
                >
                  <Icon className="h-5 w-5" />
                  {t(labelKey, language)}
                </span>
              )}
            </NavLink>
          ))}
        </nav>

        <div
          className="mt-4 rounded-xl px-3 py-3 text-xs"
          style={{
            background: "var(--surface-2)",
            color: "var(--text-subtle)",
          }}
        >
          {t("signedInLocally", language)}
        </div>
      </aside>
    </>
  );
}

export default Sidebar;
