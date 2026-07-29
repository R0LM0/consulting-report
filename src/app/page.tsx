import Link from "next/link";
import { auth, signOut } from "@/auth";

export default async function Home() {
  const session = await auth();

  async function handleSignOut() {
    "use server";
    await signOut({ redirectTo: "/login" });
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-gray-50 px-4">
      <div className="w-full max-w-sm rounded-lg border border-gray-200 bg-white p-8 shadow-sm">
        <p className="mb-6 text-sm text-gray-500">
          Sesión iniciada como {session?.user?.name ?? session?.user?.email}
        </p>
        <div className="flex flex-col gap-3">
          <Link
            href="/actividades"
            className="w-full rounded-md bg-gray-900 px-3 py-2 text-center text-sm font-medium text-white hover:bg-gray-800"
          >
            Registrar actividades
          </Link>
          <Link
            href="/reportes"
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-center text-sm font-medium text-gray-900 hover:bg-gray-100"
          >
            Generar reportes
          </Link>
        </div>
        <form action={handleSignOut} className="mt-6">
          <button
            type="submit"
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
          >
            Cerrar sesión
          </button>
        </form>
      </div>
    </div>
  );
}
