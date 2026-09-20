import { Link } from "wouter";
import { MetaManager } from "@/components/MetaManager";
import { SiteHeader } from "@/components/SiteHeader";
import { useBlogPosts } from "@/hooks/use-blog";
import { useSiteConfig } from "@/hooks/use-public";
import { CalendarDays } from "lucide-react";

function formatDate(value: Date | string | null) {
  if (!value) return "";
  return new Date(value).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
}

export default function Blog() {
  const { data: site } = useSiteConfig();
  const { data: posts, isLoading, isError } = useBlogPosts();

  return (
    <div className="min-h-screen bg-background">
      <MetaManager
        title="Blog | GAD Legal Consult"
        description="Insights and updates from GAD Legal Consult on corporate law, compliance, and practical legal strategy."
        canonicalPath="/blog"
      />

      <SiteHeader site={site ?? null} onSchedule={() => {}} />

      <main className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
        <h1 className="text-4xl sm:text-5xl font-bold leading-[1.05]" data-testid="blog-title">
          Insights & updates
        </h1>
        <p className="mt-4 text-muted-foreground max-w-2xl" data-testid="blog-subtitle">
          Practical notes on corporate law, compliance, and running a business in Nigeria.
        </p>

        {isLoading ? (
          <div className="mt-10 text-sm text-muted-foreground" data-testid="blog-loading">
            Loading posts…
          </div>
        ) : isError ? (
          <div
            className="mt-10 rounded-3xl border border-border/70 bg-card p-8 text-center text-sm text-muted-foreground"
            data-testid="blog-error"
          >
            Something went wrong loading posts. Please try again shortly.
          </div>
        ) : posts && posts.length > 0 ? (
          <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 gap-6" data-testid="blog-grid">
            {posts.map((post) => (
              <Link
                key={post.slug}
                href={`/blog/${post.slug}`}
                className="group rounded-3xl border border-border/70 bg-card overflow-hidden shadow-sm transition-all duration-300 hover:shadow-lg"
                data-testid={`blog-card-${post.slug}`}
              >
                {post.coverImageUrl ? (
                  <div className="aspect-[16/9] overflow-hidden">
                    <img
                      src={post.coverImageUrl}
                      alt={post.title}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      loading="lazy"
                    />
                  </div>
                ) : null}
                <div className="p-5">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <CalendarDays className="h-3.5 w-3.5" />
                    {formatDate(post.publishedAt)}
                  </div>
                  <div className="mt-2 text-lg font-semibold leading-tight">{post.title}</div>
                  <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{post.excerpt}</p>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div
            className="mt-10 rounded-3xl border border-border/70 bg-card p-8 text-center text-sm text-muted-foreground"
            data-testid="blog-empty"
          >
            No posts published yet — check back soon.
          </div>
        )}
      </main>
    </div>
  );
}
