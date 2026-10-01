import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, type BlogPostInput, type BlogPostUpdateInput, type BlogPostResponse, type SubmissionResponse } from "@shared/routes";
import { apiRequest, queryClient } from "@/lib/queryClient";

const SESSION_EXPIRED = "Your session has expired. Sign in again.";

/** Mark the session as signed out so AdminLayout redirects to the login page. */
function markSignedOut() {
  queryClient.setQueryData([api.admin.me.path], false);
}

/**
 * Turn an error thrown by apiRequest (`409: {"message":"..."}`) or a query into
 * a sentence a person can read. Never returns the raw status/JSON string.
 */
export function getAdminErrorMessage(err: unknown, fallback: string): string {
  const raw = err instanceof Error ? err.message : "";
  const match = raw.match(/^(\d{3}): ([\s\S]*)$/);
  if (!match) {
    // Browser network failures surface as "Failed to fetch" / "Load failed".
    const isNetwork = /failed to fetch|load failed|networkerror/i.test(raw);
    return raw && !isNetwork ? raw : fallback;
  }
  const [, status, body] = match;
  if (status === "401") return SESSION_EXPIRED;
  try {
    const parsed = JSON.parse(body);
    if (typeof parsed?.message === "string" && parsed.message) return parsed.message;
  } catch {
    // body was not JSON; fall through
  }
  return fallback;
}

function onMutationError(err: unknown) {
  if (err instanceof Error && err.message.startsWith("401:")) markSignedOut();
}

/** GET an admin endpoint. A 401 flips the cached session so the UI redirects to login. */
async function adminGet<T>(url: string, failure: string): Promise<T> {
  const res = await fetch(url, { credentials: "include" });
  if (res.status === 401) {
    markSignedOut();
    throw new Error(SESSION_EXPIRED);
  }
  if (!res.ok) throw new Error(failure);
  return (await res.json()) as T;
}

export function useAdminMe() {
  return useQuery({
    queryKey: [api.admin.me.path],
    queryFn: async () => {
      const res = await fetch(api.admin.me.path, { credentials: "include" });
      if (res.ok) return true;
      // Only a 401 means "signed out". Anything else (5xx, offline) is an
      // error the layout can show with a retry, not a silent redirect.
      if (res.status === 401) return false;
      throw new Error("Could not check your session.");
    },
  });
}

export function useAdminLogin() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: { email: string; password: string }) => {
      await apiRequest("POST", api.admin.login.path, input);
    },
    onSuccess: () => {
      // Write the known-good value into the cache synchronously so that
      // AdminLayout's remount (right after navigate("/admin")) reads
      // authenticated === true immediately, instead of a stale cached
      // `false` that invalidateQueries alone would only mark stale
      // (it doesn't force a refetch without an active observer, and
      // AdminLayout's effect would fire on the stale value before the
      // background refetch resolves, bouncing back to /admin/login).
      qc.setQueryData([api.admin.me.path], true);
      // Also invalidate for eventual revalidation against the server.
      qc.invalidateQueries({ queryKey: [api.admin.me.path] });
    },
  });
}

export function useAdminLogout() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      await apiRequest("POST", api.admin.logout.path);
    },
    onSuccess: () => {
      // Drop cached admin data so it can't be read back on a shared machine.
      qc.removeQueries({
        predicate: (q) =>
          typeof q.queryKey[0] === "string" &&
          q.queryKey[0].startsWith("/api/admin/") &&
          q.queryKey[0] !== api.admin.me.path,
      });
      qc.setQueryData([api.admin.me.path], false);
    },
  });
}

export function useAdminPosts() {
  return useQuery({
    queryKey: [api.admin.posts.list.path],
    queryFn: () => adminGet<BlogPostResponse[]>(api.admin.posts.list.path, "Could not load posts."),
  });
}

export function useAdminPost(id: number | undefined) {
  return useQuery({
    queryKey: [api.admin.posts.list.path, id],
    queryFn: () => adminGet<BlogPostResponse>(`/api/admin/posts/${id}`, "Could not load this post."),
    enabled: typeof id === "number" && !Number.isNaN(id),
  });
}

export function useCreateAdminPost() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: BlogPostInput) => {
      const res = await apiRequest("POST", api.admin.posts.create.path, input);
      return (await res.json()) as BlogPostResponse;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [api.admin.posts.list.path] });
    },
    onError: onMutationError,
  });
}

export function useUpdateAdminPost(id: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: BlogPostUpdateInput) => {
      const res = await apiRequest("PUT", `/api/admin/posts/${id}`, input);
      return (await res.json()) as BlogPostResponse;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [api.admin.posts.list.path] });
    },
    onError: onMutationError,
  });
}

export function useDeleteAdminPost() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/admin/posts/${id}`);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [api.admin.posts.list.path] });
    },
    onError: onMutationError,
  });
}

export function useAdminSubmissions() {
  return useQuery({
    queryKey: [api.admin.submissions.list.path],
    queryFn: () =>
      adminGet<SubmissionResponse[]>(api.admin.submissions.list.path, "Could not load submissions."),
  });
}
