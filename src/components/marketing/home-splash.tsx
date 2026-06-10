"use client";

import {
  HOME_SPLASH_POSTER,
  HOME_SPLASH_VIDEO_MP4,
} from "@/lib/marketing/home-splash";

export function HomeSplash() {
  return (
    <section className="ff-home-splash" aria-label="Friends and Family">
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
        <div className="ff-home-splash__mask" />
      </div>
    </section>
  );
}
