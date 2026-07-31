interface LogoProps {
  className?: string;
}

/**
 * Marca de r0lm0.dev — documento/reporte con esquina doblada,
 * líneas de texto y cursor de terminal. Nada de gotas.
 */
export function Logo({ className = "h-7 w-7" }: LogoProps) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      aria-label="Logo r0lm0.dev"
      className={className}
    >
      <rect
        x="1"
        y="1"
        width="30"
        height="30"
        rx="8"
        fill="rgba(46, 124, 246, 0.14)"
        stroke="#2E7CF6"
        strokeWidth="1.6"
      />
      <path
        d="M11 7.5H19.5L23.5 11.5V24.5H11V7.5Z"
        stroke="#F1F5F9"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
      <path
        d="M19.5 7.5V11.5H23.5"
        stroke="#F1F5F9"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
      <line x1="13.6" y1="14.6" x2="20.9" y2="14.6" stroke="#2E7CF6" strokeWidth="1.6" strokeLinecap="round" />
      <line x1="13.6" y1="17.6" x2="20.9" y2="17.6" stroke="#2E7CF6" strokeWidth="1.6" strokeLinecap="round" />
      <line x1="13.6" y1="20.6" x2="17.4" y2="20.6" stroke="#2E7CF6" strokeWidth="1.6" strokeLinecap="round" />
      <rect x="19" y="19.9" width="2.6" height="1.7" fill="#2E7CF6" />
    </svg>
  );
}
