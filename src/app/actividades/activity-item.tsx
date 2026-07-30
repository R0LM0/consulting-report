"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { updateActivity, deleteActivity } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

export interface ActivityItemData {
  id: string;
  dateInputValue: string;
  dateDisplay: string;
  description: string;
}

export function ActivityItem({ activity }: { activity: ActivityItemData }) {
  const [isEditing, setIsEditing] = useState(false);

  return (
    <div className="rounded-xl border border-slate-200/80 bg-white shadow-sm transition-shadow hover:shadow-card">
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
            className="flex flex-col gap-2 p-3 sm:flex-row sm:items-center"
          >
            <input type="hidden" name="id" value={activity.id} />
            <Input
              type="date"
              name="date"
              defaultValue={activity.dateInputValue}
              required
              aria-label="Fecha"
              className="sm:w-auto"
            />
            <Input
              type="text"
              name="description"
              defaultValue={activity.description}
              required
              aria-label="Descripción"
              className="flex-1"
            />
            <div className="flex gap-2">
              <Button size="sm">Guardar</Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsEditing(false)}
              >
                Cancelar
              </Button>
            </div>
          </motion.form>
        ) : (
          <motion.div
            key="view"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="flex flex-col gap-2 p-3 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="flex flex-1 items-center gap-3">
              <Badge tone="brand" className="shrink-0 tabular-nums">
                {activity.dateDisplay}
              </Badge>
              <span className="text-sm text-slate-800">
                {activity.description}
              </span>
            </div>
            <div className="flex shrink-0 gap-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setIsEditing(true)}
              >
                Editar
              </Button>
              <form action={deleteActivity}>
                <input type="hidden" name="id" value={activity.id} />
                <Button variant="danger" size="sm">
                  Eliminar
                </Button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
