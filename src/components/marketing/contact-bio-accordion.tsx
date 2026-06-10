"use client";

import { useId, useRef, useState } from "react";

interface ContactBio {
  name: string;
  role: string;
  email: string;
  bio: string;
}

interface ContactBioAccordionProps {
  contacts: ContactBio[];
}

function ContactBioRow({ person }: { person: ContactBio }) {
  const [isOpen, setIsOpen] = useState(false);
  const contentId = useId();
  const contentRef = useRef<HTMLDivElement>(null);
  const height = isOpen ? contentRef.current?.scrollHeight ?? 0 : 0;

  return (
    <li className="border-t border-ff-line-soft">
      <div className="grid gap-5 py-8 lg:grid-cols-12 lg:items-start lg:py-10">
        <button
          type="button"
          aria-expanded={isOpen}
          aria-controls={contentId}
          onClick={() => setIsOpen((open) => !open)}
          className="group cursor-pointer text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--ff-site-focus)] lg:col-span-4"
        >
          <span className="flex items-start justify-between gap-6">
            <span>
              <span className="ff-display-section block">{person.name}</span>
              <span className="ff-copy-small mt-3 block text-ff-muted">
                {person.role}
              </span>
            </span>
            <span
              className="ff-accordion-mark mt-2 text-ff-muted transition-colors group-hover:text-ff-ink"
              aria-hidden="true"
            >
              {isOpen ? "-" : "+"}
            </span>
          </span>
        </button>

        <div className="lg:col-span-6">
          <div
            id={contentId}
            className="ff-bio-accordion-panel"
            style={{ height }}
            aria-hidden={!isOpen}
          >
            <div ref={contentRef} className="ff-bio-accordion-content">
              <p className="ff-body max-w-3xl pb-1">{person.bio}</p>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 lg:text-right">
          <a href={`mailto:${person.email}`} className="ff-text-link">
            {person.email}
          </a>
        </div>
      </div>
    </li>
  );
}

export function ContactBioAccordion({ contacts }: ContactBioAccordionProps) {
  return (
    <ul>
      {contacts.map((person) => (
        <ContactBioRow key={person.email} person={person} />
      ))}
    </ul>
  );
}
