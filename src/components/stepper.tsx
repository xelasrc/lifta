function StepButton({
  delta,
  onClick,
  label,
  big,
}: {
  delta: number;
  onClick: () => void;
  label: string;
  big?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className={`flex h-8 items-center justify-center rounded-full font-bold text-white ${
        big ? "w-11 bg-white/5 text-xs text-muted" : "w-8 bg-white/10 text-lg"
      }`}
    >
      {big ? (delta > 0 ? `+${delta}` : delta) : delta > 0 ? "+" : "−"}
    </button>
  );
}

export function Stepper({
  label,
  value,
  onChange,
  min,
  max,
  step,
  bigStep,
  suffix,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  step: number;
  bigStep?: number;
  suffix?: string;
}) {
  function adjust(delta: number) {
    onChange(Math.min(max, Math.max(min, Math.round((value + delta) * 100) / 100)));
  }

  return (
    <div className="flex items-center justify-between">
      <p className="text-sm text-white">{label}</p>
      <div className="flex items-center gap-2">
        {bigStep && <StepButton delta={-bigStep} onClick={() => adjust(-bigStep)} label={`Decrease ${label} by ${bigStep}`} big />}
        <StepButton delta={-step} onClick={() => adjust(-step)} label={`Decrease ${label}`} />
        <p className="w-14 text-center font-semibold text-white">
          {value}
          {suffix}
        </p>
        <StepButton delta={step} onClick={() => adjust(step)} label={`Increase ${label}`} />
        {bigStep && <StepButton delta={bigStep} onClick={() => adjust(bigStep)} label={`Increase ${label} by ${bigStep}`} big />}
      </div>
    </div>
  );
}
