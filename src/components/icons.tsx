type IconProps = { className?: string };

const base = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.6,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
};

export function BagIcon({ className = "h-[18px] w-[18px]" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} {...base}>
      <path d="M5.5 8h13l-1 12h-11z" />
      <path d="M9 8V6.5a3 3 0 0 1 6 0V8" />
    </svg>
  );
}

export function HeartIcon({ className = "h-5 w-5" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} {...base} strokeWidth={1.5}>
      <path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z" />
    </svg>
  );
}

export function GiftIcon({ className = "h-5 w-5" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} {...base} strokeWidth={1.5}>
      <rect x="4" y="9" width="16" height="11" rx="1" />
      <path d="M3 9h18M12 9v11M12 9c-2-4-6-4-6-1.5S10 9 12 9zM12 9c2-4 6-4 6-1.5S14 9 12 9z" />
    </svg>
  );
}

export function CashIcon({ className = "h-5 w-5" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} {...base} strokeWidth={1.5}>
      <rect x="3" y="6" width="18" height="12" rx="2" />
      <circle cx="12" cy="12" r="2.5" />
    </svg>
  );
}

export function SwapIcon({ className = "h-5 w-5" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} {...base} strokeWidth={1.5}>
      <path d="M4 9h13l-3-3M20 15H7l3 3" />
    </svg>
  );
}

export function CheckIcon({ className = "h-10 w-10" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} {...base}>
      <path d="M5 12.5l4.5 4.5L19 7.5" />
    </svg>
  );
}

export function ArrowLeftIcon({ className = "h-4 w-4" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} {...base}>
      <path d="M19 12H5M11 6l-6 6 6 6" />
    </svg>
  );
}

/** Shown when a bracelet has no photo yet. */
export function BraceletPlaceholder({ className = "h-1/2 w-1/2" }: IconProps) {
  return (
    <svg viewBox="0 0 200 200" className={className} aria-hidden="true">
      <circle cx="100" cy="100" r="62" fill="none" stroke="#C9848F" strokeWidth="1.5" />
      <circle
        cx="100"
        cy="100"
        r="62"
        fill="none"
        stroke="#E58FA6"
        strokeWidth="14"
        strokeLinecap="round"
        strokeDasharray="0 16.23"
      />
      <circle
        cx="100"
        cy="100"
        r="62"
        fill="none"
        stroke="#FFFDF8"
        strokeWidth="15"
        strokeLinecap="round"
        strokeDasharray="0 97.39"
      />
    </svg>
  );
}
