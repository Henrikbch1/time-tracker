import { NavLink } from "react-router-dom";
import { useLanguage } from "../../context/LanguageContext";
import { useTracker } from "../../context/TrackerContext";
import t from "../../i18n";
import { NAV_ITEMS } from "./Sidebar";

/** Thumb-friendly tab bar for phones; the sidebar takes over from `lg`. */
export default function BottomNav() {
  const { language } = useLanguage();
  const { activeSession } = useTracker();

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-4 border-t lg:hidden"
      style={{
        background: "color-mix(in srgb, var(--surface) 94%, transparent)",
        borderColor: "var(--border)",
        backdropFilter: "blur(10px)",
        paddingBottom: "env(safe-area-inset-bottom)",
      }}
    >
      {NAV_ITEMS.map(({ to, labelKey, Icon }) => (
        <NavLink
          key={to}
          to={to}
          end={to === "/"}
          className="flex flex-col items-center gap-1 py-2.5 text-[0.7rem] font-medium"
        >
          {({ isActive }) => (
            <>
              <span
                className="relative flex h-8 w-14 items-center justify-center rounded-full transition"
                style={{
                  background: isActive ? "var(--primary-soft)" : "transparent",
                  color: isActive ? "var(--primary)" : "var(--text-muted)",
                }}
              >
                <Icon className="h-5 w-5" />
                {to === "/" && activeSession ? (
                  <span
                    className="absolute right-3 top-1 h-2 w-2 animate-pulse rounded-full"
                    style={{ background: "var(--success)" }}
                  />
                ) : null}
              </span>
              <span
                style={{
                  color: isActive ? "var(--primary)" : "var(--text-muted)",
                }}
              >
                {t(labelKey, language)}
              </span>
            </>
          )}
        </NavLink>
      ))}
    </nav>
  );
}
