import { useQuery } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { z } from "zod";

function parseWithLogging<T>(schema: z.ZodSchema<T>, data: unknown, label: string): T {
  const result = schema.safeParse(data);
  if (!result.success) {
    console.error(`[Zod] ${label} validation failed:`, result.error.format());
    throw result.error;
  }
  return result.data;
}

export function useSiteConfig() {
  return useQuery({
    queryKey: [api.public.siteConfig.path],
    queryFn: async () => {
      const res = await fetch(api.public.siteConfig.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch site configuration");
      const json = await res.json();
      return parseWithLogging(api.public.siteConfig.responses[200], json, "public.siteConfig");
    },
  });
}

export function useSeo(slug: string) {
  return useQuery({
    queryKey: [api.public.seo.path, slug],
    queryFn: async () => {
      const url = buildUrl(api.public.seo.path, { slug });
      const res = await fetch(url, { credentials: "include" });
      if (res.status === 404) return null;
      if (!res.ok) throw new Error("Failed to fetch SEO content");
      const json = await res.json();
      return parseWithLogging(api.public.seo.responses[200], json, "public.seo");
    },
  });
}
