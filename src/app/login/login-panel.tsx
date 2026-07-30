"use client";

import { motion } from "framer-motion";
import {
  ClipboardIcon,
  DropletIcon,
  FileTextIcon,
  ReceiptIcon,
  SparklesIcon,
} from "@/components/icons";

const EASE = [0.22, 1, 0.36, 1] as const;

const darkInputClasses =
  "w-full rounded-lg border border-white/10 bg-white/5 px-3.5 py-2.5 text-sm text-white placeholder:text-slate-500 transition-shadow focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-400/25";

const FEATURES = [
  {
    icon: <ClipboardIcon className="text-lg" />,
    title: "Registro diario en segundos",
    text: "Anota cada actividad desde la computadora o el móvil.",
  },
  {
    icon: <FileTextIcon className="text-lg" />,
    title: "Informe institucional automático",
    text: "Tu .docx con membrete y numeración, generado al cierre del mes.",
  },
  {
    icon: <ReceiptIcon className="text-lg" />,
    title: "Recibo listo para entregar",
    text: "El .xlsx con número, monto y fecha en un clic.",
  },
];

function Glows() {
  return (
    <>
      <motion.div
        animate={{ opacity: [0.45, 0.75, 0.45], scale: [1, 1.12, 1] }}
        transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
        className="pointer-events-none absolute -left-40 top-[-15%] h-[34rem] w-[34rem] rounded-full bg-brand-600/25 blur-3xl"
      />
      <motion.div
        animate={{ opacity: [0.3, 0.55, 0.3], scale: [1.1, 1, 1.1] }}
        transition={{ duration: 11, repeat: Infinity, ease: "easeInOut" }}
        className="pointer-events-none absolute bottom-[-20%] right-[-10%] h-[30rem] w-[30rem] rounded-full bg-cyan-500/15 blur-3xl"
      />
    </>
  );
}

export function LoginPanel({
  authenticate,
  error,
}: {
  authenticate: (formData: FormData) => Promise<void>;
  error?: string;
}) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#060b1c] lg:grid lg:grid-cols-2">
      <Glows />

      {/* Hero izquierdo (desktop) */}
      <div className="relative hidden flex-col justify-center px-12 xl:px-20 lg:flex">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: EASE }}
        >
          <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-500/10 px-3.5 py-1.5 text-xs font-medium text-brand-300 ring-1 ring-brand-400/25">
            <SparklesIcon />
            Registro · Informe · Recibo
          </span>
          <h1 className="mt-6 text-4xl font-bold leading-tight tracking-tight text-white xl:text-5xl">
            Tu mes de trabajo,
            <br />
            <span className="bg-gradient-to-r from-brand-400 via-brand-300 to-cyan-300 bg-clip-text text-transparent">
              bien documentado
            </span>
          </h1>
          <p className="mt-5 max-w-md text-base leading-relaxed text-slate-400">
            Registra tus actividades día a día y genera tu informe de
            actividades y tu recibo con el formato institucional, sin pelearte
            con Word ni Excel.
          </p>
        </motion.div>

        <div className="mt-10 flex flex-col gap-5">
          {FEATURES.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, x: -18 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.55, delay: 0.25 + i * 0.12, ease: EASE }}
              className="flex items-center gap-4"
            >
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-500/10 text-brand-300 ring-1 ring-brand-400/20">
                {feature.icon}
              </span>
              <div>
                <p className="text-sm font-semibold text-slate-100">
                  {feature.title}
                </p>
                <p className="text-xs text-slate-500">{feature.text}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Formulario */}
      <div className="relative flex min-h-screen items-center justify-center px-4 py-12 lg:min-h-0">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, delay: 0.15, ease: EASE }}
          className="w-full max-w-sm"
        >
          <div className="mb-8 flex flex-col items-center gap-3 text-center lg:hidden">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 text-2xl text-white shadow-lg shadow-brand-600/40">
              <DropletIcon />
            </span>
            <h1 className="text-lg font-bold text-white">ENACAL · Reportes</h1>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-8 shadow-2xl shadow-black/40 backdrop-blur-xl">
            <div className="mb-7">
              <span className="mb-4 hidden h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 text-2xl text-white shadow-lg shadow-brand-600/40 lg:flex">
                <DropletIcon />
              </span>
              <h2 className="text-xl font-bold text-white">
                Bienvenido de vuelta
              </h2>
              <p className="mt-1 text-sm text-slate-400">
                Inicia sesión para continuar
              </p>
            </div>

            <form action={authenticate} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="email"
                  className="text-xs font-medium text-slate-400"
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
                  className="text-xs font-medium text-slate-400"
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
                  className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300"
                >
                  Correo o contraseña incorrectos.
                </motion.p>
              ) : null}

              <motion.button
                type="submit"
                whileHover={{ y: -1 }}
                whileTap={{ scale: 0.98 }}
                className="mt-2 w-full cursor-pointer rounded-lg bg-gradient-to-r from-brand-500 to-brand-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-brand-600/30 transition-shadow hover:shadow-brand-500/40"
              >
                Entrar
              </motion.button>
            </form>
          </div>

          <p className="mt-6 text-center text-xs text-slate-600">
            Registro de actividades · Informe mensual · Recibo
          </p>
        </motion.div>
      </div>
    </div>
  );
}
