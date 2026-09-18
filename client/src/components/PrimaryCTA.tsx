import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

export function PrimaryCTA(
  props: React.ButtonHTMLAttributes<HTMLButtonElement> & {
    label: string;
    "data-testid"?: string;
  },
) {
  const { label, className, "data-testid": dataTestId, ...rest } = props;
  return (
    <motion.button
      {...rest}
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className={cn(
        "group relative inline-flex items-center justify-center gap-2 rounded-2xl px-6 py-3 text-sm font-semibold overflow-hidden",
        "bg-[linear-gradient(135deg,hsl(var(--fire)),hsl(var(--fire)_/_0.85))] text-primary-foreground",
        "cta-shadow hover:cta-shadow-hover",
        "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring/20",
        "disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none",
        "transition-shadow duration-300 ease-out",
        className,
      )}
      data-testid={dataTestId ?? "primary-cta"}
    >
      {/* Shimmer effect */}
      <span className="pointer-events-none absolute inset-0 shimmer" />
      
      {/* Gradient overlay */}
      <span className="pointer-events-none absolute inset-0 rounded-2xl bg-[radial-gradient(80%_120%_at_10%_10%,rgba(255,255,255,0.4),transparent_65%)] opacity-90" />
      
      <span className="relative z-10">{label}</span>
      <motion.div
        className="relative z-10"
        animate={{ x: [0, 3, 0] }}
        transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
      >
        <ArrowRight className="h-4 w-4" />
      </motion.div>
    </motion.button>
  );
}
