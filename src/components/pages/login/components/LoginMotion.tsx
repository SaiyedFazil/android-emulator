"use client";

import { MotionConfig } from "motion/react";

/** Honours the OS "reduce motion" setting for every Motion animation on the sign-in page. */
export function LoginMotion({ children }: { children: React.ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
