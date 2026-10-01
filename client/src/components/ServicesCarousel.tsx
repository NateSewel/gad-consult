import * as React from "react";
import useEmblaCarousel from "embla-carousel-react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { ServiceCard } from "@/components/ServiceCard";

type ServiceItem = {
  title: string;
  description: string;
  closer: string;
  icon: React.ReactNode;
};

const MQ_MD = "(min-width: 640px)";
const MQ_LG = "(min-width: 1024px)";

function useMediaQuery(query: string) {
  const [matches, setMatches] = React.useState(() =>
    typeof window === "undefined" ? false : window.matchMedia(query).matches,
  );
  React.useEffect(() => {
    const mql = window.matchMedia(query);
    const onChange = () => setMatches(mql.matches);
    onChange();
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, [query]);
  return matches;
}

const navButton =
  "grid h-11 w-11 place-items-center rounded-xl border border-border/70 bg-card/70 text-foreground/90 shadow-sm backdrop-blur transition-all duration-300 " +
  "hover:border-primary/40 hover:bg-primary/5 active:scale-[0.97] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring/15 " +
  "aria-disabled:cursor-default aria-disabled:opacity-40 aria-disabled:hover:border-border/70 aria-disabled:hover:bg-card/70 aria-disabled:active:scale-100";

export function ServicesCarousel(props: {
  items: readonly ServiceItem[];
  onLearnMore: (title: string) => void;
}) {
  const { items, onLearnMore } = props;
  const total = items.length;

  const isMd = useMediaQuery(MQ_MD);
  const isLg = useMediaQuery(MQ_LG);
  const reduceMotion = useMediaQuery("(prefers-reduced-motion: reduce)");
  const perView = isLg ? 3 : isMd ? 2 : 1;

  const options = React.useMemo(
    () => ({
      align: "start" as const,
      containScroll: false as const,
      loop: false,
      slidesToScroll: 1,
      duration: reduceMotion ? 0 : 28,
      breakpoints: {
        [MQ_MD]: { slidesToScroll: 2 },
        [MQ_LG]: { slidesToScroll: 3 },
      },
    }),
    [reduceMotion],
  );

  const [viewportRef, api] = useEmblaCarousel(options);
  const [page, setPage] = React.useState(0);
  const [pageCount, setPageCount] = React.useState(Math.ceil(total / perView));
  const [canPrev, setCanPrev] = React.useState(false);
  const [canNext, setCanNext] = React.useState(true);

  React.useEffect(() => {
    if (!api) return;
    const sync = () => {
      setPage(api.selectedScrollSnap());
      setPageCount(api.scrollSnapList().length);
      setCanPrev(api.canScrollPrev());
      setCanNext(api.canScrollNext());
    };
    sync();
    api.on("select", sync).on("reInit", sync);
    return () => {
      api.off("select", sync).off("reInit", sync);
    };
  }, [api]);

  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    // Let focused controls (cards' buttons) keep their own behavior.
    if (e.target !== e.currentTarget) return;
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      api?.scrollPrev();
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      api?.scrollNext();
    }
  };

  const first = Math.min(page * perView + 1, total);
  const last = Math.min(first + perView - 1, total);
  const range = first === last ? `${first}` : `${first}–${last}`;

  return (
    <div data-reveal className="mt-10" data-testid="services-grid">
      <div className="mb-5 flex items-center justify-end gap-4">
        <div className="flex items-center gap-2">
          <button
            type="button"
            className={navButton}
            onClick={() => api?.scrollPrev()}
            // aria-disabled (not disabled) so keyboard focus is not dropped to
            // <body> when the user pages to the first/last page with this button.
            aria-disabled={!canPrev}
            aria-label="Previous services"
            data-testid="services-prev"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            className={navButton}
            onClick={() => api?.scrollNext()}
            aria-disabled={!canNext}
            aria-label="Next services"
            data-testid="services-next"
          >
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div
        role="region"
        aria-roledescription="carousel"
        aria-label="Services"
        tabIndex={0}
        onKeyDown={onKeyDown}
        className="rounded-3xl focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring/15"
      >
        {/* Vertical padding keeps the card hover lift and shadow unclipped; the
            right padding on lg lets the next card peek without page overflow. */}
        <div ref={viewportRef} className="-my-8 overflow-hidden py-8 lg:-mr-12 lg:pr-12">
          <div className="flex touch-pan-y gap-5">
            {items.map((s, idx) => (
              <div
                key={s.title}
                role="group"
                aria-roledescription="slide"
                aria-label={`${idx + 1} of ${total}`}
                className="min-w-0 shrink-0 grow-0 basis-full sm:basis-[calc((100%-1.25rem)/2)] lg:basis-[calc((100%-2.5rem)/3)]"
              >
                <ServiceCard
                  title={s.title}
                  description={s.description}
                  closer={s.closer}
                  icon={s.icon}
                  onLearnMore={() => onLearnMore(s.title)}
                  data-testid={`service-${idx + 1}`}
                  className="h-full"
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-6 flex flex-col-reverse items-center gap-4 sm:flex-row sm:justify-between">
        <p className="text-sm tabular-nums text-muted-foreground" aria-live="polite" data-testid="services-counter">
          {range} of {total}
        </p>
        <div className="flex items-center gap-2" role="group" aria-label="Services pages">
        {Array.from({ length: pageCount }, (_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => api?.scrollTo(i)}
            aria-label={`Go to page ${i + 1}`}
            aria-current={i === page ? "true" : undefined}
            data-testid={`services-dot-${i + 1}`}
            className="group/dot grid h-6 min-w-5 place-items-center rounded-full focus-visible:outline-none"
          >
            <span
              className={cn(
                "block h-2 rounded-full transition-all duration-300 group-focus-visible/dot:ring-4 group-focus-visible/dot:ring-ring/25",
                i === page ? "w-6 bg-primary" : "w-2 bg-border group-hover/dot:bg-primary/40",
              )}
            />
          </button>
        ))}
        </div>
      </div>
    </div>
  );
}
