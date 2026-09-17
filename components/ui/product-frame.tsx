"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const PROMPT = "Add a health check endpoint and run the tests.";
const REPLY = "I'll add it to the router and wait before cargo test.";
const COMMAND = "cargo test";

const FILES = [
  { name: "app.rs", hint: "router · handlers" },
  { name: "tools.rs", hint: "approval gate · shell" },
  { name: "ui.rs", hint: "TUI · y/n prompt" },
] as const;

type Phase =
  | "type-prompt"
  | "stream-reply"
  | "await"
  | "running"
  | "passed"
  | "skipped";

export function ProductFrame() {
  const [activeFile, setActiveFile] = useState(1);
  const [phase, setPhase] = useState<Phase>("type-prompt");
  const [promptLen, setPromptLen] = useState(0);
  const [replyLen, setReplyLen] = useState(0);
  const [runLines, setRunLines] = useState<string[]>([]);
  const [focused, setFocused] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const timers = useRef<number[]>([]);

  const clearTimers = useCallback(() => {
    timers.current.forEach((id) => window.clearTimeout(id));
    timers.current = [];
  }, []);

  const later = useCallback(
    (ms: number, fn: () => void) => {
      const id = window.setTimeout(fn, ms);
      timers.current.push(id);
    },
    [],
  );

  const resetDemo = useCallback(() => {
    clearTimers();
    setPhase("type-prompt");
    setPromptLen(0);
    setReplyLen(0);
    setRunLines([]);
  }, [clearTimers]);

  useEffect(() => {
    clearTimers();

    if (phase === "type-prompt") {
      if (promptLen < PROMPT.length) {
        later(28 + (promptLen % 5 === 0 ? 40 : 0), () => setPromptLen((n) => n + 1));
      } else {
        later(450, () => setPhase("stream-reply"));
      }
      return clearTimers;
    }

    if (phase === "stream-reply") {
      if (replyLen < REPLY.length) {
        later(18, () => setReplyLen((n) => n + 1));
      } else {
        later(500, () => setPhase("await"));
      }
      return clearTimers;
    }

    if (phase === "running") {
      const steps = [
        { at: 200, line: "running 3 tests" },
        { at: 700, line: "test health::ok ... ok" },
        { at: 1100, line: "test health::ready ... ok" },
        { at: 1500, line: "test routes::mount ... ok" },
      ];
      steps.forEach(({ at, line }) => {
        later(at, () => setRunLines((prev) => [...prev, line]));
      });
      later(2000, () => setPhase("passed"));
      return clearTimers;
    }

    if (phase === "passed" || phase === "skipped") {
      later(2800, resetDemo);
      return clearTimers;
    }

    return clearTimers;
  }, [phase, promptLen, replyLen, later, clearTimers, resetDemo]);

  const approve = useCallback(() => {
    if (phase !== "await") return;
    setRunLines([]);
    setPhase("running");
  }, [phase]);

  const skip = useCallback(() => {
    if (phase !== "await") return;
    setPhase("skipped");
  }, [phase]);

  useEffect(() => {
    if (!focused || phase !== "await") return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "y" || e.key === "Y" || e.key === "Enter") {
        e.preventDefault();
        approve();
      }
      if (e.key === "n" || e.key === "N" || e.key === "Escape") {
        e.preventDefault();
        skip();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [focused, phase, approve, skip]);

  const promptShown = PROMPT.slice(0, promptLen);
  const replyShown = REPLY.slice(0, replyLen);
  const typingPrompt = phase === "type-prompt" && promptLen < PROMPT.length;
  const typingReply = phase === "stream-reply" && replyLen < REPLY.length;

  return (
    <div
      ref={root}
      tabIndex={0}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      className="product-frame group relative overflow-hidden rounded-[8px] border border-line bg-canvas-2 shadow-[0_20px_50px_-28px_rgba(20,20,20,0.35)] outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
      aria-label="Interactive Boxcode IDE demo. Press y to run, n or escape to skip."
    >
      <div className="flex items-center gap-2 border-b border-line px-3 py-2">
        <i className="size-2 rounded-full bg-line-strong" />
        <i className="size-2 rounded-full bg-line-strong" />
        <i className="size-2 rounded-full bg-line-strong" />
        <span className="ml-2 font-mono text-[11px] text-muted">Boxcode IDE</span>
        <span
          className={`ml-auto font-mono text-[10px] transition-opacity ${
            focused ? "text-accent opacity-100" : "text-muted opacity-0 group-hover:opacity-70"
          }`}
        >
          {phase === "await" ? "try y / n / esc" : "click to focus"}
        </span>
      </div>

      <div className="grid min-h-[300px] grid-cols-[5.5rem_1fr] sm:grid-cols-[7.5rem_1fr]">
        <aside className="border-r border-line p-3 text-[11px] text-muted">
          <div className="font-medium text-ink">src</div>
          <div className="mt-2 space-y-0.5 font-mono">
            {FILES.map((file, i) => (
              <button
                key={file.name}
                type="button"
                onClick={() => setActiveFile(i)}
                className={`block w-full rounded px-1 py-0.5 text-left transition-colors ${
                  activeFile === i
                    ? "bg-accent-soft text-accent"
                    : "hover:bg-canvas hover:text-ink"
                }`}
              >
                {file.name}
              </button>
            ))}
          </div>
          <p className="mt-4 text-[10px] leading-4 text-muted/80">{FILES[activeFile].hint}</p>
        </aside>

        <div className="flex min-w-0 flex-col">
          <div className="flex-1 p-4 font-mono text-[12px] leading-5 text-muted">
            <div className="flex items-center gap-2">
              <span className="text-ink">boxcode</span>
              <span>· agent</span>
              {(phase === "stream-reply" || phase === "await" || phase === "running") && (
                <span className="inline-flex items-center gap-1 text-[10px] text-accent">
                  <span className="pf-pulse size-1.5 rounded-full bg-accent" />
                  working
                </span>
              )}
            </div>
            <p className="mt-3 min-h-[2.5rem] text-ink">
              {promptShown}
              {typingPrompt && <span className="pf-caret" aria-hidden />}
            </p>
            {(phase !== "type-prompt" || replyLen > 0) && (
              <p className="mt-3 min-h-[2.5rem]">
                {replyShown}
                {typingReply && <span className="pf-caret" aria-hidden />}
              </p>
            )}
            {phase === "passed" && (
              <p className="mt-3 text-term-ok">Tests passed. Health check is live.</p>
            )}
            {phase === "skipped" && (
              <p className="mt-3 text-term-warn">Skipped. Nothing ran without your yes.</p>
            )}
          </div>

          <div className="border-t border-line bg-term p-3 font-mono text-[11px] leading-5 text-term-fg">
            <div className="text-term-dim">CLI · same agent</div>
            <div className="mt-1">
              <span className="text-term-ok">❯</span>{" "}
              {phase === "type-prompt" ? (
                <>
                  {PROMPT.slice(0, promptLen).toLowerCase()}
                  {typingPrompt && <span className="pf-caret pf-caret-term" aria-hidden />}
                </>
              ) : (
                "add a health check endpoint"
              )}
            </div>

            {(phase === "await" ||
              phase === "running" ||
              phase === "passed" ||
              phase === "skipped") && (
              <div
                className={`mt-2 rounded border px-2.5 py-2 transition-colors ${
                  phase === "await"
                    ? "border-accent/50 bg-accent/5 shadow-[0_0_0_1px_rgba(109,90,230,0.12)]"
                    : "border-white/10 bg-black/20"
                }`}
              >
                <div className="text-term-dim">Run this command?</div>
                <div className="mt-0.5 text-term-fg">$ {COMMAND}</div>

                {phase === "await" && (
                  <div className="mt-2 flex flex-wrap items-center gap-1.5">
                    <button
                      type="button"
                      onClick={approve}
                      className="rounded px-2 py-0.5 text-accent transition-colors hover:bg-accent/15"
                    >
                      y <span className="text-term-dim">run</span>
                    </button>
                    <span className="text-term-dim">·</span>
                    <button
                      type="button"
                      onClick={skip}
                      className="rounded px-2 py-0.5 text-term-fg/80 transition-colors hover:bg-white/5"
                    >
                      n <span className="text-term-dim">skip</span>
                    </button>
                    <span className="text-term-dim">·</span>
                    <button
                      type="button"
                      onClick={skip}
                      className="rounded px-2 py-0.5 text-term-fg/80 transition-colors hover:bg-white/5"
                    >
                      esc <span className="text-term-dim">skip</span>
                    </button>
                  </div>
                )}

                {phase === "running" && (
                  <div className="mt-2 space-y-0.5 text-term-dim">
                    {runLines.map((line) => (
                      <div key={line}>{line}</div>
                    ))}
                    {runLines.length < 4 && (
                      <div className="text-accent">
                        running… <span className="pf-caret pf-caret-term" aria-hidden />
                      </div>
                    )}
                  </div>
                )}

                {phase === "passed" && (
                  <div className="mt-2 text-term-ok">test result: ok. 3 passed</div>
                )}
                {phase === "skipped" && (
                  <div className="mt-2 text-term-warn">skipped — waiting for your next yes</div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
