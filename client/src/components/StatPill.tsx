import { cn } from "@/lib/utils";

export function StatPill(props: {
  label: string;
  value: string;
  icon?: React.ReactNode;
  className?: string;
  "data-testid"?: string;
}) {
  return (
    <div
      className={cn(
        "group rounded-2xl border border-border/70 bg-card/70 px-4 py-3 shadow-sm backdrop-blur",
        "transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md hover:border-border",
        props.className,
      )}
      data-testid={props["data-testid"] ?? "stat-pill"}
    >
      <div className="flex items-center gap-3">
        {props.icon ? (
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-muted text-secondary shadow-inner ring-1 ring-border/60">
            {props.icon}
          </div>
        ) : null}
        <div className="min-w-0">
          <div className="text-sm font-semibold text-foreground" data-testid="stat-value">
            {props.value}
          </div>
          <div className="text-xs text-muted-foreground" data-testid="stat-label">
            {props.label}
          </div>
        </div>
      </div>
    </div>
  );
}
