"use client";

import { useEffect } from "react";

/** Pins Versant-only document chrome (scrollbar) on <html> for reliable styling. */
export function VersantPitchChrome() {
  useEffect(() => {
    const root = document.documentElement;
    root.classList.add("versant-pitch-page");
    return () => root.classList.remove("versant-pitch-page");
  }, []);

  return null;
}
