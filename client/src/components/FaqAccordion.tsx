import { useRef, useState } from "react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

// Hover-to-open only on desktop-class pointers; touch/tablet keep tap-to-toggle.
const DESKTOP_HOVER = "(hover: hover) and (pointer: fine) and (min-width: 1024px)";
// Layout shifts while one item closes and another opens; ignore hover until that settles,
// otherwise the item sliding under the cursor re-triggers an open and the panel jitters.
const SETTLE_MS = 350;

export function FaqAccordion(props: { items: readonly { q: string; a: string }[] }) {
  const [value, setValue] = useState("");
  const lockUntil = useRef(0);

  function change(next: string) {
    lockUntil.current = Date.now() + SETTLE_MS;
    setValue(next);
  }

  function openOnHover(id: string) {
    if (id === value || Date.now() < lockUntil.current) return;
    if (!window.matchMedia(DESKTOP_HOVER).matches) return;
    change(id);
  }

  return (
    <Accordion type="single" collapsible value={value} onValueChange={change}>
      {props.items.map((faq, idx) => {
        const id = `faq-${idx}`;
        return (
          <AccordionItem
            key={faq.q}
            value={id}
            onPointerMove={(e) => e.pointerType === "mouse" && openOnHover(id)}
            data-testid={`faq-item-${idx + 1}`}
          >
            <AccordionTrigger className="text-left text-sm sm:text-base font-semibold hover:no-underline">
              {faq.q}
            </AccordionTrigger>
            <AccordionContent className="text-sm text-muted-foreground leading-relaxed">{faq.a}</AccordionContent>
          </AccordionItem>
        );
      })}
    </Accordion>
  );
}
