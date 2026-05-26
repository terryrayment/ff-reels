import type { Metadata } from "next";
import { AboutLiveField } from "@/components/marketing/about-live-field";
import { InfinitePhotoLoop } from "@/components/marketing/infinite-photo-loop";
import { RevealText } from "@/components/marketing/reveal-text";
import { ABOUT_PHOTOS } from "@/lib/about/photos";

export const metadata: Metadata = { title: "About" };

const TEAM = [
  {
    name: "Scott",
    role: "Executive Producer / Partner",
    email: "scott@friendsandfamily.tv",
  },
  {
    name: "Jed",
    role: "Executive Producer / Partner",
    email: "jed@friendsandfamily.tv",
  },
  {
    name: "Alana",
    role: "Head of Production",
    email: "alana@friendsandfamily.tv",
  },
];

const REPS = [
  { region: "West Coast", name: "Uncle Lefty" },
  { region: "Midwest", name: "CCCo" },
  { region: "East Coast", name: "Talk Shop" },
];

const PRINCIPLES = [
  { label: "01", title: "Direction first" },
  { label: "02", title: "Independent" },
  { label: "03", title: "LA / NY / SP / CWB" },
  { label: "04", title: "Post / motion / VFX" },
];

export default function AboutPage() {
  return (
    <div className="ff-page">
      <section className="ff-shell">
        <header className="ff-intro-grid">
          <div className="lg:col-span-7">
            <p className="ff-kicker mb-4">
              About
            </p>
            <h1 className="ff-display-page">
              <RevealText text="A creative studio for moving image work." />
            </h1>
          </div>
          <p className="ff-body lg:col-span-4 lg:col-start-9">
            Directors, production, post, animation, and VFX connected across
            Los Angeles, New York, São Paulo, and Curitiba.
          </p>
        </header>

        <AboutLiveField photos={ABOUT_PHOTOS} />
      </section>

      <section className="ff-shell ff-section-stack">
        <div className="ff-principles-grid">
          {PRINCIPLES.map((item) => (
            <div
              key={item.title}
              className="ff-principle flex min-h-[132px] flex-col justify-between md:min-h-[178px]"
            >
              <p className="ff-kicker-muted">
                {item.label}
              </p>
              <p className="ff-display-feature mt-8 max-w-[12rem]">
                {item.title}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="ff-shell ff-section-stack ff-section-grid">
        <div className="ff-label-column">
          <p className="ff-kicker">
            Company
          </p>
        </div>
        <div className="ff-copy-column space-y-5 ff-lede">
          <p>
            Friends &amp; Family is a creative studio built around directors.
            We shape the idea, the production, the edit, the finish, and the
            wider moving-image system around a campaign.
          </p>
          <p className="text-ff-copy">
            A small roster, picked carefully. Long relationships with directors,
            brands, and the people who come back.
          </p>
        </div>
      </section>

      <section className="ff-shell ff-section-stack ff-section-border ff-section-grid">
        <div className="ff-label-column">
          <p className="ff-kicker">
            Studio system
          </p>
        </div>
        <div className="ff-copy-column space-y-6 ff-lede">
          <p>
            THE YOUTH in São Paulo and COLOSSAL in Curitiba extend the studio
            practice into culture, production, post, animation, and VFX. Three
            connected studios, one working system across the Americas.
          </p>
          <div className="flex flex-wrap gap-x-6 gap-y-3 pt-1">
            <a
              href="https://colossal.film/"
              target="_blank"
              rel="noopener noreferrer"
              className="ff-text-link"
            >
              Visit COLOSSAL →
            </a>
            <a
              href="https://theyouth.com.br/"
              target="_blank"
              rel="noopener noreferrer"
              className="ff-text-link"
            >
              Visit THE YOUTH →
            </a>
          </div>
        </div>
      </section>

      <section className="ff-shell ff-section-stack ff-section-border ff-section-grid">
        <div className="ff-label-column">
          <p className="ff-kicker">
            Team
          </p>
        </div>
        <div className="ff-wide-column">
          <ul className="ff-list-rows">
            {TEAM.map((m) => (
              <li
                key={m.email}
                className="ff-list-row"
              >
                <div>
                  <p className="ff-display-feature">
                    {m.name}
                  </p>
                  <p className="ff-kicker-muted mt-1">
                    {m.role}
                  </p>
                </div>
                <a
                  href={`mailto:${m.email}`}
                  className="ff-text-link"
                >
                  {m.email}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="ff-shell ff-section-stack ff-section-border ff-section-grid">
        <div className="ff-label-column">
          <p className="ff-kicker">
            Sales reps
          </p>
        </div>
        <div className="ff-wide-column">
          <ul className="ff-list-rows">
            {REPS.map((r) => (
              <li
                key={r.region}
                className="ff-list-row-compact"
              >
                <p className="ff-display-feature">
                  {r.name}
                </p>
                <p className="ff-kicker-muted">
                  {r.region}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="ff-shell ff-section-stack ff-section-border">
        <div className="ff-page-heading-row">
          <div>
            <p className="ff-kicker mb-4">
              Archive
            </p>
            <h2 className="ff-display-section">
              Scenes in motion
            </h2>
          </div>
          <p className="ff-body max-w-xl">
            Candid fragments from sets, edits, road days, offices, and the
            in-between.
          </p>
        </div>
        <InfinitePhotoLoop photos={ABOUT_PHOTOS} className="mt-8" />
      </section>
    </div>
  );
}
