"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { FormEvent, useState } from "react";

export default function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/mi-cuenta/pedidos";

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (password.trim().length < 5) {
      setError("La contraseña debe tener al menos 5 caracteres");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email: email.trim(),
          password,
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error ?? "No se pudo registrar");
      }

      const login = await signIn("credentials", {
        email: email.trim(),
        password,
        redirect: false,
      });

      if (login?.error) {
        // Cuenta creada: mandar a login con la misma contraseña
        router.push("/iniciar-sesion");
        return;
      }

      const sessionRes = await fetch("/api/auth/session");
      const session = await sessionRes.json();
      const destination =
        session?.user?.role === "admin" || data.user?.role === "admin"
          ? "/admin"
          : callbackUrl || "/mi-cuenta/pedidos";

      router.push(destination);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error inesperado");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-md px-4 py-12 sm:px-6">
      <div className="card-artisan p-8">
        <h1 className="font-display text-4xl text-maimara-primary dark:text-maimara-light">
          Crear cuenta
        </h1>
        <p className="mt-2 text-sm text-muted">
          Registrate con tu correo para pedir y seguir tus pedidos.
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-5" noValidate>
          {error && (
            <div className="rounded-xl border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-950/50 dark:text-red-300">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="name" className="label-field">
              Nombre (opcional)
            </label>
            <input
              id="name"
              type="text"
              autoComplete="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="input-field"
              placeholder="Tu nombre"
            />
          </div>

          <div>
            <label htmlFor="email" className="label-field">
              Correo electrónico
            </label>
            <input
              id="email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-field"
              placeholder="tu@correo.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="label-field">
              Contraseña
            </label>
            <div className="relative mt-1.5">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                required
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-field mt-0 pr-24"
                placeholder="Mínimo 5 caracteres"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-maimara-primary dark:text-maimara-light"
              >
                {showPassword ? "Ocultar" : "Ver"}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !email || !password}
            className="w-full rounded-full bg-maimara-primary py-3.5 font-semibold text-white transition hover:bg-maimara-secondary disabled:opacity-60"
          >
            {loading ? "Creando cuenta..." : "Registrarme"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-muted">
          ¿Ya tenés cuenta?{" "}
          <Link
            href={`/iniciar-sesion?callbackUrl=${encodeURIComponent(callbackUrl)}`}
            className="font-medium text-maimara-primary underline dark:text-maimara-light"
          >
            Iniciar sesión
          </Link>
        </p>
      </div>
    </div>
  );
}
