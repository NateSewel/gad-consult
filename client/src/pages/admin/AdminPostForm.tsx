import { type FormEvent, type MouseEvent, type ReactNode, useEffect, useRef, useState } from "react";
import { Link, useParams, useLocation } from "wouter";
import { AdminLayout } from "@/components/AdminLayout";
import { AdminErrorState, adminFieldClass } from "@/components/AdminStates";
import { useAdminPost, useCreateAdminPost, useUpdateAdminPost, getAdminErrorMessage } from "@/hooks/use-admin";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
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
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { ArrowLeft } from "lucide-react";
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

// Unsaved edits are mirrored to sessionStorage so an expired session (which
// bounces to login) or an accidental reload doesn't lose the text.
const draftKey = (mode: string, id?: number) => `gad_admin_post_draft:${mode}:${id ?? "new"}`;

function readDraft(key: string): BlogPostInput | null {
  try {
    const raw = sessionStorage.getItem(key);
    return raw ? (JSON.parse(raw) as BlogPostInput) : null;
  } catch {
    return null;
  }
}

function writeDraft(key: string, value: BlogPostInput | null) {
  try {
    if (value) sessionStorage.setItem(key, JSON.stringify(value));
    else sessionStorage.removeItem(key);
  } catch {
    /* storage unavailable: drafts just aren't kept */
  }
}

const SLUG_PATTERN = "[a-z0-9]+(?:-[a-z0-9]+)*";

function Field(props: { id: string; label: string; hint?: string; children: ReactNode }) {
  return (
    <div className="grid gap-1.5">
      <Label htmlFor={props.id} className="text-sm font-semibold">
        {props.label}
      </Label>
      {props.children}
      {props.hint ? (
        <p id={`${props.id}-hint`} className="text-xs text-muted-foreground">
          {props.hint}
        </p>
      ) : null}
    </div>
  );
}

export function AdminPostForm(props: { mode: "create" | "edit" }) {
  const params = useParams<{ id: string }>();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const postId = props.mode === "edit" ? Number(params.id) : undefined;
  const { data: existing, isLoading, isError, error: loadError, refetch } = useAdminPost(postId);
  const create = useCreateAdminPost();
  const update = useUpdateAdminPost(postId ?? -1);

  const [form, setForm] = useState<BlogPostInput>(emptyForm);
  const [slugTouched, setSlugTouched] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const errorRef = useRef<HTMLDivElement>(null);
  const key = draftKey(props.mode, postId);
  const [restored, setRestored] = useState(false);
  const [leaveOpen, setLeaveOpen] = useState(false);
  const [leaveTo, setLeaveTo] = useState("/admin/posts");

  useEffect(() => {
    // Offer back any unsaved text that survived a session expiry or reload.
    const draft = readDraft(key);
    if (draft && (props.mode === "create" || existing)) {
      setForm(draft);
      setSlugTouched(true);
      setDirty(true);
      setRestored(true);
      return;
    }
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
      setDirty(false);
    }
  }, [existing, key]);

  // Keep the stored draft in step with edits.
  useEffect(() => {
    if (dirty) writeDraft(key, form);
  }, [dirty, form, key]);

  // Warn before a refresh/close discards unsaved edits.
  useEffect(() => {
    if (!dirty) return;
    const warn = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  // Move focus to the error so screen reader and keyboard users land on it.
  useEffect(() => {
    if (error) errorRef.current?.focus();
  }, [error]);

  function patch(next: Partial<BlogPostInput>) {
    setDirty(true);
    setForm((f) => ({ ...f, ...next }));
  }

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
      setDirty(false);
      writeDraft(key, null);
      toast({
        title: payload.status === "published" ? "Post saved and published" : "Draft saved",
        description: payload.title,
      });
      navigate("/admin/posts");
    } catch (err) {
      setError(getAdminErrorMessage(err, "Could not save the post. Check your connection and try again."));
    }
  }

  // Intercept in-app leave links while there are unsaved edits.
  function guardLeave(e: MouseEvent<HTMLAnchorElement>) {
    if (!dirty) return;
    e.preventDefault();
    setLeaveTo("/admin/posts");
    setLeaveOpen(true);
  }

  function discardAndLeave() {
    writeDraft(key, null);
    setDirty(false);
    setLeaveOpen(false);
    navigate(leaveTo);
  }

  const backLink = (
    <Link
      href="/admin/posts"
      onClick={guardLeave}
      className="inline-flex items-center gap-1.5 rounded-sm text-sm font-semibold text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      data-testid="admin-post-form-back"
    >
      <ArrowLeft className="h-4 w-4" aria-hidden="true" />
      Posts
    </Link>
  );

  if (props.mode === "edit" && isLoading) {
    return (
      <AdminLayout>
        {backLink}
        <div className="mt-6 grid max-w-2xl gap-5" role="status" aria-label="Loading post" data-testid="admin-post-form-loading">
          <Skeleton className="h-8 w-40" />
          <Skeleton className="h-11 rounded-xl" />
          <Skeleton className="h-11 rounded-xl" />
          <Skeleton className="h-24 rounded-xl" />
          <Skeleton className="h-64 rounded-xl" />
        </div>
      </AdminLayout>
    );
  }

  if (props.mode === "edit" && (isError || !existing)) {
    return (
      <AdminLayout>
        {backLink}
        <AdminErrorState
          message={getAdminErrorMessage(loadError, "This post could not be loaded. It may have been deleted.")}
          onRetry={() => refetch()}
          testid="admin-post-form-load-error"
        />
      </AdminLayout>
    );
  }

  const saving = create.isPending || update.isPending;
  const errorId = "admin-post-form-error";

  return (
    <AdminLayout>
      {backLink}
      <h1 className="mt-3 text-2xl font-semibold" data-testid="admin-post-form-title">
        {props.mode === "create" ? "New post" : "Edit post"}
      </h1>

      {restored ? (
        <div
          role="status"
          className="mt-4 flex max-w-2xl flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-muted/60 px-4 py-3 text-sm"
          data-testid="admin-post-form-restored"
        >
          <span>Restored your unsaved changes from earlier.</span>
          <button
            type="button"
            onClick={() => {
              writeDraft(key, null);
              setRestored(false);
              setDirty(false);
              if (existing) {
                setForm({
                  slug: existing.slug,
                  title: existing.title,
                  excerpt: existing.excerpt,
                  coverImageUrl: existing.coverImageUrl ?? "",
                  bodyMarkdown: existing.bodyMarkdown,
                  status: existing.status as "draft" | "published",
                });
              } else {
                setForm(emptyForm);
                setSlugTouched(false);
              }
            }}
            className="rounded-sm font-semibold underline underline-offset-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            data-testid="admin-post-form-discard-draft"
          >
            Discard
          </button>
        </div>
      ) : null}

      <form onSubmit={onSubmit} className="mt-6 grid max-w-2xl gap-5" data-testid="admin-post-form">
        <Field id="post-title" label="Title">
          <Input
            id="post-title"
            required
            value={form.title}
            onChange={(e) => {
              const title = e.target.value;
              patch({ title, ...(slugTouched ? {} : { slug: slugify(title) }) });
            }}
            className={adminFieldClass}
            data-testid="admin-post-form-title-input"
          />
        </Field>

        <Field
          id="post-slug"
          label="Slug"
          hint={`Web address: /blog/${form.slug || "your-slug"}. Lowercase letters, numbers and hyphens.`}
        >
          <Input
            id="post-slug"
            required
            pattern={SLUG_PATTERN}
            title="Lowercase letters, numbers and hyphens, for example my-first-post"
            maxLength={200}
            autoCapitalize="none"
            spellCheck={false}
            value={form.slug}
            onChange={(e) => {
              setSlugTouched(true);
              patch({ slug: e.target.value });
            }}
            aria-describedby="post-slug-hint"
            className={cn(adminFieldClass, "font-mono")}
            data-testid="admin-post-form-slug-input"
          />
        </Field>

        <Field id="post-excerpt" label="Excerpt" hint="One or two sentences shown on the blog list and in search results.">
          <Textarea
            id="post-excerpt"
            required
            rows={2}
            value={form.excerpt}
            onChange={(e) => patch({ excerpt: e.target.value })}
            aria-describedby="post-excerpt-hint"
            className={adminFieldClass}
            data-testid="admin-post-form-excerpt-input"
          />
        </Field>

        <Field id="post-cover" label="Cover image URL (optional)" hint="Paste a full image address starting with https://.">
          <Input
            id="post-cover"
            type="url"
            inputMode="url"
            value={form.coverImageUrl ?? ""}
            onChange={(e) => patch({ coverImageUrl: e.target.value })}
            aria-describedby="post-cover-hint"
            className={adminFieldClass}
            data-testid="admin-post-form-cover-input"
          />
        </Field>

        <Field id="post-body" label="Body (Markdown)" hint="Use # for headings, ** for bold and - for lists.">
          <Textarea
            id="post-body"
            required
            rows={14}
            value={form.bodyMarkdown}
            onChange={(e) => patch({ bodyMarkdown: e.target.value })}
            aria-describedby="post-body-hint"
            className={cn(adminFieldClass, "font-mono")}
            data-testid="admin-post-form-body-input"
          />
        </Field>

        <div className="flex items-start gap-3">
          <Checkbox
            id="post-published"
            checked={form.status === "published"}
            onCheckedChange={(checked) => patch({ status: checked === true ? "published" : "draft" })}
            aria-describedby="post-published-hint"
            className="mt-0.5 h-5 w-5"
            data-testid="admin-post-form-published-checkbox"
          />
          <div className="grid gap-0.5">
            <Label htmlFor="post-published" className="text-sm font-semibold">
              Published
            </Label>
            <p id="post-published-hint" className="text-xs text-muted-foreground">
              {form.status === "published"
                ? "Visible on the public blog once you save."
                : "Saved as a draft. Only you can see it."}
            </p>
          </div>
        </div>

        {error ? (
          <div
            ref={errorRef}
            id={errorId}
            role="alert"
            tabIndex={-1}
            className="rounded-xl border border-destructive/40 bg-card px-4 py-3 text-sm font-semibold text-admin-danger focus:outline-none focus:ring-2 focus:ring-ring"
            data-testid="admin-post-form-error"
          >
            {error}
          </div>
        ) : null}

        <div className="flex flex-wrap items-center gap-3">
          <Button
            type="submit"
            disabled={saving}
            className="min-h-11 rounded-xl px-5"
            data-testid="admin-post-form-submit"
          >
            {saving ? "Saving…" : "Save post"}
          </Button>
          <Button asChild variant="ghost" className="min-h-11 rounded-xl">
            <Link href="/admin/posts" onClick={guardLeave} data-testid="admin-post-form-cancel">
              Cancel
            </Link>
          </Button>
        </div>
      </form>

      <AlertDialog open={leaveOpen} onOpenChange={setLeaveOpen}>
        <AlertDialogContent data-testid="admin-leave-dialog">
          <AlertDialogHeader>
            <AlertDialogTitle>Leave without saving?</AlertDialogTitle>
            <AlertDialogDescription>Your changes to this post will be lost.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="admin-leave-keep">Keep editing</AlertDialogCancel>
            <AlertDialogAction onClick={discardAndLeave} data-testid="admin-leave-discard">
              Discard changes
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
}
