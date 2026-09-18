import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

export function SectionHeading(props: {
  eyebrow: string;
  title: string;
  description?: string;
  align?: "left" | "center";
  "data-testid"?: string;
}) {
  const align = props.align ?? "left";
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className={cn(
        "max-w-3xl",
        align === "center" ? "mx-auto text-center" : "",
      )}
      data-testid={props["data-testid"] ?? "section-heading"}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-gradient-to-r from-card/80 to-card/60 px-4 py-1.5 text-xs font-semibold text-muted-foreground shadow-sm backdrop-blur-sm"
      >
        <motion.span
          animate={{ scale: [1, 1.2, 1], opacity: [1, 0.7, 1] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="h-1.5 w-1.5 rounded-full bg-primary"
        />
        <span data-testid="section-eyebrow">{props.eyebrow}</span>
      </motion.div>
      <motion.h2
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="mt-5 text-3xl sm:text-4xl lg:text-5xl font-bold leading-[1.05] bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text text-transparent"
        data-testid="section-title"
      >
        {props.title}
      </motion.h2>
      {props.description ? (
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-4 text-sm sm:text-base lg:text-lg text-muted-foreground leading-relaxed"
          data-testid="section-description"
        >
          {props.description}
        </motion.p>
      ) : null}
    </motion.div>
  );
}
