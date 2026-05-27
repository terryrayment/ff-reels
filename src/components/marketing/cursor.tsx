"use client";

import { useEffect, useRef, useState } from "react";

type CursorMode = "default" | "link" | "play" | "hidden";

export function Cursor() {
  const cursorRef = useRef<HTMLDivElement>(null);
  const modeRef = useRef<CursorMode>("default");
  const [enabled, setEnabled] = useState(false);
  const [mode, setMode] = useState<CursorMode>("default");

  useEffect(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const canHover = window.matchMedia("(hover: hover) and (pointer: fine)");

    if (reduceMotion.matches || !canHover.matches || window.innerWidth < 768) return;
    setEnabled(true);
  }, []);

  useEffect(() => {
    if (!enabled) return;

    const cursor = cursorRef.current;
    if (!cursor) return;

    let frame = 0;
    const target = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    const current = { x: target.x, y: target.y };

    const setCursorMode = (nextMode: CursorMode) => {
      if (modeRef.current === nextMode) return;
      modeRef.current = nextMode;
      setMode(nextMode);
    };

    const onPointerMove = (event: PointerEvent) => {
      target.x = event.clientX;
      target.y = event.clientY;

      const element = document.elementFromPoint(event.clientX, event.clientY);
      const nativeCursor = element?.closest(
        "input, textarea, select, [contenteditable='true'], [data-cursor='hidden']",
      );

      if (nativeCursor) {
        setCursorMode("hidden");
        return;
      }

      if (element?.closest("[data-cursor='play']")) {
        setCursorMode("play");
        return;
      }

      if (element?.closest("[data-cursor='link'], a, button")) {
        setCursorMode("link");
        return;
      }

      setCursorMode("default");
    };

    const raf = () => {
      current.x += (target.x - current.x) * 0.18;
      current.y += (target.y - current.y) * 0.18;
      cursor.style.transform = `translate3d(${current.x}px, ${current.y}px, 0) translate(-50%, -50%)`;
      frame = window.requestAnimationFrame(raf);
    };

    document.documentElement.classList.add("ff-cursor-ready");
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    frame = window.requestAnimationFrame(raf);

    return () => {
      document.documentElement.classList.remove("ff-cursor-ready");
      window.removeEventListener("pointermove", onPointerMove);
      window.cancelAnimationFrame(frame);
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <div
      ref={cursorRef}
      className={`ff-custom-cursor ff-custom-cursor--${mode}`}
      aria-hidden="true"
    >
      {mode === "play" && <span>PLAY</span>}
    </div>
  );
}
