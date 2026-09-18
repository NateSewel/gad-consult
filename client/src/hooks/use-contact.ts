import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api, type ContactCreateInput } from "@shared/routes";
import { z } from "zod";

function parseWithLogging<T>(schema: z.ZodSchema<T>, data: unknown, label: string): T {
  const result = schema.safeParse(data);
  if (!result.success) {
    console.error(`[Zod] ${label} validation failed:`, result.error.format());
    throw result.error;
  }
  return result.data;
}

export function useCreateContactSubmission() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: ContactCreateInput) => {
      const validated = api.contact.create.input.parse(input);
      const res = await fetch(api.contact.create.path, {
        method: api.contact.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validated),
        credentials: "include",
      });

      if (!res.ok) {
        if (res.status === 400) {
          const json = await res.json();
          const err = parseWithLogging(api.contact.create.responses[400], json, "contact.create.400");
          throw Object.assign(new Error(err.message), { field: err.field, status: 400 });
        }
        throw new Error("Failed to submit contact form");
      }

      return parseWithLogging(api.contact.create.responses[201], await res.json(), "contact.create.201");
    },
    onSuccess: () => {
      // No list endpoint; keep future-proof invalidations minimal but explicit.
      qc.invalidateQueries({ queryKey: [api.public.siteConfig.path] });
    },
  });
}
