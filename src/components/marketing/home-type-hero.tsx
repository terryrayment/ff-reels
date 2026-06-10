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

export function HomeTypeHero() {
  return (
    <section className="ff-home-splash ff-home-type-hero" aria-label="Friends and Family">
      <div className="ff-home-splash__media" aria-hidden="true">
        <video
          className="ff-home-splash__video"
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          poster={HOME_SPLASH_POSTER}
        >
          <source src={HOME_SPLASH_VIDEO_MP4} type="video/mp4" />
        </video>
        <div className="ff-home-type-hero__scrim" />
      </div>

      <div className="ff-home-type-hero__content">
        <h1 className="ff-home-type-hero__title">
          <span className="ff-home-type-hero__title-line">Friends &amp;</span>
          <span className="ff-home-type-hero__title-line">Family</span>
        </h1>
        <div className="ff-home-type-hero__rule" aria-hidden="true" />
        <ul className="ff-home-type-hero__locations">
          {HOME_LOCATIONS.map((location) => (
            <li key={location}>{location}</li>
          ))}
        </ul>
      </div>
    </section>
  );
}
