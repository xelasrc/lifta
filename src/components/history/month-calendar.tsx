function daysInMonth(year: number, monthIndex: number) {
  return new Date(year, monthIndex + 1, 0).getDate();
}

export type DayActivity = { hasStrength: boolean; hasCardio: boolean };

export function MonthCalendar({
  monthKey,
  workoutDayFlags,
  onDayClick,
}: {
  monthKey: string;
  workoutDayFlags: Map<number, DayActivity>;
  onDayClick: (day: number) => void;
}) {
  const [year, month] = monthKey.split("-").map(Number);
  const total = daysInMonth(year, month - 1);
  const days = Array.from({ length: total }, (_, i) => i + 1);

  return (
    <div className="grid grid-cols-7 gap-y-3">
      {days.map((day) => {
        const activity = workoutDayFlags.get(day);
        const hasWorkout = Boolean(activity);
        return (
          <button
            key={day}
            type="button"
            onClick={() => hasWorkout && onDayClick(day)}
            disabled={!hasWorkout}
            className={`mx-auto flex h-11 w-11 items-center justify-center rounded-full border-2 bg-black text-sm font-bold ${
              activity?.hasStrength ? "border-accent text-accent" : "border-white/50 text-white"
            } ${activity?.hasCardio ? "ring-2 ring-offset-2 ring-offset-black ring-sky-400" : ""}`}
          >
            {day}
          </button>
        );
      })}
    </div>
  );
}
