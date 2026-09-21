import { Link } from "wouter";
import { AdminLayout } from "@/components/AdminLayout";
import { useAdminPosts, useAdminSubmissions } from "@/hooks/use-admin";
import { FileText, CheckCircle2, FileEdit, Inbox, TrendingUp } from "lucide-react";

function formatDate(value: Date | string) {
  return new Date(value).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

function StatCard(props: { label: string; value: number; icon: typeof FileText; testid: string }) {
  const Icon = props.icon;
  return (
    <div
      className="rounded-3xl border border-border/70 bg-card p-6 shadow-sm"
      data-testid={props.testid}
    >
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-muted-foreground">{props.label}</span>
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
          <Icon className="h-4 w-4" />
        </span>
      </div>
      <div className="mt-3 text-3xl font-semibold" data-testid={`${props.testid}-value`}>
        {props.value}
      </div>
    </div>
  );
}

export default function AdminOverview() {
  const { data: posts, isLoading: postsLoading } = useAdminPosts();
  const { data: submissions, isLoading: submissionsLoading } = useAdminSubmissions();

  const isLoading = postsLoading || submissionsLoading;

  const totalPosts = posts?.length ?? 0;
  const published = posts?.filter((p) => p.status === "published").length ?? 0;
  const drafts = posts?.filter((p) => p.status === "draft").length ?? 0;
  const totalSubmissions = submissions?.length ?? 0;

  const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const thisWeek =
    submissions?.filter((s) => new Date(s.createdAt).getTime() >= oneWeekAgo).length ?? 0;

  const recentSubmissions = [...(submissions ?? [])]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  return (
    <AdminLayout>
      <h1 className="text-2xl font-semibold" data-testid="admin-overview-title">
        Overview
      </h1>

      {isLoading ? (
        <div className="mt-8 text-sm text-muted-foreground">Loading…</div>
      ) : (
        <>
          <div
            className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4"
            data-testid="admin-stats-grid"
          >
            <StatCard label="Total Posts" value={totalPosts} icon={FileText} testid="admin-stat-total-posts" />
            <StatCard label="Published" value={published} icon={CheckCircle2} testid="admin-stat-published" />
            <StatCard label="Drafts" value={drafts} icon={FileEdit} testid="admin-stat-drafts" />
            <StatCard
              label="Total Submissions"
              value={totalSubmissions}
              icon={Inbox}
              testid="admin-stat-total-submissions"
            />
            <StatCard label="This Week" value={thisWeek} icon={TrendingUp} testid="admin-stat-this-week" />
          </div>

          <div className="mt-8 rounded-3xl border border-border/70 bg-card p-6 shadow-sm">
            <div className="flex items-center justify-between gap-4">
              <h2 className="text-lg font-semibold" data-testid="admin-recent-submissions-title">
                Recent Submissions
              </h2>
              <Link
                href="/admin/submissions"
                className="text-sm font-semibold text-primary hover:underline"
                data-testid="admin-recent-submissions-view-all"
              >
                View all
              </Link>
            </div>

            {recentSubmissions.length === 0 ? (
              <div
                className="mt-6 rounded-2xl border border-border/70 bg-background p-6 text-center text-sm text-muted-foreground"
                data-testid="admin-recent-submissions-empty"
              >
                No submissions yet.
              </div>
            ) : (
              <div className="mt-4 grid gap-2" data-testid="admin-recent-submissions-list">
                {recentSubmissions.map((submission) => (
                  <div
                    key={submission.id}
                    className="flex items-center justify-between gap-4 rounded-2xl border border-border/70 bg-background px-4 py-3"
                    data-testid={`admin-recent-submission-row-${submission.id}`}
                  >
                    <div className="min-w-0">
                      <span className="font-semibold truncate">{submission.fullName}</span>
                      <span className="ml-2 text-xs text-muted-foreground truncate">
                        {submission.email}
                      </span>
                    </div>
                    <span className="shrink-0 text-xs text-muted-foreground">
                      {formatDate(submission.createdAt)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </AdminLayout>
  );
}
