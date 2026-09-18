import { useMutation } from "@tanstack/react-query";
import { api, type NewsletterSubscribeInput } from "@shared/routes";
import { z } from "zod";

function parseWithLogging<T>(schema: z.ZodSchema<T>, data: unknown, label: string): T {
  const result = schema.safeParse(data);
  if (!result.success) {
    console.error(`[Zod] ${label} validation failed:`, result.error.format());
    throw result.error;
  }
  return result.data;
}

export function useNewsletterSubscribe() {
  return useMutation({
    mutationFn: async (input: NewsletterSubscribeInput) => {
      const validated = api.newsletter.subscribe.input.parse(input);
      const res = await fetch(api.newsletter.subscribe.path, {
        method: api.newsletter.subscribe.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validated),
        credentials: "include",
      });

      if (!res.ok) {
        if (res.status === 409) {
          const err = parseWithLogging(api.newsletter.subscribe.responses[409], await res.json(), "newsletter.subscribe.409");
          throw Object.assign(new Error(err.message), { status: 409 });
        }
        if (res.status === 400) {
          const err = parseWithLogging(api.newsletter.subscribe.responses[400], await res.json(), "newsletter.subscribe.400");
          throw Object.assign(new Error(err.message), { field: err.field, status: 400 });
        }
        throw new Error("Failed to subscribe");
      }

      return parseWithLogging(api.newsletter.subscribe.responses[201], await res.json(), "newsletter.subscribe.201");
    },
  });
}
