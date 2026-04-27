interface MeloWordmarkProps {
  size?: string;
  color?: string;
}

/**
 * Melo wordmark: uses the official logo PNG (MEL + spiral O).
 * `size` controls the height of the logo image.
 */
export function MeloWordmark({ size = "2.6rem" }: MeloWordmarkProps) {
  return (
    <img
      src="/melo-wordmark.png"
      alt="Melo"
      style={{ height: size, width: "auto", display: "block", objectFit: "contain" }}
      draggable={false}
    />
  );
}

/**
 * Standalone spiral icon (for app icon, favicon, small badges).
 */
export function MeloIcon({ size = 28, color = "hsl(var(--moss))" }: { size?: number; color?: string }) {
  return (
    <svg
      viewBox="0 0 100 100"
      width={size}
      height={size}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path d="M 50 8 A 42 42 0 1 1 9 39" stroke={color} strokeWidth="8.5" strokeLinecap="round" />
      <path d="M 50 22 A 28 28 0 1 1 22 45" stroke={color} strokeWidth="7" strokeLinecap="round" />
      <path d="M 56 35 A 16 16 0 1 1 35 45" stroke={color} strokeWidth="5.5" strokeLinecap="round" />
      <circle cx="50" cy="50" r="5.5" fill={color} />
    </svg>
  );
}
