import { type FormEvent, useEffect, useState } from "react";
import { useParams, useLocation } from "wouter";
import { AdminLayout } from "@/components/AdminLayout";
import { useAdminPost, useCreateAdminPost, useUpdateAdminPost } from "@/hooks/use-admin";
import type { BlogPostInput } from "@shared/routes";

function slugify(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

const emptyForm: BlogPostInput = {
  slug: "",
  title: "",
  excerpt: "",
  coverImageUrl: "",
  bodyMarkdown: "",
  status: "draft",
};

export function AdminPostForm(props: { mode: "create" | "edit" }) {
  const params = useParams<{ id: string }>();
  const [, navigate] = useLocation();
  const postId = props.mode === "edit" ? Number(params.id) : undefined;
  const { data: existing, isLoading } = useAdminPost(postId);
  const create = useCreateAdminPost();
  const update = useUpdateAdminPost(postId ?? -1);

  const [form, setForm] = useState<BlogPostInput>(emptyForm);
  const [slugTouched, setSlugTouched] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (existing) {
      setForm({
        slug: existing.slug,
        title: existing.title,
        excerpt: existing.excerpt,
        coverImageUrl: existing.coverImageUrl ?? "",
        bodyMarkdown: existing.bodyMarkdown,
        status: existing.status as "draft" | "published",
      });
      setSlugTouched(true);
    }
  }, [existing]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      // coverImageUrl is validated server-side as an optional, nullable URL
      // string; an empty string fails that validation, so send null when
      // blank. null (not undefined) is required: JSON.stringify drops
      // undefined keys entirely, and since the update schema is .partial(),
      // an absent key means "don't change this field" rather than "clear
      // it" -- so clearing an existing cover image on edit requires an
      // explicit null to make Drizzle's .set() write NULL.
      const payload: BlogPostInput = {
        ...form,
        coverImageUrl: form.coverImageUrl?.trim() ? form.coverImageUrl.trim() : null,
      };
      if (props.mode === "create") {
        await create.mutateAsync(payload);
      } else {
        await update.mutateAsync(payload);
      }
      navigate("/admin");
    } catch (err: any) {
      setError(err?.message ?? "Failed to save post.");
    }
  }

  if (props.mode === "edit" && isLoading) {
    return (
      <AdminLayout>
        <div className="text-sm text-muted-foreground">Loading…</div>
      </AdminLayout>
    );
  }

  const saving = create.isPending || update.isPending;

  return (
    <AdminLayout>
      <h1 className="text-2xl font-semibold" data-testid="admin-post-form-title">
        {props.mode === "create" ? "New post" : "Edit post"}
      </h1>

      <form onSubmit={onSubmit} className="mt-6 grid gap-5 max-w-2xl" data-testid="admin-post-form">
        <label className="grid gap-1.5">
          <div className="text-sm font-semibold">Title</div>
          <input
            required
            value={form.title}
            onChange={(e) => {
              const title = e.target.value;
              setForm((f) => ({
                ...f,
                title,
                slug: slugTouched ? f.slug : slugify(title),
              }));
            }}
            className="w-full rounded-2xl border-2 border-border/70 bg-background px-4 py-3 text-sm"
            data-testid="admin-post-form-title-input"
          />
        </label>

        <label className="grid gap-1.5">
          <div className="text-sm font-semibold">Slug</div>
          <input
            required
            value={form.slug}
            onChange={(e) => {
              setSlugTouched(true);
              setForm((f) => ({ ...f, slug: e.target.value }));
            }}
            className="w-full rounded-2xl border-2 border-border/70 bg-background px-4 py-3 text-sm font-mono"
            data-testid="admin-post-form-slug-input"
          />
        </label>

        <label className="grid gap-1.5">
          <div className="text-sm font-semibold">Excerpt</div>
          <textarea
            required
            rows={2}
            value={form.excerpt}
            onChange={(e) => setForm((f) => ({ ...f, excerpt: e.target.value }))}
            className="w-full rounded-2xl border-2 border-border/70 bg-background px-4 py-3 text-sm"
            data-testid="admin-post-form-excerpt-input"
          />
        </label>

        <label className="grid gap-1.5">
          <div className="text-sm font-semibold">Cover image URL (optional)</div>
          <input
            value={form.coverImageUrl ?? ""}
            onChange={(e) => setForm((f) => ({ ...f, coverImageUrl: e.target.value }))}
            className="w-full rounded-2xl border-2 border-border/70 bg-background px-4 py-3 text-sm"
            data-testid="admin-post-form-cover-input"
          />
        </label>

        <label className="grid gap-1.5">
          <div className="text-sm font-semibold">Body (Markdown)</div>
          <textarea
            required
            rows={14}
            value={form.bodyMarkdown}
            onChange={(e) => setForm((f) => ({ ...f, bodyMarkdown: e.target.value }))}
            className="w-full rounded-2xl border-2 border-border/70 bg-background px-4 py-3 text-sm font-mono"
            data-testid="admin-post-form-body-input"
          />
        </label>

        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={form.status === "published"}
            onChange={(e) => setForm((f) => ({ ...f, status: e.target.checked ? "published" : "draft" }))}
            data-testid="admin-post-form-published-checkbox"
          />
          <span className="text-sm font-semibold">Published</span>
        </label>

        {error ? (
          <div className="text-sm font-semibold text-destructive" data-testid="admin-post-form-error">
            {error}
          </div>
        ) : null}

        <button
          type="submit"
          disabled={saving}
          className="rounded-2xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-md disabled:opacity-60 justify-self-start"
          data-testid="admin-post-form-submit"
        >
          {saving ? "Saving…" : "Save post"}
        </button>
      </form>
    </AdminLayout>
  );
}
