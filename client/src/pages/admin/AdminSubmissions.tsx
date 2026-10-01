import { useMemo, useState } from "react";
import { AdminLayout } from "@/components/AdminLayout";
import { AdminErrorState, AdminListSkeleton, adminFieldClass } from "@/components/AdminStates";
import { useAdminSubmissions, getAdminErrorMessage } from "@/hooks/use-admin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { Download, Search } from "lucide-react";

const PAGE_SIZE = 25;
// Messages longer than this are clamped to 3 lines and get a "Show more" toggle.
const LONG_MESSAGE = 180;

function formatDate(value: Date | string) {
  return new Date(value).toLocaleString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

const linkClass =
  "rounded-sm underline-offset-2 hover:text-foreground hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

export default function AdminSubmissions() {
  const { data: submissions, isLoading, isError, error, refetch, isFetching } = useAdminSubmissions();
  const [query, setQuery] = useState("");
  const [visible, setVisible] = useState(PAGE_SIZE);
  const [expanded, setExpanded] = useState<Set<number>>(new Set());

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!submissions) return [];
    if (!q) return submissions;
    return submissions.filter((s) =>
      [s.fullName, s.email, s.phone, s.serviceInterestedIn ?? "", s.message].some((v) =>
        v.toLowerCase().includes(q),
      ),
    );
  }, [submissions, query]);

  const shown = filtered.slice(0, visible);

  function toggleExpanded(id: number) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  return (
    <AdminLayout>
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-semibold" data-testid="admin-submissions-title">
            Submissions
          </h1>
          {submissions && submissions.length > 0 ? (
            <span
              className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-semibold text-muted-foreground"
              data-testid="admin-submissions-count"
            >
              {submissions.length}
            </span>
          ) : null}
        </div>
        <Button asChild className="min-h-11 rounded-xl md:min-h-9">
          <a href="/api/admin/submissions/export.csv" download data-testid="admin-export-submissions-link">
            <Download aria-hidden="true" />
            Export CSV
          </a>
        </Button>
      </div>

      {submissions && submissions.length > PAGE_SIZE ? (
        <div className="mt-6 max-w-md">
          <Label htmlFor="admin-submissions-search" className="sr-only">
            Search submissions
          </Label>
          <div className="relative">
            <Search
              className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <Input
              id="admin-submissions-search"
              type="search"
              placeholder="Search by name, email, phone, service or message"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setVisible(PAGE_SIZE);
              }}
              className={cn(adminFieldClass, "pl-10")}
              data-testid="admin-submissions-search"
            />
          </div>
        </div>
      ) : null}

      {isLoading ? (
        <AdminListSkeleton rows={4} rowClassName="h-[112px] rounded-2xl" testid="admin-submissions-loading" />
      ) : isError ? (
        <AdminErrorState
          message={getAdminErrorMessage(error, "Could not load submissions.")}
          onRetry={() => refetch()}
          retrying={isFetching}
          testid="admin-submissions-error"
        />
      ) : !submissions || submissions.length === 0 ? (
        <div
          className="mt-8 rounded-3xl border border-border/70 bg-card p-8 text-center text-sm text-muted-foreground"
          data-testid="admin-submissions-empty"
        >
          No submissions yet. Enquiries from the contact form will appear here.
        </div>
      ) : filtered.length === 0 ? (
        <div
          className="mt-8 rounded-3xl border border-border/70 bg-card p-8 text-center text-sm text-muted-foreground"
          role="status"
          data-testid="admin-submissions-no-results"
        >
          No submissions match "{query.trim()}".
        </div>
      ) : (
        <>
          <p className="sr-only" role="status" aria-live="polite">
            Showing {shown.length} of {filtered.length} submissions
          </p>
          <ul className="mt-8 grid gap-3" data-testid="admin-submissions-list">
            {shown.map((submission) => {
              const isLong = submission.message.length > LONG_MESSAGE || submission.message.includes("\n");
              const isOpen = expanded.has(submission.id);
              return (
                <li
                  key={submission.id}
                  className="rounded-2xl border border-border/70 bg-card p-4"
                  data-testid={`admin-submission-row-${submission.id}`}
                >
                  <div className="flex flex-col gap-0.5 sm:flex-row sm:items-baseline sm:justify-between sm:gap-4">
                    <span
                      className="min-w-0 truncate font-semibold"
                      data-testid={`admin-submission-name-${submission.id}`}
                    >
                      {submission.fullName}
                    </span>
                    <time
                      dateTime={new Date(submission.createdAt).toISOString()}
                      className="shrink-0 text-xs text-muted-foreground"
                      data-testid={`admin-submission-date-${submission.id}`}
                    >
                      {formatDate(submission.createdAt)}
                    </time>
                  </div>
                  <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                    <a
                      href={`mailto:${encodeURIComponent(submission.email).replace(/%40/g, "@")}`}
                      className={linkClass}
                      data-testid={`admin-submission-email-${submission.id}`}
                    >
                      {submission.email}
                    </a>
                    <a
                      href={`tel:${submission.phone.replace(/[^\d+]/g, "")}`}
                      className={linkClass}
                      data-testid={`admin-submission-phone-${submission.id}`}
                    >
                      {submission.phone}
                    </a>
                    <span data-testid={`admin-submission-service-${submission.id}`}>
                      {submission.serviceInterestedIn ?? "No service selected"}
                    </span>
                  </div>
                  <p
                    id={`admin-submission-message-${submission.id}`}
                    className={cn(
                      "mt-2 whitespace-pre-wrap break-words text-sm text-foreground",
                      isLong && !isOpen && "line-clamp-3",
                    )}
                    data-testid={`admin-submission-message-${submission.id}`}
                  >
                    {submission.message}
                  </p>
                  {isLong ? (
                    <button
                      type="button"
                      onClick={() => toggleExpanded(submission.id)}
                      aria-expanded={isOpen}
                      aria-controls={`admin-submission-message-${submission.id}`}
                      className="mt-1.5 rounded-sm text-xs font-semibold text-admin-accent hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      data-testid={`admin-submission-toggle-${submission.id}`}
                    >
                      {isOpen ? "Show less" : "Show full message"}
                    </button>
                  ) : null}
                </li>
              );
            })}
          </ul>
          {filtered.length > shown.length ? (
            <div className="mt-6 flex flex-col items-center gap-2">
              <p className="text-xs text-muted-foreground">
                Showing {shown.length} of {filtered.length}
              </p>
              <Button
                variant="outline"
                className="min-h-11 rounded-xl md:min-h-9"
                onClick={() => setVisible((v) => v + PAGE_SIZE)}
                data-testid="admin-submissions-load-more"
              >
                Show {Math.min(PAGE_SIZE, filtered.length - shown.length)} more
              </Button>
            </div>
          ) : null}
        </>
      )}
    </AdminLayout>
  );
}
