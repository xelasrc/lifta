export function BarbellIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <rect x="2" y="8" width="4" height="8" rx="1.5" />
      <rect x="18" y="8" width="4" height="8" rx="1.5" />
      <line x1="6" y1="12" x2="18" y2="12" />
      <line x1="8.5" y1="9" x2="8.5" y2="15" />
      <line x1="15.5" y1="9" x2="15.5" y2="15" />
    </svg>
  );
}
