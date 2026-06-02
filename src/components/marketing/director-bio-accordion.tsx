"use client";

import { useId, useRef, useState } from "react";

interface DirectorBioAccordionProps {
  directorName: string;
  bio: string | null;
}

export function DirectorBioAccordion({
  directorName,
  bio,
}: DirectorBioAccordionProps) {
  const [isOpen, setIsOpen] = useState(false);
  const contentId = useId();
  const contentRef = useRef<HTMLDivElement>(null);
  const height = isOpen ? contentRef.current?.scrollHeight ?? 0 : 0;

  return (
    <section className="ff-shell mb-14">
      <div className="border-y ff-rule">
        <button
          type="button"
          aria-expanded={isOpen}
          aria-controls={contentId}
          onClick={() => setIsOpen((open) => !open)}
          className="flex w-full cursor-pointer items-center justify-between gap-6 py-5 text-left text-ff-micro uppercase tracking-ff-micro text-ff-muted transition-colors hover:text-ff-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--ff-site-focus)]"
        >
          <span>Bio</span>
          <span className="ff-accordion-mark" aria-hidden="true">
            {isOpen ? "-" : "+"}
          </span>
        </button>
        <div
          id={contentId}
          className="ff-bio-accordion-panel"
          style={{ height }}
          aria-hidden={!isOpen}
        >
          <div ref={contentRef} className="ff-bio-accordion-content">
            <div className="ff-section-grid pb-10">
              <div className="ff-label-column">
                <p className="ff-kicker">About {directorName}</p>
              </div>
              <div className="ff-copy-column space-y-6">
                {bio ? (
                  <p className="ff-body whitespace-pre-line text-ff-ink">{bio}</p>
                ) : (
                  <p className="ff-body">
                    More background is being added to this profile.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
