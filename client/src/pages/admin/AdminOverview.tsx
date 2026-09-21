import { useId } from "react";
import { Link } from "wouter";
import { AdminLayout } from "@/components/AdminLayout";
import { useAdminPosts, useAdminSubmissions } from "@/hooks/use-admin";
import { FileText, CheckCircle2, FileEdit, Inbox, TrendingUp } from "lucide-react";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  type ChartConfig,
} from "@/components/ui/chart";
import {
  AreaChart,
  Area,
  CartesianGrid,
  XAxis,
  YAxis,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from "recharts";

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

function dayKey(value: Date | string) {
  const d = new Date(value);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

const submissionsOverTimeConfig = {
  count: {
    label: "Submissions",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig;

const postsByStatusConfig = {
  published: {
    label: "Published",
    color: "hsl(var(--chart-2))",
  },
  draft: {
    label: "Draft",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig;

const topServicesConfig = {
  count: {
    label: "Requests",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig;

export default function AdminOverview() {
  const gradientId = `submissionsFill-${useId().replace(/:/g, "")}`;
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

  // Chart A: submissions over the last 30 days, bucketed by calendar day.
  const last30Days = Array.from({ length: 30 }, (_, i) => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - (29 - i));
    return d;
  });
  const submissionCountsByDay = new Map<string, number>();
  for (const s of submissions ?? []) {
    const key = dayKey(s.createdAt);
    submissionCountsByDay.set(key, (submissionCountsByDay.get(key) ?? 0) + 1);
  }
  const submissionsOverTime = last30Days.map((d) => ({
    date: dayKey(d),
    label: formatDate(d),
    count: submissionCountsByDay.get(dayKey(d)) ?? 0,
  }));

  // Chart B: posts by status.
  const postsByStatus = [
    { name: "published", label: "Published", value: published },
    { name: "draft", label: "Draft", value: drafts },
  ];

  // Chart C: top requested services (top 6, descending by count).
  const serviceCounts = new Map<string, number>();
  for (const s of submissions ?? []) {
    const service = s.serviceInterestedIn?.trim();
    if (!service) continue;
    serviceCounts.set(service, (serviceCounts.get(service) ?? 0) + 1);
  }
  const topServices = Array.from(serviceCounts, ([service, count]) => ({ service, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 6);

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
            className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4"
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

          <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Chart A: Submissions over time */}
            <div
              className="rounded-3xl border border-border/70 bg-card p-6 shadow-sm lg:col-span-2"
              data-testid="admin-chart-submissions-over-time"
            >
              <h2 className="text-lg font-semibold">Submissions Over Time</h2>
              {totalSubmissions === 0 ? (
                <EmptyChartState message="No data yet." testid="admin-chart-submissions-over-time-empty" />
              ) : (
                <ChartContainer config={submissionsOverTimeConfig} className="mt-4 aspect-auto h-64 w-full">
                  <AreaChart data={submissionsOverTime} margin={{ left: 0, right: 8, top: 8, bottom: 0 }}>
                    <defs>
                      <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--color-count)" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="var(--color-count)" stopOpacity={0.02} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid vertical={false} stroke="hsl(var(--border))" strokeOpacity={0.6} />
                    <XAxis
                      dataKey="label"
                      tickLine={false}
                      axisLine={false}
                      interval={4}
                      tickMargin={8}
                    />
                    <YAxis tickLine={false} axisLine={false} width={28} allowDecimals={false} />
                    <ChartTooltip content={<ChartTooltipContent indicator="line" />} />
                    <Area
                      dataKey="count"
                      name="count"
                      type="monotone"
                      stroke="var(--color-count)"
                      strokeWidth={2}
                      fill={`url(#${gradientId})`}
                    />
                  </AreaChart>
                </ChartContainer>
              )}
            </div>

            {/* Chart B: Posts by status */}
            <div
              className="rounded-3xl border border-border/70 bg-card p-6 shadow-sm"
              data-testid="admin-chart-posts-by-status"
            >
              <h2 className="text-lg font-semibold">Posts by Status</h2>
              {totalPosts === 0 ? (
                <EmptyChartState message="No data yet." testid="admin-chart-posts-by-status-empty" />
              ) : (
                <ChartContainer config={postsByStatusConfig} className="mt-4 aspect-auto h-64 w-full">
                  <PieChart>
                    <ChartTooltip content={<ChartTooltipContent hideLabel />} />
                    <Pie
                      data={postsByStatus}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={56}
                      outerRadius={84}
                      strokeWidth={2}
                    >
                      {postsByStatus.map((entry) => (
                        <Cell key={entry.name} fill={`var(--color-${entry.name})`} />
                      ))}
                    </Pie>
                    <ChartLegend content={<ChartLegendContent nameKey="name" />} />
                  </PieChart>
                </ChartContainer>
              )}
            </div>

            {/* Chart C: Top requested services */}
            <div
              className="rounded-3xl border border-border/70 bg-card p-6 shadow-sm"
              data-testid="admin-chart-top-services"
            >
              <h2 className="text-lg font-semibold">Top Requested Services</h2>
              {topServices.length === 0 ? (
                <EmptyChartState message="No data yet." testid="admin-chart-top-services-empty" />
              ) : (
                <ChartContainer config={topServicesConfig} className="mt-4 aspect-auto h-64 w-full">
                  <BarChart data={topServices} layout="vertical" margin={{ left: 8, right: 16, top: 8, bottom: 0 }}>
                    <CartesianGrid horizontal={false} stroke="hsl(var(--border))" strokeOpacity={0.6} />
                    <XAxis type="number" tickLine={false} axisLine={false} allowDecimals={false} />
                    <YAxis
                      type="category"
                      dataKey="service"
                      tickLine={false}
                      axisLine={false}
                      width={110}
                      tick={{ fontSize: 11 }}
                    />
                    <ChartTooltip content={<ChartTooltipContent hideLabel />} />
                    <Bar dataKey="count" name="count" fill="var(--color-count)" radius={[0, 6, 6, 0]} />
                  </BarChart>
                </ChartContainer>
              )}
            </div>
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
                    <div className="flex min-w-0 flex-1 items-baseline gap-2">
                      <span className="min-w-0 flex-1 truncate font-semibold">{submission.fullName}</span>
                      <span className="max-w-[40%] shrink-0 truncate text-xs text-muted-foreground">
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
