import { useEffect } from "react";
import { useLocation } from "wouter";
import { scrollToId } from "@/lib/gsap";

export function ScrollToAnchor() {
  const [location] = useLocation();

  useEffect(() => {
    const id = window.location.hash.slice(1);
    if (!id) return;

    // Defer to allow layout paint / images / fonts.
    const t = window.setTimeout(() => scrollToId(id), 50);

    return () => window.clearTimeout(t);
  }, [location]);

  return null;
}
