"use client";

import {
  HOME_SPLASH_POSTER,
  HOME_SPLASH_VIDEO_MP4,
} from "@/lib/marketing/home-splash";

const HOME_LOCATIONS = [
  "Los Angeles, California",
  "New York, New York",
  "Curitiba, Brazil",
] as const;

export function HomeSolidHero() {
  return (
    <div className="ff-home-solid-hero">
      <section
        className="ff-home-solid-hero__panel"
        aria-label="Friends and Family"
      >
        <div className="ff-home-solid-hero__content">
          <h1 className="ff-home-solid-hero__title">
            <span className="ff-home-solid-hero__title-line">Friends &amp;</span>
            <span className="ff-home-solid-hero__title-line">Family</span>
          </h1>
          <p className="ff-home-solid-hero__tagline">Commercial production</p>
          <div className="ff-home-solid-hero__rule" aria-hidden="true" />
          <p className="ff-home-solid-hero__locations">
            Los Angeles · New York · Brazil
          </p>
          <p className="ff-home-solid-hero__scroll-cue" aria-hidden="true">
            Scroll
          </p>
        </div>

        <div className="ff-home-solid-hero__peek" aria-hidden="true">
          <video
            className="ff-home-solid-hero__peek-video"
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            poster={HOME_SPLASH_POSTER}
          >
            <source src={HOME_SPLASH_VIDEO_MP4} type="video/mp4" />
          </video>
        </div>
      </section>

      <section className="ff-home-solid-hero__reel" aria-label="Showreel">
        <video
          className="ff-home-solid-hero__reel-video"
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          poster={HOME_SPLASH_POSTER}
        >
          <source src={HOME_SPLASH_VIDEO_MP4} type="video/mp4" />
        </video>
      </section>

      <ul className="sr-only">
        {HOME_LOCATIONS.map((location) => (
          <li key={location}>{location}</li>
        ))}
      </ul>
    </div>
  );
}
