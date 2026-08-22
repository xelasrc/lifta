"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

const ROW_HEIGHT = 25;
const VISIBLE_ROWS = 3;

function buildValues(min: number, max: number, step: number) {
  const values: number[] = [];
  for (let v = min; v <= max + 1e-6; v = Math.round((v + step) * 100) / 100) {
    values.push(v);
  }
  return values;
}

function nearestIndex(list: number[], value: number) {
  let closest = 0;
  let closestDiff = Infinity;
  for (let i = 0; i < list.length; i++) {
    const diff = Math.abs(list[i] - value);
    if (diff < closestDiff) {
      closest = i;
      closestDiff = diff;
    }
  }
  return closest;
}

export function NumberPicker({
  min,
  max,
  step,
  value,
  onChange,
  format,
}: {
  min: number;
  max: number;
  step: number;
  value: number;
  onChange: (value: number) => void;
  format?: (value: number) => string;
}) {
  const list = useMemo(() => buildValues(min, max, step), [min, max, step]);
  const containerRef = useRef<HTMLDivElement>(null);
  const [centerIndex, setCenterIndex] = useState(() => nearestIndex(list, value));
  const settleTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Position the scroll to match the initial value. `value` only ever changes
  // as a result of this picker's own onScroll -> onChange round-trip, so the
  // scroll position is already correct by the time it would change again.
  useEffect(() => {
    // behavior: "instant" is required to override the container's scroll-smooth
    // class, which otherwise animates this initial jump and briefly shows the wrong value.
    containerRef.current?.scrollTo({ top: centerIndex * ROW_HEIGHT, behavior: "instant" });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleScroll = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;
    const idx = Math.min(Math.max(Math.round(el.scrollTop / ROW_HEIGHT), 0), list.length - 1);
    setCenterIndex(idx);

    if (settleTimeout.current) clearTimeout(settleTimeout.current);
    settleTimeout.current = setTimeout(() => {
      if (list[idx] !== value) onChange(list[idx]);
    }, 120);
  }, [list, onChange, value]);

  return (
    <div
      className="relative mx-auto w-55 overflow-hidden rounded-full border-2 border-white/30 bg-[#141414]"
      style={{ height: ROW_HEIGHT * VISIBLE_ROWS }}
    >
      <div
        ref={containerRef}
        onScroll={handleScroll}
        className="relative h-full overflow-y-auto scroll-smooth [scroll-snap-type:y_mandatory]"
      >
        <div style={{ height: ROW_HEIGHT }} />
        {list.map((v, i) => (
          <div
            key={v}
            className={`flex items-center justify-center transition-colors [scroll-snap-align:center] ${
              i === centerIndex ? "text-lg font-bold text-white" : "text-sm text-white/40"
            }`}
            style={{ height: ROW_HEIGHT }}
          >
            {format ? format(v) : v}
          </div>
        ))}
        <div style={{ height: ROW_HEIGHT }} />
      </div>
    </div>
  );
}
