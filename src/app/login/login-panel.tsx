"use client";

import { motion } from "framer-motion";
import { AsciiDroplet } from "@/components/ascii-droplet";

const EASE = [0.22, 1, 0.36, 1] as const;

const FEATURES = [
  { cmd: "registro", text: "Anota cada actividad en segundos, desde la PC o el móvil." },
  { cmd: "informe", text: ".docx institucional con membrete y numeración automática." },
  { cmd: "recibo", text: ".xlsx con número correlativo, monto y fecha en un clic." },
];

const darkInputClasses =
  "w-full rounded-none border border-white/20 bg-transparent px-3 py-2.5 font-mono text-sm text-white placeholder:text-slate-600 transition-colors focus:border-brand-400 focus:outline-none";

export function LoginPanel({
  authenticate,
  error,
}: {
  authenticate: (formData: FormData) => Promise<void>;
  error?: string;
}) {
  return (
    <div className="min-h-screen bg-[#050505] font-mono text-slate-300">
      {/* Nav superior */}
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-5">
        <span className="text-xs font-bold uppercase tracking-[0.25em] text-white">
          R0LM0<span className="text-brand-400">.</span>DEV
        </span>
        <nav className="hidden gap-6 text-[10px] uppercase tracking-[0.2em] text-slate-500 sm:flex">
          <span>Registro</span>
          <span>Informe</span>
          <span>Recibo</span>
        </nav>
      </header>

      <main className="mx-auto grid w-full max-w-6xl items-center gap-10 px-6 pb-16 pt-6 lg:min-h-[calc(100vh-4.5rem)] lg:grid-cols-2 lg:gap-14 lg:pt-0">
        {/* Hero izquierdo */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: EASE }}
        >
          <p className="text-xs text-brand-400/80">
            {"// sistema de reportes mensuales"}
          </p>
          <h1 className="mt-4 text-4xl font-bold uppercase leading-[0.95] tracking-tight text-white sm:text-5xl">
            Tu mes de
            <br />
            trabajo,
            <br />
            <span className="text-brand-400">bien</span>
            <br />
            <span className="text-brand-400">documentado</span>
          </h1>
          <p className="mt-6 max-w-md text-sm leading-relaxed text-slate-400">
            Registra tus actividades día a día y genera tu informe y tu recibo
            con el formato institucional, sin pelearte con Word ni Excel.
          </p>

          <ul className="mt-8 flex flex-col gap-3">
            {FEATURES.map((feature, i) => (
              <motion.li
                key={feature.cmd}
                initial={{ opacity: 0, x: -14 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.3 + i * 0.12, ease: EASE }}
                className="flex items-baseline gap-3 text-xs"
              >
                <span className="shrink-0 text-brand-400">
                  &gt; {feature.cmd}
                </span>
                <span className="text-slate-500">{feature.text}</span>
              </motion.li>
            ))}
          </ul>

          <p className="mt-10 text-[10px] uppercase tracking-[0.2em] text-slate-600">
            Managua, Nicaragua — v1.0
          </p>
        </motion.div>

        {/* Columna derecha: arte ASCII + formulario */}
        <div className="flex flex-col items-center gap-8">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="hidden lg:block"
          >
            <AsciiDroplet className="text-[9px] text-brand-400/70" />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.15, ease: EASE }}
            className="w-full max-w-sm"
          >
            <div className="border border-white/15 bg-white/[0.03] p-8">
              <h2 className="text-sm font-bold uppercase tracking-[0.25em] text-white">
                Iniciar sesión
              </h2>
              <p className="mt-1.5 text-xs text-slate-500">
                Ingresa tus credenciales para continuar
              </p>

              <form action={authenticate} className="mt-6 flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <label
                    htmlFor="email"
                    className="text-[10px] uppercase tracking-[0.2em] text-slate-500"
                  >
                    Correo electrónico
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    autoComplete="email"
                    placeholder="tucorreo@ejemplo.com"
                    className={darkInputClasses}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label
                    htmlFor="password"
                    className="text-[10px] uppercase tracking-[0.2em] text-slate-500"
                  >
                    Contraseña
                  </label>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    required
                    autoComplete="current-password"
                    placeholder="••••••••"
                    className={darkInputClasses}
                  />
                </div>

                {error ? (
                  <motion.p
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="border border-red-500/40 bg-red-500/10 px-3 py-2 text-xs text-red-300"
                  >
                    [error] Correo o contraseña incorrectos.
                  </motion.p>
                ) : null}

                <motion.button
                  type="submit"
                  whileTap={{ scale: 0.98 }}
                  className="mt-2 w-full cursor-pointer bg-brand-600 px-4 py-3 text-xs font-bold uppercase tracking-[0.25em] text-white transition-colors hover:bg-brand-500"
                >
                  Entrar
                </motion.button>
              </form>
            </div>

            <p className="mt-5 text-center text-[10px] uppercase tracking-[0.2em] text-slate-600">
              registro · informe · recibo
            </p>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
