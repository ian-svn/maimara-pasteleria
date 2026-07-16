import Image from "next/image";
import Link from "next/link";
import { CONTACT } from "@/lib/types";

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:grid-cols-2 sm:px-6 lg:grid-cols-3">
        <div className="flex flex-col items-start gap-3">
          <Image
            src="/images/logo.png"
            alt="Maimará"
            width={80}
            height={80}
            className="h-16 w-auto"
          />
          <p className="font-display text-2xl text-maimara-primary dark:text-maimara-light">
            Maimará
          </p>
          <p className="text-sm tracking-widest uppercase text-maimara-secondary">
            Pastelería Artesanal
          </p>
        </div>

        <div>
          <h3 className="mb-3 text-sm font-semibold tracking-wider uppercase text-maimara-primary dark:text-maimara-light">
            Contacto
          </h3>
          <ul className="space-y-2 text-sm">
            <li>
              <a
                href={`https://wa.me/${CONTACT.whatsapp}`}
                target="_blank"
                rel="noopener noreferrer"
                className="transition hover:text-maimara-primary dark:hover:text-maimara-light"
              >
                WhatsApp: {CONTACT.phone}
              </a>
            </li>
            <li>
              <a
                href={`mailto:${CONTACT.email}`}
                className="transition hover:text-maimara-primary dark:hover:text-maimara-light"
              >
                {CONTACT.email}
              </a>
            </li>
            <li>
              <a
                href={CONTACT.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="transition hover:text-maimara-primary dark:hover:text-maimara-light"
              >
                Instagram: {CONTACT.instagram}
              </a>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="mb-3 text-sm font-semibold tracking-wider uppercase text-maimara-primary dark:text-maimara-light">
            Retiro y envíos
          </h3>
          <p className="text-sm leading-relaxed">
            Retiro por el local en{" "}
            <strong className="text-maimara-primary dark:text-maimara-light">
              {CONTACT.location}
            </strong>
            . Envíos a CABA con costo adicional.
          </p>
          <p className="mt-3 text-sm text-muted">
            Pedidos por mensaje directo o a través de la web.
          </p>
        </div>
      </div>

      <div className="border-t border-maimara-blush py-4 text-center text-xs text-muted dark:border-maimara-border">
        <p>
          © {new Date().getFullYear()}{" "}
          <Link
            href="/"
            className="hover:text-maimara-primary dark:hover:text-maimara-light"
          >
            Maimará Pastelería Artesanal
          </Link>
          . Todos los derechos reservados.
        </p>
      </div>
    </footer>
  );
}
