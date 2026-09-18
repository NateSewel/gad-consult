import { useParams, Link } from "wouter";
import ReactMarkdown from "react-markdown";
import { MetaManager } from "@/components/MetaManager";
import { SiteHeader } from "@/components/SiteHeader";
import { useBlogPost } from "@/hooks/use-blog";
import { useSiteConfig } from "@/hooks/use-public";
import { ArrowLeft, CalendarDays } from "lucide-react";

function formatDate(value: Date | string | null) {
  if (!value) return "";
  return new Date(value).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
}

export default function BlogPost() {
  const params = useParams<{ slug: string }>();
  const { data: site } = useSiteConfig();
  const { data: post, isLoading } = useBlogPost(params.slug);

  const jsonLd = post
    ? {
        "@context": "https://schema.org",
        "@type": "Article",
        headline: post.title,
        description: post.excerpt,
        image: post.coverImageUrl || undefined,
        datePublished: post.publishedAt || undefined,
        author: { "@type": "Person", name: "GAD Legal Consult" },
      }
    : undefined;

  return (
    <div className="min-h-screen bg-background">
      <MetaManager
        title={post ? `${post.title} | GAD Legal Consult` : "Blog | GAD Legal Consult"}
        description={post?.excerpt ?? "GAD Legal Consult blog."}
        canonicalPath={`/blog/${params.slug}`}
        jsonLd={jsonLd}
      />

      <SiteHeader site={site ?? null} onSchedule={() => {}} />

      <main className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
        <Link
          href="/blog"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-secondary hover:underline"
          data-testid="blog-post-back"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to blog
        </Link>

        {isLoading ? (
          <div className="mt-8 text-sm text-muted-foreground" data-testid="blog-post-loading">
            Loading…
          </div>
        ) : !post ? (
          <div
            className="mt-8 rounded-3xl border border-border/70 bg-card p-8 text-center"
            data-testid="blog-post-not-found"
          >
            <div className="text-lg font-semibold">Post not found</div>
            <p className="mt-2 text-sm text-muted-foreground">This post may have been unpublished or moved.</p>
          </div>
        ) : (
          <article className="mt-6" data-testid="blog-post-article">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <CalendarDays className="h-3.5 w-3.5" />
              {formatDate(post.publishedAt)}
            </div>
            <h1 className="mt-3 text-3xl sm:text-4xl font-bold leading-[1.1]" data-testid="blog-post-title">
              {post.title}
            </h1>
            {post.coverImageUrl ? (
              <img
                src={post.coverImageUrl}
                alt={post.title}
                className="mt-6 w-full rounded-3xl border border-border/70 object-cover"
              />
            ) : null}
            <div className="prose prose-neutral dark:prose-invert mt-8 max-w-none" data-testid="blog-post-body">
              <ReactMarkdown>{post.bodyMarkdown}</ReactMarkdown>
            </div>
          </article>
        )}
      </main>
    </div>
  );
}
