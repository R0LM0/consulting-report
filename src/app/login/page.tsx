import { redirect } from "next/navigation";
import { AuthError } from "next-auth";
import { signIn } from "@/auth";
import { Button } from "@/components/ui/button";
import { FadeIn } from "@/components/ui/fade-in";
import { Field, Input } from "@/components/ui/input";
import { DropletIcon } from "@/components/icons";

async function authenticate(formData: FormData) {
  "use server";

  try {
    await signIn("credentials", {
      email: formData.get("email"),
      password: formData.get("password"),
      redirectTo: "/",
    });
  } catch (error) {
    if (error instanceof AuthError) {
      redirect("/login?error=1");
    }
    throw error;
  }
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-brand-950 px-4">
      <div className="pointer-events-none absolute -left-32 -top-32 h-96 w-96 rounded-full bg-brand-600/30 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -right-24 h-96 w-96 rounded-full bg-cyan-500/20 blur-3xl" />

      <FadeIn className="relative w-full max-w-sm">
        <div className="rounded-2xl border border-white/10 bg-white p-8 shadow-2xl shadow-brand-950/50">
          <div className="mb-8 flex flex-col items-center gap-3 text-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 text-3xl text-white shadow-lg shadow-brand-600/40">
              <DropletIcon />
            </span>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-slate-900">
                ENACAL · Reportes
              </h1>
              <p className="mt-1 text-sm text-slate-500">
                Inicia sesión para registrar tus actividades
              </p>
            </div>
          </div>

          <form action={authenticate} className="flex flex-col gap-4">
            <Field label="Correo electrónico" htmlFor="email">
              <Input
                id="email"
                name="email"
                type="email"
                required
                autoComplete="email"
                placeholder="tucorreo@ejemplo.com"
              />
            </Field>
            <Field label="Contraseña" htmlFor="password">
              <Input
                id="password"
                name="password"
                type="password"
                required
                autoComplete="current-password"
                placeholder="••••••••"
              />
            </Field>
            {error ? (
              <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                Correo o contraseña incorrectos.
              </p>
            ) : null}
            <Button size="lg" className="mt-2 w-full">
              Entrar
            </Button>
          </form>
        </div>
        <p className="mt-6 text-center text-xs text-brand-300/70">
          Registro de actividades · Informe mensual · Recibo
        </p>
      </FadeIn>
    </div>
  );
}
