import type { ReactNode } from "react";

interface KpiCardProps {
  label: string;
  value: string;
  hint?: string;
  icon?: ReactNode;
  accent?: string;
  live?: boolean;
}

export function KpiCard({
  label,
  value,
  hint,
  icon,
  accent,
  live,
}: KpiCardProps) {
  const tint = accent ?? "var(--primary)";
  return (
    <article className="stat-tile flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <p className="eyebrow">{label}</p>
        {icon ? (
          <span
            className="flex h-9 w-9 items-center justify-center rounded-xl"
            style={{
              background: `color-mix(in srgb, ${tint} 14%, transparent)`,
              color: tint,
            }}
          >
            {icon}
          </span>
        ) : null}
      </div>
      <p
        className="mono-face text-2xl font-semibold sm:text-3xl"
        style={{ color: "var(--text)" }}
      >
        {value}
        {live ? (
          <span
            className="ml-2 inline-block h-2.5 w-2.5 animate-pulse rounded-full align-middle"
            style={{ background: "var(--success)" }}
          />
        ) : null}
      </p>
      {hint ? (
        <p className="text-xs" style={{ color: "var(--text-subtle)" }}>
          {hint}
        </p>
      ) : null}
    </article>
  );
}

export default KpiCard;
