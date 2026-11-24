export function Logo() {
  return (
    <span className="flex items-center gap-2 text-xl font-extrabold tracking-tight">
      <svg width="28" height="28" viewBox="0 0 32 32" aria-hidden="true">
        <circle cx="16" cy="16" r="15" fill="var(--accent-brand)" />
        <circle cx="16" cy="16" r="6" fill="var(--gold)" />
        <path d="M4 22 Q16 12 28 22" stroke="#fff" strokeWidth="2" fill="none" strokeLinecap="round" />
      </svg>
      alam
    </span>
  );
}
