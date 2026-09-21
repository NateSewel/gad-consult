import { useMemo, useState } from "react";
import { Link } from "wouter";
import { MetaManager } from "@/components/MetaManager";
import { SiteHeader } from "@/components/SiteHeader";
import { useBlogPosts } from "@/hooks/use-blog";
import { useSiteConfig } from "@/hooks/use-public";
import { Input } from "@/components/ui/input";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { CalendarDays, Search } from "lucide-react";

const POSTS_PER_PAGE = 6;

function formatDate(value: Date | string | null) {
  if (!value) return "";
  return new Date(value).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
}

export default function Blog() {
  const { data: site } = useSiteConfig();
  const { data: posts, isLoading, isError } = useBlogPosts();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const filteredPosts = useMemo(() => {
    if (!posts) return [];
    const query = search.trim().toLowerCase();
    if (!query) return posts;
    return posts.filter(
      (post) =>
        post.title.toLowerCase().includes(query) ||
        post.excerpt.toLowerCase().includes(query),
    );
  }, [posts, search]);

  const totalPages = Math.max(1, Math.ceil(filteredPosts.length / POSTS_PER_PAGE));
  const currentPage = Math.min(page, totalPages);
  const paginatedPosts = filteredPosts.slice(
    (currentPage - 1) * POSTS_PER_PAGE,
    currentPage * POSTS_PER_PAGE,
  );

  function handleSearchChange(value: string) {
    setSearch(value);
    setPage(1);
  }

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

        {!isLoading && !isError && posts && posts.length > 0 ? (
          <div className="mt-8 relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search posts…"
              value={search}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-9"
              data-testid="blog-search"
            />
          </div>
        ) : null}

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
        ) : filteredPosts.length > 0 ? (
          <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 gap-6" data-testid="blog-grid">
            {paginatedPosts.map((post) => (
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
            {search
              ? "No posts match your search."
              : "No posts published yet — check back soon."}
          </div>
        )}

        {totalPages > 1 && (
          <Pagination className="mt-10">
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  aria-disabled={currentPage === 1}
                  className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                  onClick={(e) => {
                    e.preventDefault();
                    if (currentPage > 1) setPage(currentPage - 1);
                  }}
                  data-testid="blog-pagination-prev"
                />
              </PaginationItem>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                <PaginationItem key={pageNum}>
                  <PaginationLink
                    isActive={pageNum === currentPage}
                    className="cursor-pointer"
                    onClick={(e) => {
                      e.preventDefault();
                      setPage(pageNum);
                    }}
                    data-testid={`blog-pagination-page-${pageNum}`}
                  >
                    {pageNum}
                  </PaginationLink>
                </PaginationItem>
              ))}
              <PaginationItem>
                <PaginationNext
                  aria-disabled={currentPage === totalPages}
                  className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                  onClick={(e) => {
                    e.preventDefault();
                    if (currentPage < totalPages) setPage(currentPage + 1);
                  }}
                  data-testid="blog-pagination-next"
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        )}
      </main>
    </div>
  );
}
