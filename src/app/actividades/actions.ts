"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getCurrentUserId } from "@/lib/auth-user";
import { prisma } from "@/lib/prisma";
import { parseDateInputUTC } from "@/lib/months";

async function requireUserId(): Promise<string> {
  const userId = await getCurrentUserId();
  if (!userId) {
    redirect("/login");
  }
  return userId;
}

function readActivityFields(formData: FormData) {
  const date = formData.get("date");
  const description = formData.get("description");

  if (typeof date !== "string" || !date) {
    throw new Error("La fecha es obligatoria.");
  }
  if (typeof description !== "string" || !description.trim()) {
    throw new Error("La descripción es obligatoria.");
  }

  return { date: parseDateInputUTC(date), description: description.trim() };
}

export async function createActivity(formData: FormData): Promise<void> {
  const userId = await requireUserId();
  const { date, description } = readActivityFields(formData);

  await prisma.activity.create({
    data: { date, description, userId },
  });

  revalidatePath("/actividades");
}

export async function updateActivity(formData: FormData): Promise<void> {
  const userId = await requireUserId();
  const id = formData.get("id");
  if (typeof id !== "string" || !id) {
    throw new Error("Falta el identificador de la actividad.");
  }
  const { date, description } = readActivityFields(formData);

  await prisma.activity.update({
    where: { id, userId },
    data: { date, description },
  });

  revalidatePath("/actividades");
}

export async function deleteActivity(formData: FormData): Promise<void> {
  const userId = await requireUserId();
  const id = formData.get("id");
  if (typeof id !== "string" || !id) {
    throw new Error("Falta el identificador de la actividad.");
  }

  await prisma.activity.delete({ where: { id, userId } });

  revalidatePath("/actividades");
}
