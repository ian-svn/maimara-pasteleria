"use client";

import Image from "next/image";
import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import { useCart } from "@/context/CartContext";
import { useTheme } from "@/context/ThemeContext";

function SunIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-5 w-5"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      aria-hidden
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
      />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-5 w-5"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      aria-hidden
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
      />
    </svg>
  );
}

export function Navbar() {
  const { totalItems } = useCart();
  const { theme, toggleTheme, mounted } = useTheme();
  const { data: session, status } = useSession();
  const isDark = mounted ? theme === "dark" : false;
  const isAuthenticated = status === "authenticated" && Boolean(session?.user);

  return (
    <header className="site-header">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
        <Link href="/" className="flex items-center gap-3">
          <Image
            src="/images/logo.png"
            alt="Maimará Pastelería Artesanal"
            width={56}
            height={56}
            className="h-12 w-auto sm:h-14"
            priority
          />
          <span className="hidden font-display text-2xl text-maimara-primary sm:block sm:text-3xl dark:text-maimara-light">
            Maimará
          </span>
        </Link>

        <div className="flex items-center gap-1.5 sm:gap-3">
          <Link
            href="/"
            className="rounded-full px-3 py-1.5 text-sm font-medium text-neutral-700 transition hover:text-maimara-primary dark:text-neutral-200 dark:hover:text-maimara-light"
          >
            Catálogo
          </Link>

          {isAuthenticated ? (
            <>
              {session?.user?.role === "admin" && (
                <Link
                  href="/admin"
                  className="rounded-full bg-maimara-primary/10 px-3 py-1.5 text-sm font-semibold text-maimara-primary transition hover:bg-maimara-primary/20 dark:bg-maimara-primary/20 dark:text-maimara-light"
                >
                  Admin
                </Link>
              )}
              <Link
                href="/mi-cuenta/pedidos"
                className="hidden rounded-full px-3 py-1.5 text-sm font-medium text-neutral-600 transition hover:text-maimara-primary sm:inline dark:text-neutral-300 dark:hover:text-maimara-light"
              >
                Mis pedidos
              </Link>
              <button
                type="button"
                onClick={() => signOut({ callbackUrl: "/" })}
                className="hidden rounded-full px-3 py-1.5 text-sm font-medium text-neutral-600 transition hover:text-maimara-primary sm:inline dark:text-neutral-300 dark:hover:text-maimara-light"
              >
                Salir
              </button>
            </>
          ) : (
            <Link
              href="/iniciar-sesion"
              className="rounded-full px-3 py-1.5 text-sm font-medium text-neutral-600 transition hover:text-maimara-primary dark:text-neutral-300 dark:hover:text-maimara-light"
            >
              Ingresar
            </Link>
          )}

          <Link
            href="/checkout"
            className="relative flex items-center gap-2 rounded-full bg-maimara-primary px-4 py-2 text-sm font-medium text-white shadow-[var(--shadow-artisan)] transition hover:bg-maimara-secondary"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
            <span className="hidden sm:inline">Carrito</span>
            {totalItems > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-white text-xs font-bold text-maimara-primary dark:bg-maimara-light">
                {totalItems}
              </span>
            )}
          </Link>

          <button
            type="button"
            onClick={toggleTheme}
            aria-label={isDark ? "Activar modo claro" : "Activar modo oscuro"}
            className="rounded-full p-2 text-neutral-600 transition hover:bg-maimara-blush/60 hover:text-maimara-primary dark:text-neutral-300 dark:hover:bg-maimara-surface dark:hover:text-maimara-light"
            suppressHydrationWarning
          >
            {isDark ? <SunIcon /> : <MoonIcon />}
          </button>
        </div>
      </nav>
    </header>
  );
}
