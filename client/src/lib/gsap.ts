import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";
import { useGSAP } from "@gsap/react";

// Client-only SPA: register once, at module load, in the browser only.
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, ScrollToPlugin, useGSAP);
}

export const MOTION_OK = "(prefers-reduced-motion: no-preference)";

/**
 * Smooth-scroll to an element by id, offset by the sticky header height.
 * Reduced motion: jump instantly.
 */
export function scrollToId(id: string) {
  if (typeof window === "undefined") return;
  const el = document.getElementById(id);
  if (!el) return;
  const header = document.querySelector("header");
  const offset = header ? header.getBoundingClientRect().height : 0;

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    const top = el.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({ top, behavior: "auto" });
    return;
  }

  gsap.to(window, {
    duration: 0.9,
    ease: "power3.inOut",
    scrollTo: { y: el, offsetY: offset, autoKill: true },
    overwrite: "auto",
  });
}

export function scrollToTop() {
  if (typeof window === "undefined") return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    window.scrollTo({ top: 0, behavior: "auto" });
    return;
  }
  gsap.to(window, { duration: 0.9, ease: "power3.inOut", scrollTo: { y: 0, autoKill: true }, overwrite: "auto" });
}

export { gsap, ScrollTrigger, useGSAP };
