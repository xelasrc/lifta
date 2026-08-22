export function Logo({ className }: { className?: string }) {
  return (
    <div
      className={`flex items-center justify-center rounded-[10px] bg-accent shadow-[0_0_18px_rgba(255,68,0,0.45)] ${className ?? ""}`}
    >
      <svg viewBox="0 0 24 24" fill="#0B0B0D" className="h-[85%] w-[85%]" aria-hidden="true">
        <rect x="0.5" y="8.5" width="4" height="7" rx="2" />
        <rect x="19.5" y="8.5" width="4" height="7" rx="2" />
        <rect x="4" y="6" width="3.6" height="12" rx="1.8" />
        <rect x="16.4" y="6" width="3.6" height="12" rx="1.8" />
        <rect x="7.2" y="10.5" width="9.6" height="3" rx="1.5" />
      </svg>
    </div>
  );
}
