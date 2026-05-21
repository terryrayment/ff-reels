"use client";

import { useEffect, useMemo, useRef, useState } from "react";

interface RevealTextProps {
  text: string;
}

export function RevealText({ text }: RevealTextProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (reduceMotion.matches) {
      setVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        setVisible(true);
        observer.disconnect();
      },
      { rootMargin: "0px 0px -10% 0px" },
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  const tokens = useMemo(() => text.split(/(\s+)/), [text]);
  let characterIndex = 0;

  return (
    <span
      ref={ref}
      className={`ff-reveal-text${visible ? " is-visible" : ""}`}
    >
      <span className="sr-only">{text}</span>
      <span aria-hidden="true" className="ff-reveal-text__visual">
        {tokens.map((token, tokenIndex) => {
          if (/^\s+$/.test(token)) {
            return (
              <span key={`space-${tokenIndex}`} className="ff-reveal-text__space">
                {token}
              </span>
            );
          }

          return (
            <span key={`word-${tokenIndex}`} className="ff-reveal-text__word">
              {Array.from(token).map((char) => {
                const index = characterIndex;
                characterIndex += 1;

                return (
                  <span
                    key={`${char}-${index}`}
                    className="ff-reveal-text__char"
                    style={{ transitionDelay: `${index * 18}ms` }}
                  >
                    {char}
                  </span>
                );
              })}
            </span>
          );
        })}
      </span>
    </span>
  );
}
