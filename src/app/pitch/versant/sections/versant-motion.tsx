"use client";

import { useEffect } from "react";

export function VersantMotion() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      document.documentElement.classList.add("versant-reduce-motion");
      return;
    }

    const cards = Array.from(document.querySelectorAll<HTMLElement>(".versant-reveal"));
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" },
    );

    cards.forEach((card) => observer.observe(card));
    const revealFallback = window.setTimeout(() => {
      cards.forEach((card) => card.classList.add("is-visible"));
    }, 1800);

    return () => {
      window.clearTimeout(revealFallback);
      observer.disconnect();
    };
  }, []);

  return null;
}
