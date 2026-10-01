import type { RefObject } from "react";
import { gsap, ScrollTrigger, useGSAP, MOTION_OK } from "@/lib/gsap";

/**
 * Scroll reveals for every `[data-reveal]` element inside `scope`.
 * Hidden state is applied from JS only (never CSS), so if this never runs
 * (JS failure, reduced motion) content stays fully visible.
 */
export function useReveal(scope: RefObject<HTMLElement | null>) {
  useGSAP(
    () => {
      const root = scope.current;
      if (!root) return;
      const mm = gsap.matchMedia();

      mm.add(MOTION_OK, () => {
        const items = Array.from(root.querySelectorAll<HTMLElement>("[data-reveal]"));
        if (!items.length) return;
        const cleanups: Array<() => void> = [];

        const show = (els: Element[]) =>
          gsap.to(els, {
            y: 0,
            opacity: 1,
            duration: 0.7,
            ease: "power3.out",
            stagger: 0.08,
            overwrite: true,
            clearProps: "transform,opacity,transition",
          });

        // Many reveal targets carry Tailwind `transition-all` (hover lift). A CSS
        // transition on transform/opacity fights GSAP's per-frame inline writes
        // (laggy reveal, visible fade-out on the initial hide), so suspend it
        // until the reveal finishes; clearProps hands it back to the stylesheet.
        gsap.set(items, { y: 24, opacity: 0, transition: "none" });

        ScrollTrigger.batch(items, {
          start: "top 88%",
          once: true,
          onEnter: show,
        });

        // Failsafe: anything already in view after layout settles must not stay hidden.
        const settle = () => {
          ScrollTrigger.refresh();
          const stuck = items.filter(
            (el) => Number(gsap.getProperty(el, "opacity")) === 0 && el.getBoundingClientRect().top < window.innerHeight * 0.88,
          );
          if (stuck.length) show(stuck);
        };

        const timer = window.setTimeout(settle, 1200);
        cleanups.push(() => window.clearTimeout(timer));

        document.fonts?.ready.then(() => ScrollTrigger.refresh());
        if (document.readyState !== "complete") {
          window.addEventListener("load", settle, { once: true });
          cleanups.push(() => window.removeEventListener("load", settle));
        }

        // Runs when this matchMedia branch reverts (unmount, or reduced-motion
        // toggled on), so a stale timer/listener never outlives its run.
        return () => cleanups.forEach((fn) => fn());
      });

      return () => mm.revert();
    },
    { scope },
  );
}

/** Hero intro timeline + subtle scrubbed parallax on the background image. */
export function useHeroIntro(scope: RefObject<HTMLElement | null>) {
  useGSAP(
    () => {
      const root = scope.current;
      if (!root) return;
      const mm = gsap.matchMedia();

      mm.add(MOTION_OK, () => {
        const q = (name: string) => root.querySelectorAll(`[data-hero="${name}"]`);
        const rise = (y: number) => ({ y, opacity: 0 });
        const to = (d: number) => ({ y: 0, opacity: 1, duration: d, clearProps: "transform,opacity,transition" });

        // Stat chips have a CSS transform transition (hover lift) that would fight the tween.
        gsap.set(q("stat"), { transition: "none" });

        const tl = gsap.timeline({ defaults: { ease: "expo.out" } });
        tl.fromTo(q("bg"), { scale: 1.1 }, { scale: 1, duration: 1.6, ease: "power2.out" }, 0)
          .fromTo(q("veil"), { opacity: 0 }, { opacity: 1, duration: 1, ease: "power1.out" }, 0)
          .fromTo(q("kicker"), rise(16), to(0.7), 0.1)
          .fromTo(q("title"), rise(28), to(0.9), 0.2)
          .fromTo(q("desc"), rise(20), to(0.8), 0.4)
          .fromTo(q("ctas"), rise(20), to(0.8), 0.55)
          .fromTo(q("trust"), { opacity: 0 }, { opacity: 1, duration: 0.8, clearProps: "opacity" }, 0.7)
          .fromTo(q("stat"), rise(20), { ...to(0.7), stagger: 0.08 }, 0.75);

        gsap.to(q("bg"), {
          yPercent: 10,
          ease: "none",
          scrollTrigger: {
            trigger: root,
            start: "top top",
            end: "bottom top",
            scrub: true,
          },
        });
      });

      return () => mm.revert();
    },
    { scope },
  );
}

/** Draws the how-it-works connector line (left to right) as the steps come into view. */
export function useConnectorDraw(scope: RefObject<HTMLElement | null>) {
  useGSAP(
    () => {
      const root = scope.current;
      if (!root) return;
      const mm = gsap.matchMedia();

      mm.add(MOTION_OK, () => {
        const line = root.querySelector<HTMLElement>("[data-connector]");
        if (!line) return;
        gsap.fromTo(
          line,
          { scaleX: 0, transformOrigin: "left center" },
          {
            scaleX: 1,
            duration: 1.2,
            ease: "power3.inOut",
            scrollTrigger: { trigger: line, start: "top 85%", once: true },
          },
        );
      });

      return () => mm.revert();
    },
    { scope },
  );
}
