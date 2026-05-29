const VERSANT_MOTION_SCRIPT = `
(() => {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (reduceMotion) {
    document.documentElement.classList.add("versant-reduce-motion");
    return;
  }

  const init = () => {
    const cards = Array.from(document.querySelectorAll(".versant-reveal"));

    if (!("IntersectionObserver" in window)) {
      cards.forEach((card) => card.classList.add("is-visible"));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.08, rootMargin: "0px 0px -6% 0px" },
    );

    cards.forEach((card) => observer.observe(card));
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
})();
`;

export function VersantMotion() {
  return <script dangerouslySetInnerHTML={{ __html: VERSANT_MOTION_SCRIPT }} />;
}
