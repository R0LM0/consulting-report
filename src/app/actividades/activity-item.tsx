"use client";

import { useLayoutEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { updateActivity, deleteActivity } from "./actions";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  CheckIcon,
  PencilIcon,
  TrashIcon,
  XIcon,
} from "@/components/icons";

export interface ActivityItemData {
  id: string;
  dateInputValue: string;
  dateDisplay: string;
  description: string;
}

/** Shows the first 3 lines; a toggle appears only when the text overflows. */
function ClampedText({ text }: { text: string }) {
  const ref = useRef<HTMLParagraphElement>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isOverflowing, setIsOverflowing] = useState(false);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const measure = () => {
      if (!isExpanded) setIsOverflowing(el.scrollHeight > el.clientHeight + 1);
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, [text, isExpanded]);

  return (
    <div className="min-w-0 flex-1">
      <p
        ref={ref}
        className={`text-sm leading-relaxed whitespace-pre-line text-slate-200 ${
          isExpanded ? "" : "line-clamp-3"
        }`}
      >
        {text}
      </p>
      {isOverflowing || isExpanded ? (
        <button
          type="button"
          onClick={() => setIsExpanded((v) => !v)}
          aria-expanded={isExpanded}
          className="mt-1 cursor-pointer text-xs font-semibold text-brand-400 hover:text-brand-300"
        >
          {isExpanded ? "Ver menos" : "Ver más"}
        </button>
      ) : null}
    </div>
  );
}

const iconButtonBase =
  "cursor-pointer rounded-lg p-2 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2";

export function ActivityItem({ activity }: { activity: ActivityItemData }) {
  const [isEditing, setIsEditing] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  return (
    <div className="rounded-xl border border-white/[0.07] bg-[#111722] transition-colors hover:border-white/[0.14]">
      <AnimatePresence mode="wait" initial={false}>
        {isEditing ? (
          <motion.form
            key="edit"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            action={async (formData) => {
              await updateActivity(formData);
              setIsEditing(false);
            }}
            className="flex flex-col gap-2.5 p-3"
          >
            <input type="hidden" name="id" value={activity.id} />
            <Input
              type="date"
              name="date"
              defaultValue={activity.dateInputValue}
              required
              aria-label="Fecha"
              className="sm:max-w-44"
            />
            <Textarea
              name="description"
              defaultValue={activity.description}
              required
              rows={3}
              aria-label="Descripción"
            />
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsEditing(false)}
              >
                Cancelar
              </Button>
              <Button size="sm">Guardar</Button>
            </div>
          </motion.form>
        ) : (
          <motion.div
            key="view"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="flex items-start gap-3 p-3"
          >
            <Badge tone="brand" className="mt-0.5 shrink-0 tabular-nums">
              {activity.dateDisplay}
            </Badge>
            <ClampedText text={activity.description} />
            <div className="flex shrink-0 items-center gap-1">
              <AnimatePresence mode="wait" initial={false}>
                {confirmingDelete ? (
                  <motion.span
                    key="confirm"
                    initial={{ opacity: 0, x: 8 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 8 }}
                    transition={{ duration: 0.15 }}
                    className="flex items-center gap-1"
                  >
                    <span className="mr-1 hidden text-xs font-medium text-red-300 sm:inline">
                      ¿Eliminar?
                    </span>
                    <form action={deleteActivity}>
                      <input type="hidden" name="id" value={activity.id} />
                      <motion.button
                        type="submit"
                        title="Confirmar eliminación"
                        aria-label="Confirmar eliminación"
                        whileTap={{ scale: 0.9 }}
                        className={`${iconButtonBase} bg-red-500/10 text-red-300 hover:bg-red-500/20 focus-visible:outline-red-400`}
                      >
                        <CheckIcon className="text-base" />
                      </motion.button>
                    </form>
                    <motion.button
                      type="button"
                      title="Cancelar"
                      aria-label="Cancelar eliminación"
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setConfirmingDelete(false)}
                      className={`${iconButtonBase} text-slate-400 hover:bg-white/[0.06] hover:text-slate-200 focus-visible:outline-slate-400`}
                    >
                      <XIcon className="text-base" />
                    </motion.button>
                  </motion.span>
                ) : (
                  <motion.span
                    key="actions"
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -8 }}
                    transition={{ duration: 0.15 }}
                    className="flex items-center gap-1"
                  >
                    <motion.button
                      type="button"
                      title="Editar"
                      aria-label="Editar actividad"
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setIsEditing(true)}
                      className={`${iconButtonBase} text-slate-400 hover:bg-brand-500/10 hover:text-brand-300 focus-visible:outline-brand-400`}
                    >
                      <PencilIcon className="text-base" />
                    </motion.button>
                    <motion.button
                      type="button"
                      title="Eliminar"
                      aria-label="Eliminar actividad"
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setConfirmingDelete(true)}
                      className={`${iconButtonBase} text-slate-400 hover:bg-red-500/10 hover:text-red-300 focus-visible:outline-red-400`}
                    >
                      <TrashIcon className="text-base" />
                    </motion.button>
                  </motion.span>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
