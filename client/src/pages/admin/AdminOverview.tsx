import { type ReactNode, useId, useMemo } from "react";
import { Link } from "wouter";
import { AdminLayout } from "@/components/AdminLayout";
import { AdminErrorState } from "@/components/AdminStates";
import { useAdminPosts, useAdminSubmissions, getAdminErrorMessage } from "@/hooks/use-admin";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { Plus } from "lucide-react";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { AreaChart, Area, CartesianGrid, XAxis, YAxis } from "recharts";

function formatDate(value: Date | string) {
  return new Date(value).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

function dayKey(value: Date | string) {
  const d = new Date(value);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function Stat(props: { label: string; value: number; caption?: string; testid: string }) {
  return (
    <div className="bg-card px-5 py-4 sm:py-5" data-testid={props.testid}>
      <dt className="text-sm font-medium text-muted-foreground">{props.label}</dt>
      <dd className="mt-1 text-3xl font-bold tabular-nums" data-testid={`${props.testid}-value`}>
        {props.value}
      </dd>
      {props.caption ? <div className="mt-0.5 text-xs text-muted-foreground">{props.caption}</div> : null}
    </div>
  );
}

function Panel(props: {
  title: string;
  subtitle?: string;
  testid?: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <section
      className={cn("rounded-3xl border border-border/70 bg-card p-5 shadow-sm sm:p-6", props.className)}
      data-testid={props.testid}
    >
      <h2 className="font-sans text-base font-semibold">{props.title}</h2>
      {props.subtitle ? <p className="text-sm text-muted-foreground">{props.subtitle}</p> : null}
      {props.children}
    </section>
  );
}

function EmptyChartState(props: { message: string; testid: string }) {
  return (
    <div
      className="mt-4 rounded-2xl border border-border/70 bg-background p-6 text-center text-sm text-muted-foreground"
      data-testid={props.testid}
    >
      {props.message}
    </div>
  );
}

const submissionsOverTimeConfig = {
  count: {
    label: "Submissions",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig;

function OverviewSkeleton() {
  return (
    <div className="mt-8 grid gap-6" role="status" aria-label="Loading overview" data-testid="admin-overview-loading">
      <Skeleton className="h-[108px] rounded-3xl" />
      <div className="grid gap-6 lg:grid-cols-12">
        <Skeleton className="h-[336px] rounded-3xl lg:col-span-7" />
        <Skeleton className="h-[336px] rounded-3xl lg:col-span-5" />
      </div>
      <Skeleton className="h-40 rounded-3xl" />
    </div>
  );
}

export default function AdminOverview() {
  const gradientId = `submissionsFill-${useId().replace(/:/g, "")}`;
  const posts = useAdminPosts();
  const subs = useAdminSubmissions();

  const isLoading = posts.isLoading || subs.isLoading;
  const loadError = posts.error ?? subs.error;
  const isError = posts.isError || subs.isError;

  const postList = posts.data;
  const submissions = subs.data;

  const { totalPosts, published, drafts, totalSubmissions, thisWeek, recentSubmissions, submissionsOverTime, topServices } =
    useMemo(() => {
      const totalPosts = postList?.length ?? 0;
      const published = postList?.filter((p) => p.status === "published").length ?? 0;
      const drafts = postList?.filter((p) => p.status === "draft").length ?? 0;
      const all = submissions ?? [];

      const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
      const thisWeek = all.filter((s) => new Date(s.createdAt).getTime() >= oneWeekAgo).length;

      // The API already returns newest first; sort defensively, once.
      const recentSubmissions = [...all]
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 5);

      // Submissions over the last 30 days, bucketed by calendar day.
      const countsByDay = new Map<string, number>();
      const serviceCounts = new Map<string, number>();
      for (const s of all) {
        const key = dayKey(s.createdAt);
        countsByDay.set(key, (countsByDay.get(key) ?? 0) + 1);
        const service = s.serviceInterestedIn?.trim();
        if (service) serviceCounts.set(service, (serviceCounts.get(service) ?? 0) + 1);
      }
      const submissionsOverTime = Array.from({ length: 30 }, (_, i) => {
        const d = new Date();
        d.setHours(0, 0, 0, 0);
        d.setDate(d.getDate() - (29 - i));
        return { date: dayKey(d), label: formatDate(d), count: countsByDay.get(dayKey(d)) ?? 0 };
      });

      const topServices = Array.from(serviceCounts, ([service, count]) => ({ service, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 6);

      return {
        totalPosts,
        published,
        drafts,
        totalSubmissions: all.length,
        thisWeek,
        recentSubmissions,
        submissionsOverTime,
        topServices,
      };
    }, [postList, submissions]);

  const last30Total = submissionsOverTime.reduce((sum, d) => sum + d.count, 0);
  const topServiceMax = topServices[0]?.count ?? 1;
  const publishedPct = totalPosts > 0 ? Math.round((published / totalPosts) * 100) : 0;

  return (
    <AdminLayout>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold" data-testid="admin-overview-title">
            Overview
          </h1>
          <p className="mt-1 text-sm text-muted-foreground" data-testid="admin-overview-subtitle">
            Enquiries from the contact form and the state of your blog.
          </p>
        </div>
        <Button asChild className="min-h-11 rounded-xl md:min-h-9">
          <Link href="/admin/posts/new" data-testid="admin-overview-new-post">
            <Plus aria-hidden="true" />
            New post
          </Link>
        </Button>
      </div>

      {isLoading ? (
        <OverviewSkeleton />
      ) : isError ? (
        <AdminErrorState
          message={getAdminErrorMessage(loadError, "Could not load the overview.")}
          onRetry={() => {
            if (posts.isError) posts.refetch();
            if (subs.isError) subs.refetch();
          }}
          retrying={posts.isFetching || subs.isFetching}
          testid="admin-overview-error"
        />
      ) : (
        <>
          <dl
            className="mt-8 grid grid-cols-2 gap-px overflow-hidden rounded-3xl border border-border/70 bg-border/70 shadow-sm sm:grid-cols-4"
            data-testid="admin-stats-grid"
          >
            <Stat
              label="Submissions"
              value={totalSubmissions}
              caption={`${thisWeek} in the last 7 days`}
              testid="admin-stat-total-submissions"
            />
            <Stat label="Posts" value={totalPosts} testid="admin-stat-total-posts" />
            <Stat label="Published" value={published} testid="admin-stat-published" />
            <Stat label="Drafts" value={drafts} testid="admin-stat-drafts" />
          </dl>

          <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-12">
            <Panel
              title="Submissions over time"
              subtitle="Last 30 days"
              testid="admin-chart-submissions-over-time"
              className="lg:col-span-7"
            >
              {totalSubmissions === 0 ? (
                <EmptyChartState
                  message="No submissions yet. They will chart here as they arrive."
                  testid="admin-chart-submissions-over-time-empty"
                />
              ) : (
                <div
                  role="img"
                  aria-label={`Area chart of daily submissions over the last 30 days. ${last30Total} in total.`}
                >
                  <ChartContainer config={submissionsOverTimeConfig} className="mt-4 aspect-auto h-64 w-full">
                    <AreaChart data={submissionsOverTime} margin={{ left: 0, right: 8, top: 8, bottom: 0 }}>
                      <defs>
                        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="var(--color-count)" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="var(--color-count)" stopOpacity={0.02} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid vertical={false} stroke="hsl(var(--border))" strokeOpacity={0.6} />
                      <XAxis dataKey="label" tickLine={false} axisLine={false} interval={4} tickMargin={8} />
                      <YAxis tickLine={false} axisLine={false} width={28} allowDecimals={false} />
                      <ChartTooltip content={<ChartTooltipContent indicator="line" />} />
                      <Area
                        dataKey="count"
                        name="count"
                        type="monotone"
                        stroke="var(--color-count)"
                        strokeWidth={2}
                        fill={`url(#${gradientId})`}
                        isAnimationActive={false}
                      />
                    </AreaChart>
                  </ChartContainer>
                </div>
              )}
            </Panel>

            <Panel
              title="Top requested services"
              subtitle="Most common service interest"
              testid="admin-chart-top-services"
              className="lg:col-span-5"
            >
              {topServices.length === 0 ? (
                <EmptyChartState
                  message="No service requests yet."
                  testid="admin-chart-top-services-empty"
                />
              ) : (
                <ol className="mt-4 grid gap-3.5" data-testid="admin-top-services-list">
                  {topServices.map((entry) => (
                    <li key={entry.service}>
                      <div className="flex items-baseline justify-between gap-3 text-sm">
                        <span className="min-w-0 break-words">{entry.service}</span>
                        <span className="shrink-0 font-semibold tabular-nums">{entry.count}</span>
                      </div>
                      <div className="mt-1.5 h-2 rounded-full bg-muted" aria-hidden="true">
                        <div
                          className="h-full rounded-full bg-chart-1"
                          style={{ width: `${Math.max(4, (entry.count / topServiceMax) * 100)}%` }}
                        />
                      </div>
                    </li>
                  ))}
                </ol>
              )}
            </Panel>
          </div>

          <Panel
            title="Posts by status"
            subtitle="Where your content stands right now"
            testid="admin-chart-posts-by-status"
            className="mt-6"
          >
            {totalPosts === 0 ? (
              <EmptyChartState
                message="No posts yet. Published and draft counts will show here."
                testid="admin-chart-posts-by-status-empty"
              />
            ) : (
              <>
                <div
                  className="mt-4 flex h-3 overflow-hidden rounded-full bg-muted"
                  role="img"
                  aria-label={`${published} of ${totalPosts} posts published (${publishedPct}%), ${drafts} drafts`}
                >
                  <div className="h-full bg-chart-2" style={{ width: `${(published / totalPosts) * 100}%` }} />
                  <div className="h-full bg-muted-foreground/60" style={{ width: `${(drafts / totalPosts) * 100}%` }} />
                </div>
                <div className="mt-4 grid grid-cols-1 gap-x-8 gap-y-2.5 sm:grid-cols-2">
                  {[
                    { name: "published", label: "Published", value: published, swatch: "bg-chart-2" },
                    { name: "draft", label: "Draft", value: drafts, swatch: "bg-muted-foreground/60" },
                  ].map((entry) => (
                    <div
                      key={entry.name}
                      className="flex items-center justify-between gap-2 text-sm"
                      data-testid={`admin-posts-by-status-legend-${entry.name}`}
                    >
                      <span className="flex items-center gap-2 text-muted-foreground">
                        <span className={cn("h-2.5 w-2.5 rounded-full", entry.swatch)} aria-hidden="true" />
                        {entry.label}
                      </span>
                      <span className="font-semibold tabular-nums">
                        {entry.value}{" "}
                        <span className="font-normal text-muted-foreground">
                          {Math.round((entry.value / totalPosts) * 100)}%
                        </span>
                      </span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </Panel>

          <section className="mt-6 rounded-3xl border border-border/70 bg-card p-5 shadow-sm sm:p-6">
            <div className="flex items-center justify-between gap-4">
              <h2 className="font-sans text-base font-semibold" data-testid="admin-recent-submissions-title">
                Recent submissions
              </h2>
              <Link
                href="/admin/submissions"
                className="rounded-sm text-sm font-semibold text-admin-accent hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                data-testid="admin-recent-submissions-view-all"
              >
                View all
              </Link>
            </div>

            {recentSubmissions.length === 0 ? (
              <div
                className="mt-4 rounded-2xl border border-border/70 bg-background p-6 text-center text-sm text-muted-foreground"
                data-testid="admin-recent-submissions-empty"
              >
                No submissions yet.
              </div>
            ) : (
              <ul className="mt-4 grid gap-2" data-testid="admin-recent-submissions-list">
                {recentSubmissions.map((submission) => (
                  <li
                    key={submission.id}
                    className="flex items-center justify-between gap-4 rounded-2xl border border-border/70 bg-background px-4 py-3"
                    data-testid={`admin-recent-submission-row-${submission.id}`}
                  >
                    <div className="flex min-w-0 flex-1 flex-col gap-0.5 sm:flex-row sm:items-baseline sm:gap-2">
                      <span className="min-w-0 truncate font-semibold sm:flex-1">{submission.fullName}</span>
                      <span className="min-w-0 truncate text-xs text-muted-foreground sm:max-w-[40%] sm:shrink-0">
                        {submission.email}
                      </span>
                    </div>
                    <span className="shrink-0 text-xs text-muted-foreground">{formatDate(submission.createdAt)}</span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </>
      )}
    </AdminLayout>
  );
}
