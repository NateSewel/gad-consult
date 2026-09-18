import { useEffect, useState } from "react";
import { useScroll, useTransform, MotionValue } from "framer-motion";

/**
 * Hook for creating parallax scroll effects
 * Returns a motion value that can be used for transforms
 */
export function useParallax(distance: number = 50): MotionValue<number> {
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 1000], [0, distance]);
  return y;
}

/**
 * Hook for scroll-based opacity fade
 */
export function useScrollOpacity(start: number = 0, end: number = 300): MotionValue<number> {
  const { scrollY } = useScroll();
  const opacity = useTransform(scrollY, [start, end], [1, 0]);
  return opacity;
}
