"use client";

import { useCallback, useRef, useState, type PointerEvent, type ReactNode } from "react";

export function BeforeAfter() {
  const [pos, setPos] = useState(50);
  const track = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);

  const move = useCallback((clientX: number) => {
    const el = track.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const next = ((clientX - rect.left) / Math.max(rect.width, 1)) * 100;
    setPos(Math.min(100, Math.max(0, next)));
  }, []);

  function startDrag(e: PointerEvent<HTMLElement>) {
    dragging.current = true;
    e.currentTarget.setPointerCapture(e.pointerId);
    move(e.clientX);
  }

  function onPointerMove(e: PointerEvent<HTMLElement>) {
    if (!dragging.current) return;
    move(e.clientX);
  }

  function onPointerUp(e: PointerEvent<HTMLElement>) {
    dragging.current = false;
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
  }

  return (
    <div
      ref={track}
      className="relative min-h-[320px] touch-pan-y select-none rounded-[8px] border border-line bg-canvas-2"
      onPointerDown={(e) => {
        if ((e.target as HTMLElement).closest("[data-ba-handle]")) return;
        if (e.pointerType !== "mouse") {
          move(e.clientX);
          return;
        }
        startDrag(e);
      }}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
    >
      <div className="absolute inset-0 overflow-hidden rounded-[8px]">
        <Panel label="Without a gate" tone="warn">
          <p className="font-mono text-[13px] leading-6 text-muted">
            $ git push --force origin main
            <br />
            $ rm -rf dist node_modules
            <br />
            Done. The model kept going.
          </p>
          <p className="mt-4 text-sm text-muted">
            Twenty ordinary prompts get answered yes by reflex. The twenty-first is the one that
            destroys the branch.
          </p>
        </Panel>

        <div className="absolute inset-0 bg-canvas" style={{ clipPath: `inset(0 0 0 ${pos}%)` }}>
          <Panel label="With Boxcode" tone="ok">
            <div className="rounded-[6px] border border-line bg-canvas-2 p-3 font-mono text-[13px] leading-6">
              <div className="text-muted">Run this command?</div>
              <div className="mt-1 text-ink">$ git push --force origin main</div>
              <div className="mt-2 text-accent">y run · n skip · esc skip</div>
            </div>
            <p className="mt-4 text-sm text-muted">
              Destructive actions wait for your yes. Catastrophic commands are never offered. There
              is no allow-everything key.
            </p>
          </Panel>
        </div>
      </div>

      <div
        data-ba-handle
        className="absolute inset-y-0 z-10 w-12 -translate-x-1/2 cursor-ew-resize touch-none"
        style={{ left: `${pos}%` }}
        onPointerDown={startDrag}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        role="slider"
        aria-label="Compare without a gate versus with Boxcode"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(pos)}
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "ArrowLeft") setPos((p) => Math.max(0, p - 5));
          if (e.key === "ArrowRight") setPos((p) => Math.min(100, p + 5));
          if (e.key === "Home") setPos(0);
          if (e.key === "End") setPos(100);
        }}
      >
        <div className="absolute inset-y-0 left-1/2 w-px -translate-x-1/2 bg-accent" />
        <div className="absolute top-1/2 left-1/2 size-7 -translate-x-1/2 -translate-y-1/2 rounded-full border border-line bg-canvas shadow-sm" />
      </div>
    </div>
  );
}

function Panel({
  label,
  children,
  tone,
}: {
  label: string;
  children: ReactNode;
  tone: "ok" | "warn";
}) {
  return (
    <div className="flex h-full min-h-[320px] flex-col p-6 sm:p-8">
      <p className="eyebrow">
        <span className={tone === "ok" ? "text-term-ok" : "text-term-warn"}>{label}</span>
      </p>
      <div className="mt-5">{children}</div>
    </div>
  );
}
