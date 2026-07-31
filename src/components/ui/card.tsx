import type { ReactNode } from "react";

export function Card({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-2xl border border-white/[0.07] bg-[#111722] p-6 shadow-card ${className}`}
    >
      {children}
    </div>
  );
}

export function CardHeader({
  title,
  description,
  icon,
  action,
}: {
  title: string;
  description?: string;
  icon?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="mb-5 flex items-start justify-between gap-4">
      <div className="flex items-center gap-3">
        {icon ? (
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-500/10 text-brand-400">
            {icon}
          </span>
        ) : null}
        <div>
          <h2 className="text-sm font-semibold text-slate-100">{title}</h2>
          {description ? (
            <p className="mt-0.5 text-xs text-slate-400">{description}</p>
          ) : null}
        </div>
      </div>
      {action}
    </div>
  );
}
