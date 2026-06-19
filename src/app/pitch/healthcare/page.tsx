import type { Metadata } from "next";
import type { CSSProperties } from "react";
import { Play } from "lucide-react";
import {
  getCanonicalDirectors,
  getCanonicalWork,
  type CanonicalProject,
} from "@/lib/marketing/canonical-source";
import { muxAnimatedUrl, muxStillUrl } from "../versant/sections/media";
import { PitchViewBeacon } from "../pitch-view-beacon";
import { PitchStyles } from "../pitch-styles";
import { VersantMotion } from "../versant/sections/versant-motion";
import { VersantPitchChrome } from "../versant/sections/versant-pitch-chrome";
import { HealthcareLightboxController } from "./healthcare-work-grid";
import {
  CARD,
  CONTAINER,
  MEDIA,
  META_LABEL,
  META_TEXT,
  PANEL,
  REVEAL,
  SECTION,
  SURFACE_GRAIN,
  SectionHeader,
  TagList,
  revealStagger,
} from "../versant/sections/system";

type HealthcareProject = CanonicalProject & {
  duration?: number | null;
};

export const metadata: Metadata = {
  title: "Friends & Family for Healthcare",
  description:
    "Healthcare-focused production from Friends & Family, built around patient trust, clinical review, sensitive casting, and delivery logistics.",
  robots: { index: false, follow: false, nocache: true },
};

const HEALTHCARE_THEME = {
  "--versant-bg": "#DDE3DA",
  "--pitch-accent": "#15594F",
  "--versant-black": "#102620",
  "--versant-ink": "#171612",
  "--versant-paper": "#F3EEE2",
  "--versant-white": "#FFFCF4",
  "--versant-orange": "#B19343",
  "--versant-lime": "#E5DED0",
  "--versant-blue": "#102620",
  "--versant-mint": "#E8E0D2",
  "--versant-gray": "#756F64",
  "--versant-soft-gray": "#D6CEBF",
  "--versant-surface": "#FBF7ED",
  "--versant-surface-soft": "#EEE6D7",
  "--versant-muted": "rgba(23, 22, 18, 0.6)",
  "--versant-rule": "rgba(23, 22, 18, 0.13)",
  "--versant-rule-strong": "rgba(23, 22, 18, 0.28)",
  "--versant-light-rule": "rgba(255, 252, 244, 0.16)",
} as CSSProperties;

const FF_HOME_URL = "https://www.friendsandfamily.tv";
const INSTAGRAM_URL = "https://instagram.com/friendsandfamily.tv";
const HEALTHCARE_MUX_CROP_CLASS = "scale-[1.34]";

type HealthcareProjectEntry = {
  id: string;
  proof: string;
  need: string;
  logistics: string;
  project?: HealthcareProject;
};

const MEMORIAL_HERMANN_DIRECTOR = {
  slug: "terry-rayment",
  name: "Terry Rayment",
};

const HEALTHCARE_PROJECTS: HealthcareProjectEntry[] = [
  {
    id: "source-kelsey-larkin-05-trihealth-be-heard",
    proof: "Health system campaign",
    need: "Patient voice, provider trust, human-centered message.",
    logistics:
      "The work has to respect real care environments while still giving the film an emotional spine.",
  },
  {
    id: "source-healthcare-memorial-hermann-big-game",
    proof: "Health system brand spot",
    need: "Public trust, high-stakes care, human scale.",
    logistics:
      "Hospital work has to carry institutional authority without losing the patient in the system.",
    project: {
      id: "source-healthcare-memorial-hermann-big-game",
      order: 2,
      brand: "Memorial Hermann",
      title: "Big Game",
      year: null,
      agency: null,
      contentType: "SPOT",
      thumbnailUrl:
        "https://download.wiredrive.com/asset/assetId/91337781/size/large/ts/1597695714/type/library/client/WD-WV2DA/91337781_large.jpg?token=fb276db21&category=pres&action=thumb",
      sourceVideoUrl: null,
      muxPlaybackId: "kHoD9h023E2Ycs4NicbeozMFOO1uU1GEmuU02ZbQoh4H8",
      duration: 30.071711,
      director: MEMORIAL_HERMANN_DIRECTOR,
    },
  },
  {
    id: "source-healthcare-memorial-hermann-cellist",
    proof: "Patient story",
    need: "Recovery, performance, restraint, hope.",
    logistics:
      "Patient-centered work needs emotion without pressure, and enough room for the person to stay real.",
    project: {
      id: "source-healthcare-memorial-hermann-cellist",
      order: 3,
      brand: "Memorial Hermann",
      title: "Cellist",
      year: null,
      agency: null,
      contentType: "SPOT",
      thumbnailUrl:
        "https://download.wiredrive.com/asset/assetId/152174330/size/large/ts/1758661379/type/library/client/WD-WV2DA/152174330_large.jpg?token=fb276db21&category=pres&action=thumb",
      sourceVideoUrl: null,
      muxPlaybackId: "oQk6m2Ti701F02KaQWDcJXKN94gdeicnof49GmCN9u01U00",
      duration: 30.113422,
      director: MEMORIAL_HERMANN_DIRECTOR,
    },
  },
  {
    id: "source-healthcare-memorial-hermann-nursery",
    proof: "Maternal and newborn care",
    need: "Family stakes, quiet environments, careful tone.",
    logistics:
      "Newborn and family work demands a light footprint, clear consent, and a crew that can move softly.",
    project: {
      id: "source-healthcare-memorial-hermann-nursery",
      order: 4,
      brand: "Memorial Hermann",
      title: "Nursery",
      year: null,
      agency: null,
      contentType: "SPOT",
      thumbnailUrl:
        "https://download.wiredrive.com/asset/assetId/140342771/size/large/ts/1704828754/type/library/client/WD-WV2DA/140342771_large.jpg?token=fb276db21&category=pres&action=thumb",
      sourceVideoUrl: null,
      muxPlaybackId: "01Y00S8nuP02qQPOKa01MBqvLt00qRx6rwmNC3loK5tnZMbc",
      duration: 32.532511,
      director: MEMORIAL_HERMANN_DIRECTOR,
    },
  },
  {
    id: "source-terry-rayment-04-viacom-mental-health-is-health",
    proof: "Mental health campaign",
    need: "Sensitive subject matter, casting care, restraint in performance.",
    logistics:
      "Mental health work needs dignity, privacy, and a director who knows when not to push.",
  },
  {
    id: "source-healthcare-memorial-hermann-showstopper",
    proof: "Care outcome story",
    need: "Momentum, patient stakes, institutional confidence.",
    logistics:
      "Outcome-driven healthcare work has to land the promise without overclaiming what care can control.",
    project: {
      id: "source-healthcare-memorial-hermann-showstopper",
      order: 6,
      brand: "Memorial Hermann",
      title: "Showstopper",
      year: null,
      agency: null,
      contentType: "SPOT",
      thumbnailUrl:
        "https://download.wiredrive.com/asset/assetId/140342772/size/large/ts/1704828777/type/library/client/WD-WV2DA/140342772_large.jpg?token=fb276db21&category=pres&action=thumb",
      sourceVideoUrl: null,
      muxPlaybackId: "mQW4aDJKRvXc5vBL8p6rNOWbZzw01TBmRG5ipCx01XKBM",
      duration: 33.199844,
      director: MEMORIAL_HERMANN_DIRECTOR,
    },
  },
  {
    id: "source-healthcare-memorial-hermann-treatment",
    proof: "Care pathway film",
    need: "Hospital promise, patient clarity, service-line storytelling.",
    logistics:
      "Treatment-path work needs the institution, the clinicians, and the patient benefit to read in one clean line.",
    project: {
      id: "source-healthcare-memorial-hermann-treatment",
      order: 7,
      brand: "Memorial Hermann",
      title: "The Memorial Treatment",
      year: null,
      agency: null,
      contentType: "SPOT",
      thumbnailUrl:
        "https://download.wiredrive.com/asset/assetId/91338010/size/large/ts/1597109393/type/library/client/WD-WV2DA/91338010_large.jpg?token=fb276db21&category=pres&action=thumb",
      sourceVideoUrl: null,
      muxPlaybackId: "iKtGOar2kIE026HgEJM00vQjQJVbL89014j02oeylu1BWsw",
      duration: 60.101711,
      director: MEMORIAL_HERMANN_DIRECTOR,
    },
  },
  {
    id: "source-caleb-slain-05-clorox-from-hospital-to-home",
    proof: "Hospital-to-home hygiene",
    need: "Clinical context, family stakes, clear product role.",
    logistics:
      "The job is to make safety visible without turning the spot into fear or instruction.",
  },
  {
    id: "source-le-ged-06-jewish-general-hospital-foundation-effect-to-cause",
    proof: "Hospital foundation film",
    need: "Institutional trust, motion language, donor-facing clarity.",
    logistics:
      "Foundation work has to feel human, but it also has to carry the weight of the institution.",
  },
  {
    id: "source-matt-dilmore-06-noom-house-plant",
    proof: "Behavioral health",
    need: "Behavior change, comedy control, no shame.",
    logistics:
      "Health behavior work lives or dies by tone. One wrong joke turns into a brand problem.",
  },
];

const LOGISTICS = [
  {
    label: "Clinical review",
    body:
      "We plan for medical, legal, and regulatory review before the first frame is shot, so claims, supers, product handling, and story beats are not rescued in post.",
  },
  {
    label: "Patient and provider access",
    body:
      "Healthcare schedules are not production schedules. We build around doctors, nurses, patients, family availability, consent windows, and locations that cannot simply pause for camera.",
  },
  {
    label: "Privacy discipline",
    body:
      "Sensitive work needs tight releases, controlled sets, minimal footprint, clear boundaries around protected information, and crews that understand where they are.",
  },
  {
    label: "Casting with care",
    body:
      "Real people, patient-like casting, and providers need direction that protects dignity. The performance cannot feel exploited, coached flat, or polished into dishonesty.",
  },
  {
    label: "Location pressure",
    body:
      "Hospitals, clinics, homes, pharmacies, labs, and care facilities all create access problems. We shape the shoot around infection-control rules, quiet zones, room turnover, and load-in realities.",
  },
  {
    label: "Versioning and finish",
    body:
      "Healthcare rarely ends at one film. We expect stakeholder edits, claims revisions, accessibility needs, paid cutdowns, social formats, internal versions, and launch-date pressure.",
  },
] as const;

const PROCESS = [
  ["1", "Intake", "Brief, audience, claims, review path, required language, locations, and restrictions."],
  ["2", "Director match", "A recommendation based on tone, subject sensitivity, casting needs, and production reality."],
  ["3", "Production plan", "Crew shape, access plan, patient/provider handling, schedule, budget, and contingency."],
  ["4", "Review and delivery", "Editorial rounds, legal notes, supers, finish, cutdowns, captions, and launch files."],
] as const;

const HERO_TAGS = [
  "Healthcare",
  "Mental health",
  "Hospitals",
  "Patient stories",
  "Clinical review",
  "Cutdowns",
  "Versioning",
  "Delivery",
] as const;

const SCOPE_TAGS = [
  "Patient stories",
  "Provider films",
  "Health system campaigns",
  "Behavioral health",
  "Hospital foundations",
  "Clinical review",
  "Accessibility",
  "Paid social",
  "Broadcast",
  "Internal launch",
] as const;

const CONTACTS = [
  ["Scott Kaplan, MD", "scott@friendsandfamily.tv"],
  ["Terry Rayment, CD", "terry@friendsandfamily.tv"],
  ["Jed Herold, EP", "jed@friendsandfamily.tv"],
] as const;

const BRAND_DISPLAY_NAMES: Record<string, string> = {
  Trihealth: "TriHealth",
};

function FFLogomark() {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/brand/ff-logomark.png"
      alt=""
      className="h-9 w-9 object-contain brightness-0 invert opacity-70"
    />
  );
}

function projectLookup() {
  const projects: HealthcareProject[] = [
    ...getCanonicalWork(),
    ...getCanonicalDirectors().flatMap((director) => director.portfolio),
  ];

  return HEALTHCARE_PROJECTS.map((entry) => {
    const project =
      entry.project ?? projects.find((candidate) => candidate.id === entry.id);
    return project ? { ...entry, project } : null;
  }).filter(
    (
      entry,
    ): entry is HealthcareProjectEntry & {
      project: HealthcareProject;
    } => Boolean(entry),
  );
}

function brandName(project: HealthcareProject) {
  return BRAND_DISPLAY_NAMES[project.brand] ?? project.brand;
}

function canPlay(project: HealthcareProject) {
  return Boolean(project.muxPlaybackId || project.sourceVideoUrl);
}

export default function HealthcarePitchPage() {
  const projects = projectLookup();
  const heroProjects = projects.slice(0, 4);

  return (
    <main
      className="versant-pitch min-h-screen bg-[var(--versant-bg)] font-sans text-[var(--versant-ink)] antialiased selection:bg-[var(--versant-orange)]/30"
      style={HEALTHCARE_THEME}
    >
      <div
        aria-hidden="true"
        className="fixed inset-x-0 top-0 z-50 h-px bg-[#101010]/20"
      />
      <div aria-hidden="true" className="versant-grain" />
      <VersantMotion />
      <VersantPitchChrome />
      <PitchStyles />
      <PitchViewBeacon slug="healthcare" />
      <HealthcareLightboxController
        projects={projects.map(({ project }) => project)}
      />

      <HealthcareHero projects={heroProjects} />
      <HealthcareWork projects={projects} />
      <HealthcareLogistics />
      <HealthcareProcess />
      <HealthcareContact />
    </main>
  );
}

function HealthcareHero({
  projects,
}: {
  projects: Array<HealthcareProjectEntry & { project: HealthcareProject }>;
}) {
  const ticker =
    "Patient trust · Provider schedules · Clinical review · Sensitive casting · Hospital access · Privacy discipline · Claims control · Versioning · Launch delivery";

  return (
    <section className="overflow-x-clip px-6 pt-6 pb-0.5 text-[var(--versant-white)] sm:px-10 sm:pt-10 lg:px-14 lg:pt-14">
      <div className="mx-auto grid max-w-[1600px] gap-3 lg:grid-cols-12">
        <article className="relative flex min-h-[34rem] flex-col overflow-hidden rounded-[4px] bg-[var(--pitch-accent)] p-6 text-[var(--versant-white)] sm:p-8 lg:col-span-12 lg:min-h-[min(43rem,calc(100svh-2rem))] lg:p-9">
          <div aria-hidden="true" className={SURFACE_GRAIN} />
          <div className="relative z-10 flex flex-wrap items-center justify-between gap-x-4 gap-y-2 text-[13px] font-medium leading-none tracking-[-0.01em] text-white/50">
            <a
              href={FF_HOME_URL}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Friends & Family"
              className="flex min-w-0 items-center gap-3 text-white transition-opacity duration-180 hover:opacity-80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--versant-orange)]"
            >
              <FFLogomark />
              <span className="text-[15px] font-medium tracking-[-0.02em]">
                Friends &amp; Family
              </span>
            </a>
          </div>

          <div className="relative z-10 mt-[clamp(2rem,5.5vh,4rem)] grid gap-8 lg:grid-cols-[minmax(0,0.58fr)_minmax(22rem,0.42fr)] lg:items-center">
            <div>
              <p className="mb-5 text-[13px] font-medium leading-none tracking-[-0.01em] text-white/62">
                Healthcare production
              </p>
              <h1 className="versant-display max-w-none text-[clamp(2rem,8.5vw,6rem)] font-medium leading-[0.98] tracking-[-0.044em] text-white sm:max-w-[18ch] lg:max-w-[14ch]">
                Friends &amp; Family{" "}
                <span className="font-light tracking-[-0.018em] text-white/72">
                  for healthcare
                </span>
              </h1>
              <p className="mt-5 max-w-[39rem] text-[clamp(18px,1.75vw,26px)] leading-[1.22] tracking-[-0.024em] text-white/70">
                Healthcare work is never just a shoot. It is patient trust,
                provider schedules, legal review, clinical accuracy, consent,
                privacy, and a story that still has to feel human.
              </p>
              <p className="mt-4 max-w-[39rem] text-[clamp(18px,1.75vw,26px)] leading-[1.22] tracking-[-0.024em] text-white/70">
                We build the production path around those constraints from the
                start, then protect the film from becoming generic by the time
                everyone has touched it.
              </p>
              <TagList
                tags={HERO_TAGS}
                dark
                className="mt-6 max-w-2xl"
                label="Healthcare capabilities"
              />
            </div>

            <div aria-hidden="true" className="grid gap-1.5 opacity-80 lg:self-center">
              {projects[0] ? (
                <div className="versant-media aspect-video bg-white/5">
                  <ProjectMotion
                    project={projects[0].project}
                    className="h-full w-full object-cover"
                    eager
                  />
                </div>
              ) : null}
              <div className="grid grid-cols-3 gap-1.5">
                {projects.slice(1, 4).map(({ project }) => (
                  <div
                    key={project.id}
                    className="versant-media aspect-video bg-white/5"
                  >
                    <ProjectMotion
                      project={project}
                      className="h-full w-full object-cover"
                      eager
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="relative z-10 mt-8 overflow-hidden border-t border-white/[0.14] pt-3 text-[13px] font-medium leading-none tracking-[-0.01em] text-white/36 lg:mt-10">
            <div className="versant-marquee flex w-max gap-8 motion-reduce:animate-none">
              <span>{ticker}</span>
              <span aria-hidden="true">{ticker}</span>
            </div>
          </div>
        </article>
      </div>
    </section>
  );
}

function HealthcareWork({
  projects,
}: {
  projects: Array<HealthcareProjectEntry & { project: HealthcareProject }>;
}) {
  return (
    <section className={SECTION}>
      <div className={CONTAINER}>
        <SectionHeader
          label="Healthcare work only"
          title="Healthcare work we can show."
          intro="Health systems, hospital foundations, patient stories, mental health, hospital-to-home hygiene, and behavior change. No sports reel. No general lifestyle filler."
        />

        <div className="grid gap-x-4 gap-y-8 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {projects.map((entry, index) => (
            <article
              key={entry.project.id}
              className={`${CARD} group flex flex-col p-3 sm:p-4`}
              style={revealStagger(index)}
            >
              {canPlay(entry.project) ? (
                <button
                  type="button"
                  data-healthcare-lightbox-id={entry.project.id}
                  className={`${MEDIA} group/media relative aspect-video w-full bg-black/10 text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--pitch-accent)]`}
                  aria-label={`Open ${brandName(entry.project)} ${entry.project.title} spot`}
                >
                  <ProjectMotion
                    project={entry.project}
                    className="versant-card-image pointer-events-none h-full w-full object-cover"
                  />
                  <span className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/0 opacity-0 transition duration-200 group-hover/media:bg-black/18 group-hover/media:opacity-100 group-focus-visible/media:bg-black/18 group-focus-visible/media:opacity-100">
                    <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white/92 text-[var(--pitch-accent)] shadow-[0_10px_30px_rgba(0,0,0,0.22)]">
                      <Play
                        size={19}
                        fill="currentColor"
                        strokeWidth={2.4}
                        aria-hidden="true"
                      />
                    </span>
                  </span>
                </button>
              ) : (
                <div className={`${MEDIA} aspect-video bg-black/10`}>
                  <ProjectMotion
                    project={entry.project}
                    className="versant-card-image h-full w-full object-cover"
                  />
                </div>
              )}
              <div className="flex flex-1 flex-col pt-4">
                <p className={`${META_LABEL} mb-2 text-[var(--pitch-accent)]`}>
                  {entry.proof}
                </p>
                <h3 className="text-[clamp(24px,2.3vw,34px)] font-medium leading-[1.02] tracking-[-0.038em]">
                  {brandName(entry.project)}{" "}
                  <span className="font-light text-black/54">
                    {entry.project.title}
                  </span>
                </h3>
                <p className="mt-2 text-[clamp(15px,1.25vw,18px)] leading-[1.25] tracking-[-0.018em] text-black/58">
                  {entry.need}
                </p>
                <div className="mt-4 border-t border-black/10 pt-4">
                  <p className={`${META_LABEL} mb-1.5`}>Production reality</p>
                  <p className={META_TEXT}>{entry.logistics}</p>
                </div>
                <p className="mt-4 text-[12px] font-medium tracking-[-0.01em] text-black/36">
                  Directed by {entry.project.director.name}
                </p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function HealthcareLogistics() {
  return (
    <section className={`${SECTION} versant-section-tight`}>
      <div className={CONTAINER}>
        <SectionHeader
          label="The logistics"
          title="Healthcare production has different failure points."
          intro="A normal commercial process breaks quickly when the subject is care. We plan for the constraints that usually show up late and expensive."
        />

        <div className="border-t border-[var(--versant-rule)]">
          {LOGISTICS.map((item, index) => (
            <div
              key={item.label}
              className={`${REVEAL} grid gap-4 border-b border-[var(--versant-rule)] py-5 md:grid-cols-[11rem_minmax(0,1fr)] md:gap-7 md:py-6`}
              style={revealStagger(index)}
            >
              <p className={`${META_LABEL} pt-1 text-[var(--pitch-accent)]`}>
                {item.label}
              </p>
              <p className="max-w-[58rem] text-[clamp(1.18rem,2vw,2.05rem)] leading-[1.08] tracking-[-0.036em] text-black/68">
                {item.body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function HealthcareProcess() {
  return (
    <section className={SECTION}>
      <div className={CONTAINER}>
        <div className={`${REVEAL} relative overflow-hidden rounded-[4px]`}>
          <div className={`${PANEL} relative z-10 overflow-hidden p-5 sm:p-7 lg:p-8`}>
            <SectionHeader
              label="How we would start"
              title={
                <>
                  <span className="font-light">Build the production around</span>{" "}
                  <span className="text-[var(--pitch-accent)]">
                    the review path.
                  </span>
                </>
              }
              intro={
                "The best healthcare work usually comes from fewer surprises, not fewer opinions. We make the stakeholder path explicit, then protect the director's job inside it."
              }
            />

            <div className="grid gap-3 border-t border-black/12 pt-5 md:grid-cols-4">
              {PROCESS.map(([step, label, body]) => (
                <div
                  key={step}
                  className="border-t border-black/10 pt-3 md:border-t-0 md:pt-0"
                >
                  <p className={`${META_LABEL} mb-3 text-[var(--pitch-accent)]`}>
                    {step} / {label}
                  </p>
                  <p className={META_TEXT}>{body}</p>
                </div>
              ))}
            </div>

            <TagList tags={SCOPE_TAGS} className="mt-7" label="Healthcare scope" />
          </div>
        </div>
      </div>
    </section>
  );
}

function HealthcareContact() {
  return (
    <section className={`${SECTION} pb-4 lg:pb-8`}>
      <div className={CONTAINER}>
        <div className={`${REVEAL} relative overflow-hidden rounded-[4px] bg-[var(--pitch-accent)] p-5 text-white sm:p-7 lg:p-8`}>
          <div aria-hidden="true" className={SURFACE_GRAIN} />
          <div className="relative z-10">
            <SectionHeader
              label="Contact"
              title="Send the healthcare brief."
              intro="Send the audience, condition area, stakeholders, review path, claims, required language, talent restrictions, location reality, launch date, and deliverables. We will return a director recommendation, production path, crew shape, timeline, estimate, and delivery plan."
              dark
            />

            <div className="max-w-[48rem]">
              <TagList
                tags={[
                  "Clinical review",
                  "Casting",
                  "Access",
                  "Privacy",
                  "Edit",
                  "Versioning",
                  "Delivery",
                ]}
                dark
                className="mb-8"
                label="Contact scope"
              />
            </div>

            <div className="mt-8 grid gap-x-8 gap-y-5 border-t border-white/16 pt-6 text-white/76 md:grid-cols-3 xl:gap-x-12">
              {CONTACTS.map(([name, email]) => (
                <Contact key={email} value={name} sub={email} href={`mailto:${email}`} />
              ))}
            </div>

            <div className="mt-5">
              <a
                href={INSTAGRAM_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-white/52 transition hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--versant-orange)]"
              >
                <InstagramIcon className="h-[18px] w-[18px]" />
                <span className="text-[13px] font-medium tracking-[-0.01em]">
                  @friendsandfamily.tv
                </span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function ProjectMotion({
  project,
  className,
  eager = false,
}: {
  project: HealthcareProject;
  className?: string;
  eager?: boolean;
}) {
  if (project.sourceVideoUrl) {
    return (
      <video
        aria-label={`${brandName(project)} ${project.title}`}
        src={project.sourceVideoUrl}
        poster={project.thumbnailUrl ?? undefined}
        className={className}
        autoPlay
        muted
        loop
        playsInline
        preload={eager ? "auto" : "metadata"}
      />
    );
  }

  if (project.muxPlaybackId) {
    const still =
      project.thumbnailUrl ??
      muxStillUrl(project.muxPlaybackId, 640, project.duration);
    const animated = muxAnimatedUrl(
      project.muxPlaybackId,
      640,
      project.duration,
    );

    return (
      <div className={`${className ?? ""} relative`}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={still}
          alt={`${brandName(project)} ${project.title}`}
          className={`absolute inset-0 h-full w-full object-cover ${HEALTHCARE_MUX_CROP_CLASS}`}
          loading={eager ? "eager" : "lazy"}
        />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={animated}
          alt=""
          aria-hidden="true"
          className={`absolute inset-0 hidden h-full w-full object-cover ${HEALTHCARE_MUX_CROP_CLASS} motion-safe:block`}
          loading={eager ? "eager" : "lazy"}
        />
      </div>
    );
  }

  if (!project.thumbnailUrl) return null;

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={project.thumbnailUrl}
      alt={`${brandName(project)} ${project.title}`}
      className={className}
      loading={eager ? "eager" : "lazy"}
    />
  );
}

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      className={className}
    >
      <rect
        x="3.25"
        y="3.25"
        width="17.5"
        height="17.5"
        rx="5"
        stroke="currentColor"
        strokeWidth="1.75"
      />
      <circle
        cx="12"
        cy="12"
        r="4.1"
        stroke="currentColor"
        strokeWidth="1.75"
      />
      <circle cx="17.35" cy="6.65" r="1.1" fill="currentColor" />
    </svg>
  );
}

function Contact({
  value,
  sub,
  href,
}: {
  value: string;
  sub?: string;
  href?: string;
}) {
  const inner = (
    <>
      <p className="whitespace-normal text-[clamp(1.05rem,1.7vw,1.45rem)] leading-[1.08] tracking-[-0.032em] sm:whitespace-nowrap">
        {value}
      </p>
      {sub && (
        <p className="mt-2 min-w-0 text-[clamp(0.82rem,1.05vw,0.98rem)] leading-[1.2] tracking-[-0.01em] text-white/52 sm:whitespace-nowrap">
          {sub}
        </p>
      )}
    </>
  );

  if (!href) return <div>{inner}</div>;

  return (
    <a
      href={href}
      className="block min-w-0 transition hover:text-[var(--versant-orange)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--versant-orange)]"
    >
      {inner}
    </a>
  );
}
