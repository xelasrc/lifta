export function BarbellIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <rect x="6" y="2" width="5" height="16" rx="2" />
      <rect x="21" y="2" width="5" height="16" rx="2" />
      <rect x="2" y="6" width="4" height="8" rx="1.5" />
      <rect x="26" y="6" width="4" height="8" rx="1.5" />
      <line x1="11" y1="8" x2="21" y2="8" />
      <line x1="11" y1="12" x2="21" y2="12" />
    </svg>
  );
}
