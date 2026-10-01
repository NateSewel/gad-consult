import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

/** Inline load-failure panel with a retry. `testid` keeps each page's state addressable. */
export function AdminErrorState(props: {
  message: string;
  onRetry: () => void;
  testid: string;
  retrying?: boolean;
}) {
  return (
    <div
      role="alert"
      className="mt-8 rounded-2xl border border-border/70 bg-card p-6 text-center"
      data-testid={props.testid}
    >
      <p className="text-sm font-semibold text-admin-danger">{props.message}</p>
      <Button
        variant="outline"
        size="sm"
        className="mt-3"
        onClick={props.onRetry}
        disabled={props.retrying}
        data-testid={`${props.testid}-retry`}
      >
        {props.retrying ? "Retrying…" : "Try again"}
      </Button>
    </div>
  );
}

/** Placeholder rows shaped like the real list rows, so layout doesn't jump on load. */
export function AdminListSkeleton(props: { rows?: number; rowClassName?: string; testid?: string }) {
  const rows = props.rows ?? 4;
  return (
    <div
      className="mt-8 grid gap-3"
      role="status"
      aria-label="Loading"
      data-testid={props.testid ?? "admin-list-skeleton"}
    >
      {Array.from({ length: rows }, (_, i) => (
        <Skeleton key={i} className={props.rowClassName ?? "h-[74px] rounded-2xl"} />
      ))}
    </div>
  );
}

/** Shared input chrome: 3:1 border contrast (WCAG 1.4.11) plus the shadcn focus ring. */
export const adminFieldClass =
  "rounded-xl border-muted-foreground/80 bg-background px-3.5 py-2.5 text-base md:text-sm min-h-11 h-auto";
