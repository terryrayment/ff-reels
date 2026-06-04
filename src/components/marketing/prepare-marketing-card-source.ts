import type { RefObject } from "react";
import { isSameDirectorPlayNavigation } from "@/components/marketing/view-transition";

export async function prepareMarketingCardSourceForTransition(
  link: HTMLAnchorElement,
  sourceElement: HTMLElement | null,
  imageRef: RefObject<HTMLImageElement | null>,
) {
  if (!isSameDirectorPlayNavigation(link.href)) {
    link.scrollIntoView({ block: "center", inline: "nearest" });
  }
  sourceElement?.classList.add("is-visible");

  const image = imageRef.current;
  if (image && !image.complete) {
    await new Promise<void>((resolve) => {
      const done = () => resolve();
      image.addEventListener("load", done, { once: true });
      image.addEventListener("error", done, { once: true });
      window.setTimeout(done, 1600);
    });
  }

  if (image && image.naturalWidth === 0) {
    await new Promise<void>((resolve) => {
      const done = () => resolve();
      image.addEventListener("load", done, { once: true });
      image.addEventListener("error", done, { once: true });
      window.setTimeout(done, 1600);
    });
  }

  await new Promise<void>((resolve) => {
    window.requestAnimationFrame(() => resolve());
  });
}
