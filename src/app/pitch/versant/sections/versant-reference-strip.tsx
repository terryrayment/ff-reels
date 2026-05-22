const REFERENCES = [
  {
    title: "Golf Channel",
    detail: "promo pace / live pressure",
    marks: ["first tee", "truck", "weather"],
  },
  {
    title: "GolfNow",
    detail: "booking surface / local courses",
    marks: ["tee times", "course maps", "club pros"],
  },
  {
    title: "Big Break x Good Good",
    detail: "format energy / new audience",
    marks: ["games", "timing", "creator tempo"],
  },
  {
    title: "Rory / GolfPass",
    detail: "talent access / quiet golf",
    marks: ["range", "family", "after the round"],
  },
];

export function VersantReferenceStrip() {
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
          {REFERENCES.map((item, index) => (
            <article
              key={item.title}
              className="versant-reveal min-h-[18rem] overflow-hidden rounded-[30px] bg-[var(--versant-white)] p-5 shadow-[0_18px_60px_rgba(17,17,14,0.06)]"
            >
              <div
                aria-hidden="true"
                className="mb-8 aspect-[4/3] rounded-[22px] bg-[linear-gradient(135deg,rgba(12,59,46,0.12),rgba(198,162,76,0.16)),repeating-linear-gradient(90deg,rgba(12,59,46,0.16)_0,rgba(12,59,46,0.16)_1px,transparent_1px,transparent_18px)]"
              >
                <div className="grid h-full grid-cols-3 gap-px p-3 opacity-70">
                  {item.marks.map((mark) => (
                    <div
                      key={mark}
                      className="flex items-end rounded-[14px] bg-[var(--versant-paper)]/80 p-2 text-[11px] leading-none text-black/42"
                    >
                      {mark}
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex items-start justify-between gap-4 border-t border-black/10 pt-4">
                <div>
                  <h3 className="text-[26px] font-medium leading-[1.02] tracking-[-0.035em]">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-[14px] leading-[1.25] text-black/52">
                    {item.detail}
                  </p>
                </div>
                <span className="text-right text-[12px] text-black/38">
                  ref {String(index + 1).padStart(2, "0")}
                </span>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
