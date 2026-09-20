import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, type BlogPostInput, type BlogPostUpdateInput, type BlogPostResponse } from "@shared/routes";
import { apiRequest } from "@/lib/queryClient";

export function useAdminMe() {
  return useQuery({
    queryKey: [api.admin.me.path],
    queryFn: async () => {
      const res = await fetch(api.admin.me.path, { credentials: "include" });
      return res.ok;
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
      qc.invalidateQueries({ queryKey: [api.admin.me.path] });
    },
  });
}

export function useAdminPosts() {
  return useQuery({
    queryKey: [api.admin.posts.list.path],
    queryFn: async () => {
      const res = await fetch(api.admin.posts.list.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch posts");
      return (await res.json()) as BlogPostResponse[];
    },
  });
}

export function useAdminPost(id: number | undefined) {
  return useQuery({
    queryKey: [api.admin.posts.list.path, id],
    queryFn: async () => {
      const res = await fetch(`/api/admin/posts/${id}`, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch post");
      return (await res.json()) as BlogPostResponse;
    },
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
  });
}
