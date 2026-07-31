"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { useState, type ReactNode } from "react";
import {
  ClipboardIcon,
  DashboardIcon,
  DropletIcon,
  FileTextIcon,
  LogOutIcon,
  MenuIcon,
  SettingsIcon,
  XIcon,
} from "@/components/icons";

interface NavItem {
  href: string;
  label: string;
  icon: ReactNode;
  exact?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  { href: "/", label: "Panel", icon: <DashboardIcon className="text-lg" />, exact: true },
  { href: "/actividades", label: "Actividades", icon: <ClipboardIcon className="text-lg" /> },
  { href: "/reportes", label: "Reportes", icon: <FileTextIcon className="text-lg" /> },
  { href: "/perfil", label: "Ajustes", icon: <SettingsIcon className="text-lg" /> },
];

function isActive(pathname: string, item: NavItem): boolean {
  return item.exact ? pathname === item.href : pathname.startsWith(item.href);
}

function Brand() {
  return (
    <Link href="/" className="flex items-center gap-3 px-2">
      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 text-xl text-white shadow-md shadow-brand-600/30">
        <DropletIcon />
      </span>
      <span className="flex flex-col leading-tight">
        <span className="font-mono text-sm font-bold uppercase tracking-[0.2em] text-white">
          R0LM0.DEV
        </span>
        <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-brand-300">
          reportes·mensuales
        </span>
      </span>
    </Link>
  );
}

function NavLinks({ pathname, onNavigate }: { pathname: string; onNavigate?: () => void }) {
  return (
    <nav className="flex flex-col gap-1">
      {NAV_ITEMS.map((item) => {
        const active = isActive(pathname, item);
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={`relative flex items-center gap-3 rounded-xl px-3 py-2.5 font-mono text-[11px] font-medium uppercase tracking-[0.18em] transition-colors ${
              active ? "text-white" : "text-brand-200/70 hover:text-white"
            }`}
          >
            {active ? (
              <motion.span
                layoutId="nav-active-pill"
                transition={{ type: "spring", stiffness: 400, damping: 32 }}
                className="absolute inset-0 rounded-xl bg-white/10 ring-1 ring-white/15"
              />
            ) : null}
            <span className="relative z-10 flex items-center gap-3">
              {item.icon}
              {item.label}
            </span>
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
    <div className="flex items-center gap-3 rounded-xl bg-white/5 p-3 ring-1 ring-white/10">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-500/30 text-xs font-bold text-brand-100 ring-1 ring-brand-400/40">
        {initials || "?"}
      </span>
      <div className="min-w-0 flex-1 leading-tight">
        <p className="truncate text-xs font-semibold text-white">{userName}</p>
        <p className="truncate text-[11px] text-brand-300/80">{userEmail}</p>
      </div>
      <form action={signOutAction}>
        <motion.button
          type="submit"
          title="Cerrar sesión"
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.92 }}
          className="cursor-pointer rounded-lg p-2 text-brand-200/70 transition-colors hover:bg-white/10 hover:text-white"
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
    <div className="min-h-screen">
      {/* Sidebar desktop */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col gap-8 bg-brand-950 px-4 py-6 lg:flex">
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
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-slate-200/70 bg-white/80 px-4 py-3 backdrop-blur lg:hidden">
        <span className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-brand-500 to-brand-700 text-base text-white">
            <DropletIcon />
          </span>
          <span className="text-sm font-bold text-slate-900">R0LM0.DEV</span>
        </span>
        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          aria-label="Abrir menú"
          className="cursor-pointer rounded-lg p-2 text-slate-600 hover:bg-slate-100"
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
              className="fixed inset-0 z-40 bg-slate-950/50 lg:hidden"
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", stiffness: 360, damping: 36 }}
              className="fixed inset-y-0 left-0 z-50 flex w-72 flex-col gap-8 bg-brand-950 px-4 py-6 lg:hidden"
            >
              <div className="flex items-center justify-between">
                <Brand />
                <button
                  type="button"
                  onClick={() => setMobileOpen(false)}
                  aria-label="Cerrar menú"
                  className="cursor-pointer rounded-lg p-2 text-brand-200 hover:bg-white/10"
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
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
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
