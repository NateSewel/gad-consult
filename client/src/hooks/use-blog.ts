import { useQuery } from "@tanstack/react-query";
import { api, buildUrl, type BlogPostResponse } from "@shared/routes";

export function useBlogPosts() {
  return useQuery({
    queryKey: [api.blog.list.path],
    queryFn: async () => {
      const res = await fetch(api.blog.list.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch blog posts");
      return (await res.json()) as BlogPostResponse[];
    },
  });
}

export function useBlogPost(slug: string) {
  return useQuery({
    queryKey: [api.blog.get.path, slug],
    queryFn: async () => {
      const url = buildUrl(api.blog.get.path, { slug });
      const res = await fetch(url, { credentials: "include" });
      if (res.status === 404) return null;
      if (!res.ok) throw new Error("Failed to fetch post");
      return (await res.json()) as BlogPostResponse;
    },
    enabled: Boolean(slug),
  });
}
