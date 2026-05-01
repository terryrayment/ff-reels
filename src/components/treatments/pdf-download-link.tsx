"use client";

import { ReactNode, useEffect, useState } from "react";

interface Props {
  href: string;
  download?: string;
  target?: string;
  rel?: string;
  title?: string;
  ariaLabel?: string;
  className: string;
  children: ReactNode;
}

export function PdfDownloadLink({
  href,
  download,
  target,
  rel,
  title,
  ariaLabel,
  className,
  children,
}: Props) {
  const [showNotice, setShowNotice] = useState(false);

  useEffect(() => {
    if (!showNotice) return;
    const timeout = window.setTimeout(() => setShowNotice(false), 4200);
    return () => window.clearTimeout(timeout);
  }, [showNotice]);

  return (
    <>
      <a
        href={href}
        target={target}
        rel={rel}
        download={download}
        title={title}
        aria-label={ariaLabel}
        onClick={() => setShowNotice(true)}
        className={className}
      >
        {children}
      </a>
      <div
        aria-live="polite"
        className={`fixed left-1/2 bottom-16 z-50 -translate-x-1/2 rounded-full border border-white/10 bg-black/80 px-3 py-1.5 text-[10px] font-medium uppercase tracking-[0.14em] text-white/65 shadow-lg backdrop-blur-md transition-all duration-200 ${
          showNotice
            ? "translate-y-0 opacity-100"
            : "pointer-events-none translate-y-2 opacity-0"
        }`}
      >
        Motion GIFs do not play in the PDF.
      </div>
    </>
  );
}
