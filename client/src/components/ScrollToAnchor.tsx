import { useEffect } from "react";
import { useLocation } from "wouter";

export function ScrollToAnchor() {
  const [location] = useLocation();

  useEffect(() => {
    const id = window.location.hash.slice(1);
    if (!id) return;

    // Defer to allow layout paint / images / fonts.
    const t = window.setTimeout(() => {
      const el = document.getElementById(id);
      el?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 50);

    return () => window.clearTimeout(t);
  }, [location]);

  return null;
}
