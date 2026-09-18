import { useEffect } from "react";
import { useLocation } from "wouter";

export function ScrollToAnchor() {
  const [location] = useLocation();

  useEffect(() => {
    // Support "/#contact" as well as plain "/"
    const hashIndex = location.indexOf("#");
    if (hashIndex === -1) return;

    const id = location.slice(hashIndex + 1);
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
