"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ActivityItem, type ActivityItemData } from "./activity-item";
import { ClipboardIcon } from "@/components/icons";

export interface ActivityGroup {
  key: string;
  label: string;
  items: ActivityItemData[];
}

export function ActivityList({
  groups,
  emptyMessage,
}: {
  groups: ActivityGroup[];
  emptyMessage: string;
}) {
  const total = groups.reduce((sum, g) => sum + g.items.length, 0);

  if (total === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-slate-300 bg-white/60 py-12 text-center"
      >
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-50 text-xl text-brand-400">
          <ClipboardIcon />
        </span>
        <p className="max-w-xs text-sm text-slate-500">{emptyMessage}</p>
      </motion.div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {groups.map((group) => (
        <section key={group.key} className="flex flex-col gap-2">
          <div className="flex items-center gap-2 px-1">
            <h2 className="font-mono text-xs font-bold uppercase tracking-wider text-slate-500">
              {group.label}
            </h2>
            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold tabular-nums text-slate-500">
              {group.items.length}
            </span>
          </div>
          <motion.ul layout className="flex flex-col gap-2">
            <AnimatePresence initial={false}>
              {group.items.map((activity) => (
                <motion.li
                  key={activity.id}
                  layout
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -24, transition: { duration: 0.2 } }}
                  transition={{ type: "spring", stiffness: 380, damping: 32 }}
                >
                  <ActivityItem activity={activity} />
                </motion.li>
              ))}
            </AnimatePresence>
          </motion.ul>
        </section>
      ))}
    </div>
  );
}
