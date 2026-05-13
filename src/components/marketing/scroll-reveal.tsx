"use client";

import { motion, type HTMLMotionProps } from "framer-motion";

interface ScrollRevealProps extends HTMLMotionProps<"div"> {
  delay?: number;
  y?: number;
  children: React.ReactNode;
}

export function ScrollReveal({
  delay = 0,
  y = 24,
  children,
  ...rest
}: ScrollRevealProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay }}
      {...rest}
    >
      {children}
    </motion.div>
  );
}
