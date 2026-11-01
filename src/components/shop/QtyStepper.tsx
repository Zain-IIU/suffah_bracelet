"use client";

export function QtyStepper({
  value,
  onChange,
  label,
}: {
  value: number;
  onChange: (next: number) => void;
  label: string;
}) {
  const btn =
    "h-11 w-11 cursor-pointer rounded-full border-0 bg-transparent text-xl leading-none text-plum hover:bg-blush-soft";
  return (
    <div className="inline-flex items-center rounded-full border border-field">
      <button type="button" className={btn} onClick={() => onChange(value - 1)} aria-label={`One less ${label}`}>
        −
      </button>
      <span className="min-w-7 text-center font-medium" aria-live="polite">
        {value}
      </span>
      <button type="button" className={btn} onClick={() => onChange(value + 1)} aria-label={`One more ${label}`}>
        +
      </button>
    </div>
  );
}
