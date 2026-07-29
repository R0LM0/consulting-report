"use client";

import { useState } from "react";
import { updateActivity, deleteActivity } from "./actions";

export interface ActivityItemData {
  id: string;
  dateInputValue: string;
  dateDisplay: string;
  description: string;
}

export function ActivityItem({ activity }: { activity: ActivityItemData }) {
  const [isEditing, setIsEditing] = useState(false);

  if (isEditing) {
    return (
      <form
        action={async (formData) => {
          await updateActivity(formData);
          setIsEditing(false);
        }}
        className="flex flex-col gap-2 rounded-md border border-gray-300 bg-white p-3 sm:flex-row sm:items-center"
      >
        <input type="hidden" name="id" value={activity.id} />
        <input
          type="date"
          name="date"
          defaultValue={activity.dateInputValue}
          required
          className="rounded-md border border-gray-300 px-2 py-1 text-sm text-gray-900"
        />
        <input
          type="text"
          name="description"
          defaultValue={activity.description}
          required
          className="flex-1 rounded-md border border-gray-300 px-2 py-1 text-sm text-gray-900"
        />
        <div className="flex gap-2">
          <button
            type="submit"
            className="rounded-md bg-gray-900 px-3 py-1 text-sm font-medium text-white hover:bg-gray-800"
          >
            Guardar
          </button>
          <button
            type="button"
            onClick={() => setIsEditing(false)}
            className="rounded-md border border-gray-300 px-3 py-1 text-sm text-gray-700 hover:bg-gray-100"
          >
            Cancelar
          </button>
        </div>
      </form>
    );
  }

  return (
    <div className="flex flex-col gap-2 rounded-md border border-gray-200 bg-white p-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-1 gap-3">
        <span className="shrink-0 text-sm font-medium text-gray-500">
          {activity.dateDisplay}
        </span>
        <span className="text-sm text-gray-900">{activity.description}</span>
      </div>
      <div className="flex shrink-0 gap-2">
        <button
          type="button"
          onClick={() => setIsEditing(true)}
          className="rounded-md border border-gray-300 px-3 py-1 text-sm text-gray-700 hover:bg-gray-100"
        >
          Editar
        </button>
        <form action={deleteActivity}>
          <input type="hidden" name="id" value={activity.id} />
          <button
            type="submit"
            className="rounded-md border border-red-300 px-3 py-1 text-sm text-red-700 hover:bg-red-50"
          >
            Eliminar
          </button>
        </form>
      </div>
    </div>
  );
}
