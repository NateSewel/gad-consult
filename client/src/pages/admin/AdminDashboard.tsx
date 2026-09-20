import { Link } from "wouter";
import { AdminLayout } from "@/components/AdminLayout";
import { useAdminPosts, useDeleteAdminPost } from "@/hooks/use-admin";

export default function AdminDashboard() {
  const { data: posts, isLoading } = useAdminPosts();
  const del = useDeleteAdminPost();

  return (
    <AdminLayout>
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold" data-testid="admin-dashboard-title">
          Posts
        </h1>
        <Link
          href="/admin/posts/new"
          className="rounded-2xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-md"
          data-testid="admin-new-post-link"
        >
          New post
        </Link>
      </div>

      {isLoading ? (
        <div className="mt-8 text-sm text-muted-foreground">Loading…</div>
      ) : !posts || posts.length === 0 ? (
        <div
          className="mt-8 rounded-3xl border border-border/70 bg-card p-8 text-center text-sm text-muted-foreground"
          data-testid="admin-posts-empty"
        >
          No posts yet.
        </div>
      ) : (
        <div className="mt-8 grid gap-3" data-testid="admin-posts-list">
          {posts.map((post) => (
            <div
              key={post.id}
              className="flex items-center justify-between gap-4 rounded-2xl border border-border/70 bg-card p-4"
              data-testid={`admin-post-row-${post.id}`}
            >
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-semibold truncate">{post.title}</span>
                  <span
                    className={
                      post.status === "published"
                        ? "rounded-full bg-secondary/15 px-2 py-0.5 text-xs font-semibold text-secondary"
                        : "rounded-full bg-muted px-2 py-0.5 text-xs font-semibold text-muted-foreground"
                    }
                  >
                    {post.status}
                  </span>
                </div>
                <div className="mt-1 text-xs text-muted-foreground truncate">/blog/{post.slug}</div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Link
                  href={`/admin/posts/${post.id}/edit`}
                  className="rounded-xl border border-border/70 px-3 py-2 text-xs font-semibold hover:bg-muted/70"
                  data-testid={`admin-post-edit-${post.id}`}
                >
                  Edit
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm(`Delete "${post.title}"? This can't be undone.`)) {
                      del.mutate(post.id);
                    }
                  }}
                  className="rounded-xl border border-destructive/40 px-3 py-2 text-xs font-semibold text-destructive hover:bg-destructive/10"
                  data-testid={`admin-post-delete-${post.id}`}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </AdminLayout>
  );
}
