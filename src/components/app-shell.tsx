"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { useState, type ReactNode } from "react";
import {
  ClipboardIcon,
  DashboardIcon,
  FileTextIcon,
  LogOutIcon,
  MenuIcon,
  SettingsIcon,
  XIcon,
} from "@/components/icons";
import { Logo } from "@/components/logo";

interface NavItem {
  href: string;
  label: string;
  icon: ReactNode;
  exact?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  { href: "/", label: "panel", icon: <DashboardIcon className="text-lg" />, exact: true },
  { href: "/actividades", label: "actividades", icon: <ClipboardIcon className="text-lg" /> },
  { href: "/reportes", label: "reportes", icon: <FileTextIcon className="text-lg" /> },
  { href: "/perfil", label: "ajustes", icon: <SettingsIcon className="text-lg" /> },
];

/** Campo de caracteres ASCII tenue, mismo lenguaje que el login */
function AsciiField({ className = "" }: { className?: string }) {
  return (
    <pre
      aria-hidden
      className={`pointer-events-none select-none overflow-hidden font-mono leading-[1.35] tracking-[0.35em] text-brand-400/[0.07] ${className}`}
    >
      {Array.from({ length: 14 })
        .map((_, r) =>
          Array.from({ length: 16 })
            .map((_, c) => {
              const set = "·:.-+**=";
              const idx = (r * 7 + c * 13 + ((r * c) % 5)) % set.length;
              return set[idx];
            })
            .join(" ")
        )
        .join("\n")}
    </pre>
  );
}

function isActive(pathname: string, item: NavItem): boolean {
  return item.exact ? pathname === item.href : pathname.startsWith(item.href);
}

function Brand() {
  return (
    <Link href="/" className="relative z-10 flex items-center gap-3 px-2">
      <Logo className="h-9 w-9" />
      <span className="flex flex-col leading-tight">
        <span className="font-mono text-sm font-bold tracking-[0.2em] text-white">
          r0lm0<span className="text-brand-400">.</span>dev
        </span>
        <span className="font-mono text-[10px] tracking-[0.15em] text-brand-400/70">
          {"// reportes·mensuales"}
        </span>
      </span>
    </Link>
  );
}

function NavLinks({ pathname, onNavigate }: { pathname: string; onNavigate?: () => void }) {
  return (
    <nav className="relative z-10 flex flex-col gap-1">
      {NAV_ITEMS.map((item) => {
        const active = isActive(pathname, item);
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={`relative flex items-center gap-3 rounded-md px-3 py-2.5 font-mono text-[11px] font-medium tracking-[0.18em] transition-colors ${
              active
                ? "border border-brand-400/25 bg-brand-500/10 text-white"
                : "border border-transparent text-slate-500 hover:bg-white/[0.04] hover:text-slate-200"
            }`}
          >
            <span className={active ? "text-brand-400" : "text-slate-600"}>
              {active ? ">" : item.icon}
            </span>
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

function UserBlock({
  userName,
  userEmail,
  signOutAction,
}: {
  userName: string;
  userEmail: string;
  signOutAction: () => Promise<void>;
}) {
  const initials = userName
    .split(" ")
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="relative z-10 flex items-center gap-3 rounded-md border border-white/10 bg-white/[0.03] p-3">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-brand-400/30 bg-brand-500/15 font-mono text-xs font-bold text-brand-300">
        {initials || "?"}
      </span>
      <div className="min-w-0 flex-1 leading-tight">
        <p className="truncate text-xs font-semibold text-slate-200">{userName}</p>
        <p className="truncate font-mono text-[11px] text-slate-500">{userEmail}</p>
      </div>
      <form action={signOutAction}>
        <motion.button
          type="submit"
          title="Cerrar sesión"
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.92 }}
          className="cursor-pointer rounded-md p-2 text-slate-500 transition-colors hover:bg-white/[0.06] hover:text-white"
        >
          <LogOutIcon className="text-base" />
        </motion.button>
      </form>
    </div>
  );
}

export interface AppShellUser {
  name?: string | null;
  email?: string | null;
}

export function AppShell({
  user,
  signOutAction,
  children,
}: {
  user: AppShellUser;
  signOutAction: () => Promise<void>;
  children: ReactNode;
}) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const userName = user.name ?? user.email ?? "Usuario";
  const userEmail = user.email ?? "";

  return (
    <div className="min-h-screen bg-[#050505] text-slate-300">
      {/* Sidebar desktop */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col gap-8 overflow-hidden border-r border-white/10 bg-[#050505] px-4 py-6 lg:flex">
        <AsciiField className="absolute bottom-24 left-3 text-[10px]" />
        <Brand />
        <NavLinks pathname={pathname} />
        <div className="mt-auto">
          <UserBlock
            userName={userName}
            userEmail={userEmail}
            signOutAction={signOutAction}
          />
        </div>
      </aside>

      {/* Topbar móvil */}
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-white/10 bg-[#050505]/85 px-4 py-3 backdrop-blur lg:hidden">
        <span className="flex items-center gap-2.5">
          <Logo className="h-8 w-8" />
          <span className="font-mono text-sm font-bold tracking-[0.12em] text-white">
            r0lm0<span className="text-brand-400">.</span>dev
          </span>
        </span>
        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          aria-label="Abrir menú"
          className="cursor-pointer rounded-md p-2 text-slate-400 hover:bg-white/[0.06]"
        >
          <MenuIcon className="text-xl" />
        </button>
      </header>

      {/* Drawer móvil */}
      <AnimatePresence>
        {mobileOpen ? (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="fixed inset-0 z-40 bg-black/70 lg:hidden"
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", stiffness: 360, damping: 36 }}
              className="fixed inset-y-0 left-0 z-50 flex w-72 flex-col gap-8 overflow-hidden border-r border-white/10 bg-[#050505] px-4 py-6 lg:hidden"
            >
              <AsciiField className="absolute bottom-24 left-3 text-[10px]" />
              <div className="flex items-center justify-between">
                <Brand />
                <button
                  type="button"
                  onClick={() => setMobileOpen(false)}
                  aria-label="Cerrar menú"
                  className="cursor-pointer rounded-md p-2 text-slate-400 hover:bg-white/[0.06]"
                >
                  <XIcon className="text-lg" />
                </button>
              </div>
              <NavLinks pathname={pathname} onNavigate={() => setMobileOpen(false)} />
              <div className="mt-auto">
                <UserBlock
                  userName={userName}
                  userEmail={userEmail}
                  signOutAction={signOutAction}
                />
              </div>
            </motion.aside>
          </>
        ) : null}
      </AnimatePresence>

      {/* Contenido */}
      <main className="lg:pl-64">
        <motion.div
          key={pathname}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-4 py-8 sm:px-6 lg:px-10"
        >
          {children}
        </motion.div>
      </main>
    </div>
  );
}

export function PageHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-100">
          {title}
        </h1>
        {subtitle ? (
          <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
        ) : null}
      </div>
      {action}
    </div>
  );
}
