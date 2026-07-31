"use client";

import { AnimatePresence, motion } from "framer-motion";

/**
 * Full-screen "generando tu archivo" overlay. Shown while a download is
 * being fetched so the user knows work is in progress and doesn't
 * double-click (which used to produce duplicate downloads on slow
 * connections).
 */
export function LoadingModal({
  open,
  title,
  subtitle = "Esto puede tardar unos segundos, no cierres la ventana.",
}: {
  open: boolean;
  title: string;
  subtitle?: string;
}) {
  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 8 }}
            transition={{ type: "spring", stiffness: 380, damping: 30 }}
            className="flex w-full max-w-xs flex-col items-center gap-4 rounded-2xl border border-white/10 bg-[#111722] p-8 text-center shadow-2xl"
          >
            <span className="h-10 w-10 animate-spin rounded-full border-[3px] border-brand-500/20 border-t-brand-400" />
            <div>
              <p className="text-sm font-semibold text-slate-100">{title}</p>
              <p className="mt-1 text-xs text-slate-400">{subtitle}</p>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

/** Fetches a file URL and saves it via a temporary anchor. Returns the
 * suggested filename from Content-Disposition, or the fallback. */
export async function downloadFile(
  url: string,
  fallbackFilename: string
): Promise<void> {
  const res = await fetch(url);
  if (!res.ok) {
    let message = `Error ${res.status}`;
    try {
      const data = await res.json();
      if (data?.error) message = data.error;
    } catch {
      // respuesta no-JSON, nos quedamos con el status
    }
    throw new Error(message);
  }
  const blob = await res.blob();
  const disposition = res.headers.get("Content-Disposition") ?? "";
  const match = disposition.match(/filename="(.+?)"/);
  const objectUrl = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = objectUrl;
  anchor.download = match?.[1] ?? fallbackFilename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(objectUrl);
}
