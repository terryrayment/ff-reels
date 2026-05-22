import {
  motionForDirector,
  muxAnimatedUrl,
  muxStillUrl,
  type VersantDirectorMedia,
} from "./media";

const REFERENCES = [
  {
    title: "Golf Channel",
    detail: "promo pace / live pressure",
    marks: ["first tee", "truck", "weather"],
    slug: "caleb-slain",
  },
  {
    title: "GolfNow",
    detail: "booking surface / local courses",
    marks: ["tee times", "course maps", "club pros"],
    slug: "jack-turits",
    media: {
      muxPlaybackId: "BhZH005xwxQZJTuLSYOKSqFaGCSX5SlgFIAOeSntKqs8",
      duration: 30.196844,
      start: 9,
    },
  },
  {
    title: "Big Break x Good Good",
    detail: "format energy / new audience",
    marks: ["games", "timing", "creator tempo"],
    slug: "matt-dilmore",
  },
  {
    title: "Rory / GolfPass",
    detail: "talent access / quiet golf",
    marks: ["range", "family", "after the round"],
    slug: "terry-rayment",
  },
];

export function VersantReferenceStrip({
  directors,
}: {
  directors: VersantDirectorMedia[];
}) {
  return (
    <section className="px-4 py-8 sm:px-6 lg:px-8 lg:py-14">
      <div className="mx-auto max-w-[1500px]">
        <div className="mb-8 grid gap-5 lg:grid-cols-12 lg:items-end">
          <p className="max-w-[46rem] text-[clamp(30px,4.8vw,74px)] font-medium leading-[1.02] tracking-[-0.045em] lg:col-span-7">
            We watch the pace, the quiet, the miss, the cut after the miss.
          </p>
          <p className="max-w-[38rem] text-[18px] leading-[1.35] tracking-[-0.02em] text-black/55 lg:col-span-4 lg:col-start-9">
            Editorial references only. Versant&apos;s world gives us the rhythm;
            the F&amp;F work below shows how we&apos;d carry it.
          </p>
        </div>

        <div className="grid gap-3 md:grid-cols-4">
          {REFERENCES.map((item, index) => {
            const frame = "media" in item && item.media
              ? {
                  still: muxStillUrl(
                    item.media.muxPlaybackId,
                    640,
                    item.media.duration,
                    item.media.start,
                  ),
                  animated: muxAnimatedUrl(
                    item.media.muxPlaybackId,
                    640,
                    item.media.duration,
                    item.media.start,
                  ),
                }
              : motionForDirector(directors, item.slug, 640);

            return (
              <article
                key={item.title}
                className="versant-reveal flex min-h-[18rem] flex-col overflow-hidden rounded-[30px] bg-[var(--versant-white)] p-5 shadow-[0_18px_60px_rgba(17,17,14,0.05)]"
              >
                <div
                  aria-hidden="true"
                  className="relative mb-8 aspect-[4/3] overflow-hidden rounded-[22px] bg-[var(--versant-soft-gray)]"
                >
                  {frame.still && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={frame.still}
                      alt=""
                      className={`h-full w-full scale-110 object-cover opacity-72 ${
                        frame.animated ? "motion-safe:hidden" : ""
                      }`}
                      loading="lazy"
                    />
                  )}
                  {frame.animated && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={frame.animated}
                      alt=""
                      className="absolute inset-0 hidden h-full w-full scale-110 object-cover opacity-72 motion-safe:block"
                      loading="lazy"
                    />
                  )}
                  <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(12,59,46,0.02),rgba(12,59,46,0.46))]" />
                  <div className="absolute inset-x-3 bottom-3 flex flex-wrap gap-x-3 gap-y-1 text-[11px] leading-none text-white/72">
                    {item.marks.map((mark) => (
                      <span key={mark}>{mark}</span>
                    ))}
                  </div>
                </div>
              <div className="mt-auto grid min-h-[9.5rem] grid-cols-[1fr_auto] items-start gap-4 border-t border-black/10 pt-4">
                <div className="grid h-full grid-rows-[minmax(4.7rem,auto)_auto]">
                  <h3 className="text-[26px] font-medium leading-[1.02] tracking-[-0.035em]">
                    {item.title}
                  </h3>
                  <p className="self-start text-[14px] leading-[1.25] text-black/52">
                    {item.detail}
                  </p>
                </div>
                <span className="text-right text-[12px] text-black/38">
                  ref {String(index + 1).padStart(2, "0")}
                </span>
              </div>
            </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
