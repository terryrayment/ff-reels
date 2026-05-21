"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface MagneticProps {
  children: React.ReactNode;
  className?: string;
}

export function Magnetic({ children, className }: MagneticProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [active, setActive] = useState(false);

  useEffect(() => {
    const element = ref.current;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const canHover = window.matchMedia("(hover: hover) and (pointer: fine)");

    if (!element || reduceMotion.matches || !canHover.matches) return;

    const onMove = (event: MouseEvent) => {
      const rect = element.getBoundingClientRect();
      const hoverZone = 40;
      const inside =
        event.clientX >= rect.left - hoverZone &&
        event.clientX <= rect.right + hoverZone &&
        event.clientY >= rect.top - hoverZone &&
        event.clientY <= rect.bottom + hoverZone;

      if (!inside) {
        setActive(false);
        setOffset({ x: 0, y: 0 });
        return;
      }

      setActive(true);
      setOffset({
        x: (event.clientX - (rect.left + rect.width / 2)) * 0.25,
        y: (event.clientY - (rect.top + rect.height / 2)) * 0.25,
      });
    };

    const onLeave = () => {
      setActive(false);
      setOffset({ x: 0, y: 0 });
    };

    window.addEventListener("mousemove", onMove);
    element.addEventListener("mouseleave", onLeave);

    return () => {
      window.removeEventListener("mousemove", onMove);
      element.removeEventListener("mouseleave", onLeave);
    };
  }, []);

  return (
    <span
      ref={ref}
      className={cn("ff-magnetic", className)}
      style={{
        transform: `translate3d(${offset.x}px, ${offset.y}px, 0)`,
        transition: active
          ? "transform 400ms var(--ease-magnetic)"
          : "transform var(--dur-medium) var(--ease-magnetic)",
      }}
    >
      {children}
    </span>
  );
}
