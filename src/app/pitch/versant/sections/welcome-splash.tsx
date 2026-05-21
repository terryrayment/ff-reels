interface Props {
  recipientFirstName?: string | null;
}

const FORMAT_ROWS = [
  ["Format", "film / promo / open / portrait / cutdown"],
  ["Inputs", "script / boards / footage / talent window"],
  ["Output", "finished, versioned, delivered"],
];

export function WelcomeSplash({ recipientFirstName }: Props) {
  return (
    <section className="px-4 py-4 text-[var(--versant-ink)] sm:px-6 lg:px-8">
      <div className="mx-auto grid min-h-[calc(100svh-2rem)] max-w-[1600px] gap-4 lg:grid-cols-12">
        <article className="relative flex min-h-[34rem] flex-col justify-between overflow-hidden rounded-[42px] bg-[var(--versant-black)] p-7 text-[var(--versant-white)] sm:p-10 lg:col-span-7 lg:min-h-[calc(100svh-2rem)] lg:p-12 xl:rounded-[52px]">
          <div
            aria-hidden="true"
            className="absolute -right-16 top-20 h-52 w-52 rounded-full border border-white/12 sm:h-72 sm:w-72"
          />
          <div
            aria-hidden="true"
            className="absolute bottom-12 right-12 hidden h-2 w-2 rounded-full bg-[var(--versant-orange)] lg:block"
          />

          <div className="relative z-10 flex items-center justify-between gap-4 text-[10px] uppercase tracking-[0.18em] text-white/55">
            <span>Friends &amp; Family for Versant</span>
            <span>{recipientFirstName ? `For ${recipientFirstName}` : "Golf Channel lead"}</span>
          </div>

          <div className="relative z-10 max-w-5xl py-12 lg:py-16">
            <p className="mb-6 inline-flex rounded-full border border-white/18 px-4 py-2 text-[10px] uppercase tracking-[0.18em] text-white/70">
              Friends &amp; Family for Versant
            </p>
            <h1 className="text-[clamp(64px,11vw,160px)] font-medium leading-[0.86] tracking-[-0.07em]">
              Golf Channel first.{" "}
              <br />
              Flexible for everything after.
            </h1>
          </div>

          <div className="relative z-10 flex flex-wrap gap-2 border-t border-white/14 pt-5 text-[10px] uppercase tracking-[0.18em] text-white/62">
            {[
              "Production partner",
              "Directors",
              "Live action",
              "Post",
              "Motion",
              "Social delivery",
            ].map((item) => (
              <span key={item} className="rounded-full border border-white/14 px-3 py-1.5">
                {item}
              </span>
            ))}
          </div>
        </article>

        <div className="grid gap-4 lg:col-span-5 lg:grid-rows-[1.25fr_0.85fr_0.9fr]">
          <article className="rounded-[36px] bg-[var(--versant-orange)] p-6 text-[var(--versant-ink)] sm:p-8 lg:rounded-[44px]">
            <div className="mb-8 flex items-center justify-between gap-4">
              <p className="rounded-full bg-[var(--versant-ink)] px-4 py-2 text-[10px] uppercase tracking-[0.18em] text-white">
                Start here
              </p>
              <span className="text-[12px] uppercase tracking-[0.16em] text-black/55">
                live input
              </span>
            </div>
            <h2 className="mb-8 max-w-md text-[clamp(42px,6vw,88px)] font-medium leading-[0.88] tracking-[-0.06em]">
              Bring us the shape.
            </h2>
            <div className="space-y-3">
              {FORMAT_ROWS.map(([label, value]) => (
                <div
                  key={label}
                  className="grid gap-2 border-t border-black/18 pt-3 text-[13px] sm:grid-cols-[5rem_1fr]"
                >
                  <span className="text-[10px] uppercase tracking-[0.18em] text-black/50">
                    {label}
                  </span>
                  <span>{value}</span>
                </div>
              ))}
            </div>
          </article>

          <article className="rounded-[34px] bg-[var(--versant-white)] p-6 sm:p-8 lg:rounded-[44px]">
            <p className="mb-8 rounded-full bg-[var(--versant-soft-gray)] px-4 py-2 text-[10px] uppercase tracking-[0.18em] text-black/55">
              What we are
            </p>
            <p className="max-w-lg text-[clamp(28px,4vw,54px)] font-medium leading-[0.95] tracking-[-0.055em]">
              A director-led production company that can flex around the
              assignment.
            </p>
          </article>

          <article className="rounded-[34px] bg-[var(--versant-mint)] p-6 sm:p-8 lg:rounded-[44px]">
            <p className="mb-8 rounded-full bg-[var(--versant-ink)] px-4 py-2 text-[10px] uppercase tracking-[0.18em] text-white">
              What we are doing here
            </p>
            <p className="max-w-md text-[clamp(28px,4vw,52px)] font-medium leading-[0.95] tracking-[-0.055em]">
              Showing range, fit, and production judgment.
            </p>
          </article>
        </div>
      </div>
    </section>
  );
}
