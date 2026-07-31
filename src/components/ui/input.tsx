import type {
  InputHTMLAttributes,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from "react";

const baseFieldClasses =
  "rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 transition-shadow focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-400/20";

export function Input({
  className = "",
  ...props
}: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={`${baseFieldClasses} ${className}`} {...props} />;
}

export function Select({
  className = "",
  ...props
}: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={`${baseFieldClasses} cursor-pointer pr-8 ${className}`}
      {...props}
    />
  );
}

export function Textarea({
  className = "",
  rows = 4,
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      rows={rows}
      className={`${baseFieldClasses} resize-y leading-relaxed ${className}`}
      {...props}
    />
  );
}

export function Field({
  label,
  htmlFor,
  children,
  className = "",
}: {
  label: string;
  htmlFor: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      <label
        htmlFor={htmlFor}
        className="text-xs font-medium tracking-wide text-slate-400"
      >
        {label}
      </label>
      {children}
    </div>
  );
}
