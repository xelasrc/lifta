"use client";

import { useRef, useState } from "react";

const HANDLE_WIDTH = 132;
const COMPLETE_THRESHOLD = 0.75;

export function SlideToStart({
  label,
  onComplete,
  disabled,
}: {
  label: string;
  onComplete: () => void;
  disabled?: boolean;
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [dragX, setDragX] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [settling, setSettling] = useState(false);

  function maxX() {
    const width = trackRef.current?.getBoundingClientRect().width ?? 0;
    return Math.max(width - HANDLE_WIDTH - 8, 0);
  }

  function handlePointerDown(event: React.PointerEvent) {
    if (disabled || settling) return;
    setDragging(true);
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function handlePointerMove(event: React.PointerEvent) {
    if (!dragging || !trackRef.current) return;
    const rect = trackRef.current.getBoundingClientRect();
    const x = event.clientX - rect.left - HANDLE_WIDTH / 2 - 4;
    setDragX(Math.min(Math.max(x, 0), maxX()));
  }

  function handlePointerUp() {
    if (!dragging) return;
    setDragging(false);

    if (dragX > maxX() * COMPLETE_THRESHOLD) {
      setSettling(true);
      setDragX(maxX());
      onComplete();
    } else {
      setDragX(0);
    }
  }

  function handleKeyDown(event: React.KeyboardEvent) {
    if (disabled || settling) return;
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      setSettling(true);
      setDragX(maxX());
      onComplete();
    }
  }

  return (
    <div
      ref={trackRef}
      className={`relative h-18 overflow-hidden rounded-full bg-[#191919] ${disabled ? "opacity-60" : ""}`}
    >
      <div aria-hidden className="pointer-events-none absolute inset-0 flex items-center justify-end gap-1 pr-8">
        {[0, 1, 2].map((i) => (
          <span key={i} className="text-lg text-white/30">
            ›
          </span>
        ))}
      </div>

      <div
        role="button"
        tabIndex={disabled ? -1 : 0}
        aria-label={label}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onKeyDown={handleKeyDown}
        className={`absolute top-1 bottom-1 left-1 flex items-center justify-center gap-1 rounded-full bg-accent px-4 font-bold text-white outline-none focus-visible:ring-2 focus-visible:ring-white ${
          dragging ? "" : "transition-transform duration-200 ease-out"
        }`}
        style={{ width: HANDLE_WIDTH, transform: `translateX(${dragX}px)` }}
      >
        <span>{label}</span>
        <span className="text-lg">›</span>
      </div>
    </div>
  );
}
