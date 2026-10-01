import { cn } from "@/lib/utils";
import { ArrowUpRight } from "lucide-react";

export function ServiceCard(props: {
  title: string;
  description: string;
  closer: string;
  icon: React.ReactNode;
  onLearnMore: () => void;
  "data-testid"?: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-3xl border border-border/70 bg-card p-7 shadow-sm",
        "transition-all duration-500 ease-out hover:-translate-y-2 hover:shadow-xl hover:border-primary/30",
        "before:absolute before:inset-0 before:bg-gradient-to-br before:from-primary/5 before:to-secondary/5 before:opacity-0 before:transition-opacity before:duration-500 hover:before:opacity-100",
        props.className,
      )}
      data-testid={props["data-testid"] ?? "service-card"}
    >
      {/* Soft gradient orbs on hover (static, fade in) */}
      <div className="absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100 pointer-events-none">
        <div className="absolute -top-24 -right-24 h-48 w-48 rounded-full bg-secondary/15 blur-3xl" />
        <div className="absolute -bottom-20 -left-20 h-44 w-44 rounded-full bg-primary/15 blur-3xl" />
      </div>

      <div className="relative">
        <div className="flex items-start justify-between gap-4">
          <div className="grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-secondary/95 to-secondary/75 text-secondary-foreground shadow-lg shadow-secondary/20 ring-1 ring-white/10 transition-transform duration-300 ease-out group-hover:scale-105">
            {props.icon}
          </div>

          <button
            onClick={props.onLearnMore}
            className="inline-flex items-center gap-1.5 rounded-xl border border-border/70 bg-card/70 px-3.5 py-2 text-xs font-semibold text-foreground/90 shadow-sm backdrop-blur transition-all duration-300 hover:border-primary/40 hover:bg-primary/5 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring/15"
            data-testid={(props["data-testid"] ?? "service-card") + "-learn-more"}
            type="button"
          >
            Learn more <ArrowUpRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </button>
        </div>

        <h3 className="mt-6 text-xl font-bold leading-tight transition-colors duration-300 group-hover:text-secondary" data-testid="service-title">
          {props.title}
        </h3>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground" data-testid="service-description">
          {props.description}
        </p>

        <div className="mt-6 h-px w-full bg-gradient-to-r from-border/0 via-border/80 to-border/0 transition-all duration-500 group-hover:via-primary/40" />
        <p className="mt-4 text-xs text-muted-foreground/80 transition-colors duration-300 group-hover:text-muted-foreground">
          {props.closer}
        </p>
      </div>
    </div>
  );
}
