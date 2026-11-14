import { cn } from "@/lib/cn";

interface LampProps {
  className?: string;
  /** Show the soft glow behind the flame. Used in the hero only. */
  glow?: boolean;
  /** Animate the flame. Motion is also switched off by prefers-reduced-motion. */
  animated?: boolean;
  title?: string;
}

/**
 * The diyalo: a clay oil lamp with a lit wick. Drawn as inline SVG so it scales cleanly and
 * the flame can be animated. Decorative unless a title is supplied.
 */
export function Lamp({ className, glow = false, animated = false, title }: LampProps) {
  return (
    <svg
      viewBox="0 0 240 240"
      className={cn("block", className)}
      role={title ? "img" : undefined}
      aria-hidden={title ? undefined : true}
      aria-label={title}
      focusable="false"
    >
      {glow && (
        <>
          <defs>
            <radialGradient id="lamp-glow" cx="50%" cy="46%" r="50%">
              <stop offset="0%" stopColor="#f5a623" stopOpacity="0.55" />
              <stop offset="45%" stopColor="#f5a623" stopOpacity="0.16" />
              <stop offset="100%" stopColor="#f5a623" stopOpacity="0" />
            </radialGradient>
          </defs>
          <circle
            className={animated ? "lamp-glow" : undefined}
            cx="120"
            cy="108"
            r="118"
            fill="url(#lamp-glow)"
          />
        </>
      )}
      {/* Bowl with the pinched lip that holds the wick */}
      <path
        d="M34 140 C34 188 70 204 120 204 C170 204 206 188 206 140 C170 152 70 152 34 140 Z"
        fill="#b8561f"
      />
      <path d="M34 140 C22 136 14 128 10 118 C24 122 38 126 50 128 Z" fill="#b8561f" />
      <path
        d="M34 140 C70 152 170 152 206 140 C206 148 200 154 192 158 C160 168 80 168 48 158 C40 154 34 148 34 140 Z"
        fill="#8f3f14"
      />
      <ellipse cx="120" cy="141" rx="84" ry="9" fill="#f5a623" opacity="0.85" />
      {/* Flame */}
      <g className={animated ? "lamp-flame" : undefined}>
        <path
          d="M120 54 C138 82 150 100 150 122 C150 140 137 148 120 148 C103 148 90 140 90 122 C90 100 103 84 120 54 Z"
          fill="#f5a623"
        />
        <path
          d="M120 92 C130 108 136 118 136 130 C136 141 129 146 120 146 C111 146 104 141 104 130 C104 118 110 108 120 92 Z"
          fill="#ffe3a3"
        />
      </g>
    </svg>
  );
}

/** Wordmark: lamp mark plus the DIYALO name in the display face. */
export function Wordmark({ className, dark = false }: { className?: string; dark?: boolean }) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <Lamp className="h-9 w-9" />
      <span
        className={cn(
          "font-display text-2xl font-semibold tracking-tight",
          dark ? "text-snow" : "text-ink",
        )}
      >
        DIYALO
      </span>
    </span>
  );
}
