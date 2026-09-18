import { useEffect, useState } from "react";

/**
 * Hook to track which section is currently in view
 * Returns the ID of the active section based on scroll position
 */
export function useActiveSection(sectionIds: string[]) {
  const [activeSection, setActiveSection] = useState<string>(sectionIds[0] || "");

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        // Find the section with the highest intersection ratio
        const visibleSections = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);

        if (visibleSections.length > 0) {
          const topSection = visibleSections[0];
          setActiveSection(topSection.target.id);
        }
      },
      {
        rootMargin: "-20% 0px -60% 0px", // Trigger when section is 20% from top
        threshold: [0, 0.25, 0.5, 0.75, 1],
      }
    );

    // Observe all sections
    sectionIds.forEach((id) => {
      const element = document.getElementById(id);
      if (element) {
        observer.observe(element);
      }
    });

    return () => observer.disconnect();
  }, [sectionIds]);

  return activeSection;
}
