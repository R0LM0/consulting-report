"use client";

import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";
import { CheckIcon } from "@/components/icons";

export function SaveSettingsButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      <CheckIcon />
      {pending ? "Guardando…" : "Guardar ajustes"}
    </Button>
  );
}
