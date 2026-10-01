import { cn } from "@/lib/utils";
import { ArrowRight } from "lucide-react";

export function PrimaryCTA(
  props: React.ButtonHTMLAttributes<HTMLButtonElement> & {
    label: string;
    "data-testid"?: string;
  },
) {
  const { label, className, "data-testid": dataTestId, ...rest } = props;
  return (
    <button
      {...rest}
      className={cn(
        "group relative inline-flex items-center justify-center gap-2 rounded-2xl px-6 py-3 text-sm font-semibold overflow-hidden",
        "bg-[linear-gradient(135deg,hsl(var(--fire)),hsl(var(--fire)_/_0.85))] text-primary-foreground",
        "cta-shadow hover:cta-shadow-hover",
        "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring/20",
        "disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none",
        "transition-[transform,box-shadow] duration-300 ease-out hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98]",
        className,
      )}
      data-testid={dataTestId ?? "primary-cta"}
    >
      {/* Shimmer effect */}
      <span className="pointer-events-none absolute inset-0 shimmer" />
      
      {/* Gradient overlay */}
      <span className="pointer-events-none absolute inset-0 rounded-2xl bg-[radial-gradient(80%_120%_at_10%_10%,rgba(255,255,255,0.4),transparent_65%)] opacity-90" />
      
      <span className="relative z-10">{label}</span>
      <ArrowRight className="relative z-10 h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" />
    </button>
  );
}
