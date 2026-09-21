import { AdminLayout } from "@/components/AdminLayout";
import { useAdminSubmissions } from "@/hooks/use-admin";

function formatDate(value: Date | string) {
  return new Date(value).toLocaleString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function AdminSubmissions() {
  const { data: submissions, isLoading } = useAdminSubmissions();

  return (
    <AdminLayout>
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold" data-testid="admin-submissions-title">
          Submissions
        </h1>
        <a
          href="/api/admin/submissions/export.csv"
          className="rounded-2xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-md"
          data-testid="admin-export-submissions-link"
        >
          Export CSV
        </a>
      </div>

      {isLoading ? (
        <div className="mt-8 text-sm text-muted-foreground">Loading…</div>
      ) : !submissions || submissions.length === 0 ? (
        <div
          className="mt-8 rounded-3xl border border-border/70 bg-card p-8 text-center text-sm text-muted-foreground"
          data-testid="admin-submissions-empty"
        >
          No submissions yet.
        </div>
      ) : (
        <div className="mt-8 grid gap-3" data-testid="admin-submissions-list">
          {submissions.map((submission) => (
            <div
              key={submission.id}
              className="rounded-2xl border border-border/70 bg-card p-4"
              data-testid={`admin-submission-row-${submission.id}`}
            >
              <div className="flex items-center justify-between gap-4">
                <span
                  className="font-semibold truncate"
                  data-testid={`admin-submission-name-${submission.id}`}
                >
                  {submission.fullName}
                </span>
                <span
                  className="shrink-0 text-xs text-muted-foreground"
                  data-testid={`admin-submission-date-${submission.id}`}
                >
                  {formatDate(submission.createdAt)}
                </span>
              </div>
              <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                <span data-testid={`admin-submission-email-${submission.id}`}>{submission.email}</span>
                <span data-testid={`admin-submission-phone-${submission.id}`}>{submission.phone}</span>
                <span data-testid={`admin-submission-service-${submission.id}`}>
                  {submission.serviceInterestedIn ?? "—"}
                </span>
              </div>
              <p
                className="mt-2 text-sm text-foreground line-clamp-3"
                data-testid={`admin-submission-message-${submission.id}`}
              >
                {submission.message}
              </p>
            </div>
          ))}
        </div>
      )}
    </AdminLayout>
  );
}
