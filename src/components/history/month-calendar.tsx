const WEEKDAY_LABELS = ["S", "M", "T", "W", "T", "F", "S"];

function daysInMonth(year: number, monthIndex: number) {
  return new Date(year, monthIndex + 1, 0).getDate();
}

export function MonthCalendar({
  monthKey,
  workoutDays,
  onDayClick,
}: {
  monthKey: string;
  workoutDays: Set<number>;
  onDayClick: (day: number) => void;
}) {
  const [year, month] = monthKey.split("-").map(Number);
  const monthIndex = month - 1;
  const total = daysInMonth(year, monthIndex);
  const firstWeekday = new Date(year, monthIndex, 1).getDay();
  const cells: (number | null)[] = [...Array(firstWeekday).fill(null), ...Array.from({ length: total }, (_, i) => i + 1)];

  return (
    <div className="grid grid-cols-7 gap-y-2 text-center">
      {WEEKDAY_LABELS.map((label, i) => (
        <div key={i} className="text-xs font-semibold text-muted">
          {label}
        </div>
      ))}
      {cells.map((day, i) =>
        day === null ? (
          <div key={`blank-${i}`} />
        ) : (
          <button
            key={day}
            type="button"
            onClick={() => onDayClick(day)}
            disabled={!workoutDays.has(day)}
            className={`mx-auto flex h-8 w-8 items-center justify-center rounded-full text-sm ${
              workoutDays.has(day) ? "border border-accent text-accent" : "text-white"
            }`}
          >
            {day}
          </button>
        ),
      )}
    </div>
  );
}
