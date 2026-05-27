"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { CSSProperties } from "react";
import type { AboutPhoto } from "@/lib/about/photos";

type AboutLiveFieldProps = {
  photos: AboutPhoto[];
};

type Slot = {
  photo: AboutPhoto;
  key: string;
};

const SLOT_COUNT = 7;
const SIGNALS = [
  { city: "Los Angeles", code: "LA", detail: "directors / production" },
  { city: "New York", code: "NY", detail: "brands / reps" },
  { city: "São Paulo", code: "SP", detail: "culture / production" },
  { city: "Curitiba", code: "CWB", detail: "post / animation / VFX" },
] as const;

const CAPABILITIES = ["Production", "Post", "Animation", "VFX"] as const;
const SIGNAL_TICKER = [
  "LA",
  "NY",
  "SP",
  "CWB",
  "DIRECTORS",
  "PRODUCTION",
  "POST",
  "ANIMATION",
  "VFX",
  "BRANDS",
  "REPS",
] as const;
const LIVE_FIELD_PHOTO_INDEXES = [0, 1, 3, 5, 6, 7, 8, 10, 11, 14, 15, 16, 18, 19] as const;

function shuffle<T>(items: T[]) {
  const next = [...items];

  for (let i = next.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [next[i], next[j]] = [next[j], next[i]];
  }

  return next;
}

function buildSlots(photos: AboutPhoto[], seed: string) {
  const source = photos.length > 0 ? photos : [];
  return source.slice(0, SLOT_COUNT).map((photo, index) => ({
    photo,
    key: `${seed}-${index}-${photo.src}`,
  }));
}

export function AboutLiveField({ photos }: AboutLiveFieldProps) {
  const livePhotos = useMemo(() => {
    const curated = LIVE_FIELD_PHOTO_INDEXES.map((index) => photos[index]).filter(
      (photo): photo is AboutPhoto => Boolean(photo),
    );

    return curated.length >= SLOT_COUNT ? curated : photos;
  }, [photos]);
  const initialSlots = useMemo(
    () => buildSlots(livePhotos, "static"),
    [livePhotos],
  );
  const [slots, setSlots] = useState<Slot[]>(initialSlots);
  const [activeSignal, setActiveSignal] = useState(0);
  const activeSignalRef = useRef(0);
  const signal = SIGNALS[activeSignal];

  const activateSignal = useCallback(
    (index: number, reshuffle = true) => {
      activeSignalRef.current = index;
      setActiveSignal(index);

      if (reshuffle && livePhotos.length > 0) {
        setSlots(
          buildSlots(
            shuffle(livePhotos),
            `signal-${SIGNALS[index].code}-${Date.now()}`,
          ),
        );
      }
    },
    [livePhotos],
  );

  useEffect(() => {
    if (livePhotos.length === 0) return;

    setSlots(buildSlots(shuffle(livePhotos), `shuffle-${Date.now()}`));

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (reduceMotion.matches) return;

    const swapTimer = window.setInterval(() => {
      setSlots((current) => {
        if (current.length === 0) return current;

        const next = [...current];
        const slotIndex = Math.floor(Math.random() * next.length);
        const photo = livePhotos[Math.floor(Math.random() * livePhotos.length)];
        next[slotIndex] = {
          photo,
          key: `live-${Date.now()}-${slotIndex}-${photo.src}`,
        };
        return next;
      });
    }, 3200);

    const signalTimer = window.setInterval(() => {
      const nextSignal = (activeSignalRef.current + 1) % SIGNALS.length;
      activateSignal(nextSignal);
    }, 2400);

    return () => {
      window.clearInterval(swapTimer);
      window.clearInterval(signalTimer);
    };
  }, [activateSignal, livePhotos]);

  if (livePhotos.length === 0) return null;

  return (
    <section className="ff-about-live-field" aria-label="Friends & Family studio system">
      <div className="ff-about-live-field__copy">
        <div className="ff-about-live-field__route">
          <p className="ff-kicker">
            Studio system
          </p>
          <div
            className="ff-about-live-field__codes"
            aria-label="Switch studio city"
          >
            {SIGNALS.map((item, index) => (
              <button
                type="button"
                key={item.code}
                className={index === activeSignal ? "is-active" : undefined}
                aria-pressed={index === activeSignal}
                aria-label={`Show ${item.city}`}
                onClick={() => activateSignal(index)}
                onFocus={() => activateSignal(index)}
                onMouseEnter={() => activateSignal(index)}
              >
                {item.code}
              </button>
            ))}
          </div>
        </div>
        <div className="ff-about-live-field__message">
          <div className="ff-about-live-field__words" aria-hidden="true">
            {CAPABILITIES.map((word) => (
              <span key={word}>{word}</span>
            ))}
          </div>
          <div className="ff-about-live-field__signal" aria-live="polite">
            <span className="ff-about-live-field__signal-dot" aria-hidden="true" />
            <span>{signal.city}</span>
            <span>{signal.detail}</span>
          </div>
          <div className="ff-about-live-field__meter" aria-hidden="true">
            {SIGNALS.map((item, index) => (
              <span
                key={item.code}
                className={index === activeSignal ? "is-active" : undefined}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="ff-about-live-field__stage">
        <div className="ff-about-live-field__grid-mark" aria-hidden="true" />
        <div className="ff-about-live-field__scanline" aria-hidden="true" />
        <div className="ff-about-live-field__readout" aria-hidden="true">
          <span>{signal.code}</span>
          <span>{signal.city}</span>
        </div>
        <div className="ff-about-live-field__city-rail" aria-hidden="true">
          {SIGNALS.map((signal, index) => (
            <span
              key={signal.city}
              className={index === activeSignal ? "is-active" : undefined}
            >
              {signal.city}
            </span>
          ))}
        </div>
        {slots.map((slot, index) => (
          <figure
            key={slot.key}
            className={`ff-about-live-field__slot ff-about-live-field__slot--${index + 1}`}
            style={
              {
                "--about-live-delay": `${index * 180}ms`,
              } as CSSProperties
            }
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={slot.photo.src}
              alt={slot.photo.alt}
              loading={index < 3 ? "eager" : "lazy"}
              decoding="async"
            />
          </figure>
        ))}
      </div>

      <div className="ff-about-live-field__ticker" aria-hidden="true">
        {[0, 1].map((row) => (
          <div key={row} className="ff-about-live-field__ticker-row">
            {SIGNAL_TICKER.map((item) => (
              <span key={`${row}-${item}`}>{item}</span>
            ))}
          </div>
        ))}
      </div>

      <style jsx>{`
        .ff-about-live-field {
          display: grid;
          grid-template-columns: 1fr;
          gap: clamp(1rem, 2.6vw, 2rem);
          margin-top: clamp(1.75rem, 4vw, 3.25rem);
          padding: clamp(0.95rem, 2vw, 1.35rem) 0 clamp(1.25rem, 3vw, 2.25rem);
          border-top: 1px solid var(--ff-color-line-soft);
          border-bottom: 1px solid var(--ff-color-line-soft);
        }

        .ff-about-live-field__copy {
          display: grid;
          grid-template-columns: minmax(8rem, 0.22fr) minmax(0, 1fr);
          gap: clamp(1.25rem, 4vw, 4rem);
          align-items: stretch;
          padding-top: 0.5rem;
        }

        .ff-about-live-field__route {
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          min-height: clamp(5rem, 9vw, 7.5rem);
        }

        .ff-about-live-field__codes {
          display: flex;
          align-items: center;
          gap: 0.28rem;
          color: var(--ff-color-faint);
        }

        .ff-about-live-field__codes button {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-width: 2.2rem;
          height: 2.2rem;
          border: 1px solid var(--ff-color-line-soft);
          border-radius: 0;
          background: transparent;
          font-family: var(--ff-font-text);
          font-size: var(--ff-type-micro);
          font-weight: 620;
          line-height: 1;
          letter-spacing: var(--ff-track-micro);
          color: var(--ff-color-faint);
          cursor: pointer;
          transition:
            color 180ms var(--ff-ease-out),
            border-color 180ms var(--ff-ease-out),
            background-color 180ms var(--ff-ease-out);
        }

        .ff-about-live-field__codes button:hover,
        .ff-about-live-field__codes button:focus-visible,
        .ff-about-live-field__codes button.is-active {
          border-color: rgb(var(--ff-rgb-ink) / 0.42);
          background: rgb(var(--ff-rgb-ink) / 0.045);
          color: var(--ff-color-ink);
        }

        .ff-about-live-field__codes button:focus-visible {
          outline: 1px solid var(--ff-color-ink);
          outline-offset: 3px;
        }

        .ff-about-live-field__message {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
        }

        .ff-about-live-field__words {
          display: flex;
          flex-wrap: wrap;
          justify-content: flex-end;
          gap: 0.08em clamp(0.7rem, 1.8vw, 1.65rem);
          font-family: var(--ff-font-display);
          font-size: clamp(2rem, 4.4vw, 5rem);
          font-weight: 650;
          font-stretch: 90%;
          font-variation-settings: "wdth" 90, "wght" 650;
          line-height: 0.82;
          letter-spacing: 0;
          color: var(--ff-color-ink);
        }

        .ff-about-live-field__words span {
          white-space: nowrap;
        }

        .ff-about-live-field__signal {
          display: flex;
          flex-wrap: wrap;
          justify-content: flex-end;
          align-items: center;
          gap: 0.55rem 0.85rem;
          margin-top: clamp(0.8rem, 1.6vw, 1.2rem);
          font-family: var(--ff-font-text);
          font-size: var(--ff-type-meta);
          line-height: 1;
          letter-spacing: var(--ff-track-micro);
          text-transform: uppercase;
          color: var(--ff-color-muted);
        }

        .ff-about-live-field__signal span:last-child {
          color: var(--ff-color-faint);
        }

        .ff-about-live-field__meter {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 0.28rem;
          width: min(100%, 28rem);
          margin-top: clamp(0.8rem, 1.5vw, 1rem);
        }

        .ff-about-live-field__meter span {
          height: 2px;
          background: var(--ff-color-line);
          transform: scaleX(0.42);
          transform-origin: left;
          transition:
            background-color 180ms var(--ff-ease-out),
            transform 320ms var(--ff-ease-out);
        }

        .ff-about-live-field__meter span.is-active {
          background: var(--ff-color-ink);
          transform: scaleX(1);
        }

        .ff-about-live-field__signal-dot {
          width: 0.45rem;
          height: 0.45rem;
          border-radius: 999px;
          background: var(--ff-color-ink);
          animation: aboutLivePulse 1.4s ease-in-out infinite;
        }

        .ff-about-live-field__stage {
          position: relative;
          min-height: clamp(22rem, 39vw, 35rem);
          overflow: hidden;
        }

        .ff-about-live-field__grid-mark {
          position: absolute;
          inset: 0;
          pointer-events: none;
          background:
            radial-gradient(circle at 16% 18%, rgba(26, 26, 26, 0.12) 0 2px, transparent 2px),
            radial-gradient(circle at 78% 72%, rgba(26, 26, 26, 0.1) 0 2px, transparent 2px);
          opacity: 0.7;
        }

        .ff-about-live-field__scanline {
          position: absolute;
          top: 0;
          bottom: 0;
          left: 18%;
          z-index: 7;
          width: 1px;
          background: rgb(var(--ff-rgb-ink) / 0.32);
          opacity: 0.5;
          animation: aboutLiveScan 7.5s var(--ff-ease-in-out) infinite;
          pointer-events: none;
        }

        .ff-about-live-field__readout {
          position: absolute;
          top: 0.85rem;
          right: 0.85rem;
          z-index: 10;
          display: flex;
          align-items: center;
          gap: 0.65rem;
          padding: 0.45rem 0.55rem;
          background: rgb(var(--ff-rgb-paper) / 0.78);
          backdrop-filter: blur(10px);
          font-family: var(--ff-font-text);
          font-size: var(--ff-type-micro);
          font-weight: 560;
          line-height: 1;
          letter-spacing: var(--ff-track-label);
          text-transform: uppercase;
          color: var(--ff-color-muted);
        }

        .ff-about-live-field__readout span:first-child {
          color: var(--ff-color-ink);
        }

        .ff-about-live-field__city-rail {
          position: absolute;
          left: 0;
          right: 0;
          bottom: 0;
          z-index: 8;
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          border-top: 1px solid rgba(26, 26, 26, 0.12);
          background: rgb(var(--ff-rgb-paper) / 0.82);
          backdrop-filter: blur(10px);
        }

        .ff-about-live-field__city-rail span {
          padding: 0.85rem 0.75rem 0.8rem;
          border-right: 1px solid rgba(26, 26, 26, 0.12);
          font-family: var(--ff-font-text);
          font-size: var(--ff-type-micro);
          font-weight: 560;
          line-height: 1;
          letter-spacing: var(--ff-track-label);
          text-transform: uppercase;
          color: var(--ff-color-faint);
          transition:
            color 180ms var(--ff-ease-out),
            background-color 180ms var(--ff-ease-out);
        }

        .ff-about-live-field__city-rail span:last-child {
          border-right: 0;
        }

        .ff-about-live-field__city-rail span.is-active {
          color: var(--ff-color-ink);
          background: rgb(var(--ff-rgb-ink) / 0.035);
        }

        .ff-about-live-field__slot {
          position: absolute;
          overflow: hidden;
          margin: 0;
          background: var(--ff-color-line-soft);
          opacity: 0;
          animation: aboutLiveSlot 520ms var(--ff-ease-out) forwards;
          animation-delay: var(--about-live-delay, 0ms);
        }

        .ff-about-live-field__slot::after {
          content: "";
          position: absolute;
          inset: 0;
          border: 1px solid rgb(var(--ff-rgb-paper) / 0.48);
          pointer-events: none;
        }

        .ff-about-live-field__slot img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          filter: saturate(0.88) contrast(1.04);
          transform: scale(1.04);
          animation: aboutLiveImage 8s ease-in-out infinite alternate;
        }

        .ff-about-live-field__slot:nth-child(2n) img {
          animation-duration: 10s;
          animation-direction: alternate-reverse;
        }

        .ff-about-live-field__slot:nth-child(3n) img {
          animation-duration: 12s;
        }

        .ff-about-live-field__slot--1 {
          left: 0;
          top: 8%;
          z-index: 2;
          width: 38%;
          height: 49%;
        }

        .ff-about-live-field__slot--2 {
          left: 33%;
          top: 0;
          width: 34%;
          height: 34%;
        }

        .ff-about-live-field__slot--3 {
          right: 3%;
          top: 10%;
          z-index: 3;
          width: 32%;
          height: 46%;
        }

        .ff-about-live-field__slot--4 {
          left: 18%;
          bottom: 0;
          z-index: 4;
          width: 31%;
          height: 39%;
        }

        .ff-about-live-field__slot--5 {
          right: 16%;
          bottom: 8%;
          width: 35%;
          height: 31%;
        }

        .ff-about-live-field__slot--6 {
          left: 0;
          bottom: 11%;
          width: 20%;
          height: 23%;
        }

        .ff-about-live-field__slot--7 {
          right: 0;
          bottom: 0;
          z-index: 2;
          width: 22%;
          height: 25%;
        }

        .ff-about-live-field__ticker {
          display: flex;
          width: 100%;
          overflow: hidden;
          border-top: 1px solid var(--ff-color-line-soft);
          border-bottom: 1px solid var(--ff-color-line-soft);
          color: var(--ff-color-faint);
        }

        .ff-about-live-field__ticker-row {
          display: flex;
          flex: 0 0 auto;
          align-items: center;
          min-width: max-content;
          animation: aboutLiveTicker 22s linear infinite;
        }

        .ff-about-live-field__ticker-row span {
          display: inline-flex;
          align-items: center;
          min-height: 2.25rem;
          padding-inline: clamp(0.8rem, 2vw, 1.6rem);
          border-right: 1px solid var(--ff-color-line-soft);
          font-family: var(--ff-font-text);
          font-size: var(--ff-type-micro);
          font-weight: 560;
          line-height: 1;
          letter-spacing: var(--ff-track-label);
        }

        @keyframes aboutLivePulse {
          0%,
          100% {
            opacity: 0.38;
            transform: scale(0.85);
          }
          50% {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes aboutLiveSlot {
          from {
            opacity: 0;
            transform: translate3d(0, 0.75rem, 0);
          }
          to {
            opacity: 1;
            transform: translate3d(0, 0, 0);
          }
        }

        @keyframes aboutLiveImage {
          from {
            transform: scale(1.04) translate3d(-0.35rem, -0.25rem, 0);
          }
          to {
            transform: scale(1.09) translate3d(0.35rem, 0.25rem, 0);
          }
        }

        @keyframes aboutLiveScan {
          0% {
            transform: translateX(0);
          }
          50% {
            transform: translateX(58vw);
          }
          100% {
            transform: translateX(0);
          }
        }

        @keyframes aboutLiveTicker {
          from {
            transform: translateX(0);
          }
          to {
            transform: translateX(-100%);
          }
        }

        @media (max-width: 767px) {
          .ff-about-live-field {
            grid-template-columns: 1fr;
            gap: 1rem;
            margin-top: 1.5rem;
            padding-bottom: 1rem;
          }

          .ff-about-live-field__copy {
            grid-template-columns: 1fr;
            min-height: 0;
            gap: 1.2rem;
          }

          .ff-about-live-field__route {
            min-height: 0;
            gap: 0.9rem;
          }

          .ff-about-live-field__message {
            align-items: flex-start;
          }

          .ff-about-live-field__words {
            justify-content: flex-start;
            font-size: clamp(1.85rem, 10.5vw, 3rem);
            line-height: 0.86;
          }

          .ff-about-live-field__signal {
            justify-content: flex-start;
            margin-top: 0.9rem;
          }

          .ff-about-live-field__meter {
            width: 100%;
          }

          .ff-about-live-field__stage {
            min-height: 24rem;
          }

          .ff-about-live-field__city-rail {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }

          .ff-about-live-field__city-rail span {
            padding: 0.7rem 0.65rem 0.65rem;
            border-bottom: 1px solid rgba(26, 26, 26, 0.1);
          }

          .ff-about-live-field__city-rail span:nth-child(2n) {
            border-right: 0;
          }

          .ff-about-live-field__slot--1 {
            left: 0;
            top: 2%;
            width: 56%;
            height: 30%;
          }

          .ff-about-live-field__slot--2 {
            left: auto;
            right: 0;
            top: 9%;
            width: 44%;
            height: 24%;
          }

          .ff-about-live-field__slot--3 {
            left: 12%;
            right: auto;
            top: 36%;
            width: 54%;
            height: 27%;
          }

          .ff-about-live-field__slot--4 {
            left: auto;
            right: 2%;
            bottom: 23%;
            width: 42%;
            height: 24%;
          }

          .ff-about-live-field__slot--5 {
            left: 0;
            right: auto;
            bottom: 0;
            width: 56%;
            height: 28%;
          }

          .ff-about-live-field__slot--6 {
            left: auto;
            right: 0;
            bottom: 0;
            width: 42%;
            height: 20%;
          }

          .ff-about-live-field__slot--7 {
            display: none;
          }

          .ff-about-live-field__ticker-row span {
            min-height: 2rem;
            padding-inline: 0.9rem;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .ff-about-live-field__slot,
          .ff-about-live-field__slot img,
          .ff-about-live-field__scanline,
          .ff-about-live-field__ticker-row {
            animation: none !important;
            opacity: 1;
            transform: none !important;
          }
        }
      `}</style>
    </section>
  );
}
