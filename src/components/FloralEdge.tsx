function Flower({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <g fill="currentColor">
        {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => (
          <ellipse
            key={deg}
            cx="12"
            cy="5.6"
            rx="2.1"
            ry="3.1"
            transform={`rotate(${deg} 12 12)`}
          />
        ))}
      </g>
      <circle cx="12" cy="12" r="2.5" className="fill-maimara-blush" />
    </svg>
  );
}

function Leaf({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" className={className} aria-hidden>
      <path
        d="M2.2 10.2C5.8 3.2 13.4 3.6 13.8 3.8 10.2 11.2 4.2 13.6 2.2 10.2Z"
        fill="currentColor"
      />
    </svg>
  );
}

/** Borde floral breve, como el de las tarjetas de la marca. */
export function FloralEdge({ className = "" }: { className?: string }) {
  return (
    <div
      className={`flex items-center justify-center gap-2 ${className}`}
      aria-hidden
    >
      {Array.from({ length: 7 }).map((_, i) =>
        i % 2 === 0 ? (
          <Flower
            key={i}
            className="h-4 w-4 text-maimara-secondary sm:h-5 sm:w-5"
          />
        ) : (
          <Leaf
            key={i}
            className={`h-3 w-3 text-maimara-leaf ${i % 4 === 1 ? "-rotate-45" : "rotate-45"}`}
          />
        )
      )}
    </div>
  );
}
