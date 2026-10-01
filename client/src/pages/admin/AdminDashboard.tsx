import { useEffect, useRef, useState } from "react";
import { Link } from "wouter";
import { AdminLayout } from "@/components/AdminLayout";
import { AdminErrorState, AdminListSkeleton } from "@/components/AdminStates";
import { useAdminPosts, useDeleteAdminPost, getAdminErrorMessage } from "@/hooks/use-admin";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";
import { Plus } from "lucide-react";
import type { BlogPostResponse } from "@shared/routes";

function formatDate(value: Date | string) {
  return new Date(value).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default function AdminDashboard() {
  const { data: posts, isLoading, isError, error, refetch, isFetching } = useAdminPosts();
  const del = useDeleteAdminPost();
  const { toast } = useToast();
  // `pendingDelete` keeps the last target after close so the dialog text
  // doesn't blank out during its exit animation; `dialogOpen` drives visibility.
  const [pendingDelete, setPendingDelete] = useState<BlogPostResponse | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  // The deleted row (and the button focus returned to) disappears, so park
  // focus on the page heading once the list has updated.
  const headingRef = useRef<HTMLHeadingElement>(null);
  const focusHeadingAfterDelete = useRef(false);

  useEffect(() => {
    if (focusHeadingAfterDelete.current) {
      focusHeadingAfterDelete.current = false;
      headingRef.current?.focus();
    }
  }, [posts?.length]);

  function askDelete(post: BlogPostResponse) {
    setPendingDelete(post);
    setDialogOpen(true);
  }

  function confirmDelete() {
    const post = pendingDelete;
    setDialogOpen(false);
    if (!post) return;
    del.mutate(post.id, {
      onSuccess: () => {
        focusHeadingAfterDelete.current = true;
        toast({ title: "Post deleted", description: `"${post.title}" was removed.` });
      },
      onError: (err) =>
        toast({
          title: "Could not delete post",
          description: getAdminErrorMessage(err, "Something went wrong. Try again."),
          variant: "destructive",
        }),
    });
  }

  return (
    <AdminLayout>
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <h1
            ref={headingRef}
            tabIndex={-1}
            className="text-2xl font-semibold focus:outline-none"
            data-testid="admin-dashboard-title"
          >
            Posts
          </h1>
          {posts && posts.length > 0 ? (
            <span
              className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-semibold text-muted-foreground"
              data-testid="admin-posts-count"
            >
              {posts.length}
            </span>
          ) : null}
        </div>
        <Button asChild className="min-h-11 rounded-xl md:min-h-9">
          <Link href="/admin/posts/new" data-testid="admin-new-post-link">
            <Plus aria-hidden="true" />
            New post
          </Link>
        </Button>
      </div>

      {isLoading ? (
        <AdminListSkeleton rows={4} testid="admin-posts-loading" />
      ) : isError ? (
        <AdminErrorState
          message={getAdminErrorMessage(error, "Could not load posts.")}
          onRetry={() => refetch()}
          retrying={isFetching}
          testid="admin-posts-error"
        />
      ) : !posts || posts.length === 0 ? (
        <div
          className="mt-8 rounded-3xl border border-border/70 bg-card p-8 text-center"
          data-testid="admin-posts-empty"
        >
          <p className="text-sm text-muted-foreground">No posts yet. Write your first one to publish it on the blog.</p>
          <Button asChild variant="outline" className="mt-4 min-h-11 rounded-xl md:min-h-9">
            <Link href="/admin/posts/new">Write a post</Link>
          </Button>
        </div>
      ) : (
        <ul className="mt-8 grid gap-3" data-testid="admin-posts-list">
          {posts.map((post) => {
            const isPublished = post.status === "published";
            const deleting = del.isPending && del.variables === post.id;
            return (
              <li
                key={post.id}
                className="flex flex-col gap-3 rounded-2xl border border-border/70 bg-card p-4 sm:flex-row sm:items-center sm:justify-between sm:gap-4"
                data-testid={`admin-post-row-${post.id}`}
              >
                <div className="min-w-0">
                  <div className="flex min-w-0 items-center gap-2">
                    <span className="min-w-0 truncate font-semibold">{post.title}</span>
                    <span
                      className={cn(
                        "shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold",
                        isPublished ? "bg-secondary/15 text-admin-navy" : "bg-muted text-muted-foreground",
                      )}
                      data-testid={`admin-post-status-${post.id}`}
                    >
                      {isPublished ? "Published" : "Draft"}
                    </span>
                  </div>
                  <div className="mt-1 truncate text-xs text-muted-foreground">
                    /blog/{post.slug}
                    <span aria-hidden="true"> · </span>
                    {isPublished && post.publishedAt
                      ? `Published ${formatDate(post.publishedAt)}`
                      : `Updated ${formatDate(post.updatedAt)}`}
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  {isPublished ? (
                    <Button asChild variant="outline" size="sm" className="min-h-11 rounded-xl md:min-h-8">
                      <a
                        href={`/blog/${post.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`View "${post.title}" on the site (opens in a new tab)`}
                        data-testid={`admin-post-view-${post.id}`}
                      >
                        View
                      </a>
                    </Button>
                  ) : null}
                  <Button asChild variant="outline" size="sm" className="min-h-11 rounded-xl md:min-h-8">
                    <Link
                      href={`/admin/posts/${post.id}/edit`}
                      aria-label={`Edit "${post.title}"`}
                      data-testid={`admin-post-edit-${post.id}`}
                    >
                      Edit
                    </Link>
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    // aria-disabled (not disabled) so the dialog can return focus here
                    // while the delete is still in flight.
                    aria-disabled={deleting || undefined}
                    onClick={() => {
                      if (!deleting) askDelete(post);
                    }}
                    aria-label={`Delete "${post.title}"`}
                    className="min-h-11 rounded-xl text-admin-danger aria-disabled:cursor-not-allowed aria-disabled:opacity-60 md:min-h-8"
                    data-testid={`admin-post-delete-${post.id}`}
                  >
                    {deleting ? "Deleting…" : "Delete"}
                  </Button>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <AlertDialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <AlertDialogContent data-testid="admin-delete-dialog">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this post?</AlertDialogTitle>
            <AlertDialogDescription>
              "{pendingDelete?.title}" will be removed permanently
              {pendingDelete?.status === "published" ? " and disappear from the blog" : ""}. This can't be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="admin-delete-cancel">Keep post</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="border-transparent bg-[hsl(0_72%_40%)] text-white hover:bg-[hsl(0_72%_40%)]"
              data-testid="admin-delete-confirm"
            >
              Delete post
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
}
