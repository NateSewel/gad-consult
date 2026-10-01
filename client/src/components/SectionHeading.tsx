import { cn } from "@/lib/utils";

export function SectionHeading(props: {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
  "data-testid"?: string;
}) {
  const align = props.align ?? "left";
  return (
    <div
      data-reveal
      className={cn(
        "max-w-3xl",
        align === "center" ? "mx-auto text-center" : "",
      )}
      data-testid={props["data-testid"] ?? "section-heading"}
    >
      {props.eyebrow ? (
        <div className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-gradient-to-r from-card/80 to-card/60 px-4 py-1.5 text-xs font-semibold text-muted-foreground shadow-sm backdrop-blur-sm">
          <span className="h-1.5 w-1.5 rounded-full bg-primary" />
          <span data-testid="section-eyebrow">{props.eyebrow}</span>
        </div>
      ) : null}
      <h2
        className={cn(
          "text-3xl sm:text-4xl lg:text-5xl font-bold leading-[1.05] text-foreground",
          props.eyebrow ? "mt-5" : "",
        )}
        data-testid="section-title"
      >
        {props.title}
      </h2>
      {props.description ? (
        <p
          className="mt-4 text-sm sm:text-base lg:text-lg text-muted-foreground leading-relaxed"
          data-testid="section-description"
        >
          {props.description}
        </p>
      ) : null}
    </div>
  );
}
