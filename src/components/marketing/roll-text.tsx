import { cn } from "@/lib/utils";

interface RollTextProps {
  text: string;
  className?: string;
}

/**
 * Vertical text "roll" for links: the label slides up and out while an
 * identical copy rolls up into its place. Fires on hover/focus of the nearest
 * <a>/<button> (see .ff-roll rules in globals.css). The first line carries the
 * accessible name; the second is an aria-hidden duplicate. Reduced-motion → static.
 */
export function RollText({ text, className }: RollTextProps) {
  return (
    <span className={cn("ff-roll", className)}>
      <span className="ff-roll__line">{text}</span>
      <span className="ff-roll__line" aria-hidden="true">
        {text}
      </span>
    </span>
  );
}
